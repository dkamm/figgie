package app

import (
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"log"
	"time"
)

type Hub struct {
	botManager        *BotManager
	register          chan WSClientRegister
	unregister        chan *WSClient
	ticker            *time.Ticker
	receive           chan WSClientMessage
	clients           map[string][]*WSClient // userId -> []*WSClient
	rooms             map[string]*Room
	disconnectTimeout time.Duration
}

func NewHub() *Hub {
	hub := &Hub{
		ticker:            time.NewTicker(time.Second),
		receive:           make(chan WSClientMessage, 256),
		register:          make(chan WSClientRegister),
		unregister:        make(chan *WSClient),
		clients:           make(map[string][]*WSClient),
		rooms:             make(map[string]*Room),
		disconnectTimeout: 2 * time.Second,
	}
	hub.botManager = NewBotManager(hub)
	return hub
}

func (h *Hub) sendToUsersClientsInRoom(roomId string, userIds []string, message []byte) {
	for _, userId := range userIds {
		if userId == "" || userId[:3] == "bot" {
			continue
		}
		clients, ok := h.clients[userId]
		if !ok {
			log.Println("something went wrong- clients not found")
			continue
		}
		for _, client := range clients {
			if client.roomId == roomId {
				client.send <- message
			}
		}
	}
}

func (h *Hub) sendToUserClientsInRoom(roomId string, userId string, message []byte) {
	h.sendToUsersClientsInRoom(roomId, []string{userId}, message)
}

func (h *Hub) pickNewAdmin(room *Room) {
	var nextAdmin *User
	for _, seat := range room.seats() {
		if seat != "" && seat[:3] != "bot" {
			nextAdmin = room.users[seat]
			break
		}
	}
	if nextAdmin == nil {
		for _, spectator := range room.spectators() {
			if spectator != "" {
				nextAdmin = room.users[spectator]
				break
			}
		}
	}
	if nextAdmin == nil {
		return
	}
	nextAdmin.Admin = true

	event := NewEvent(room.id, &UserPromotedPayload{UserId: nextAdmin.Id})
	message, _ := json.Marshal(event)
	h.sendToUsersClientsInRoom(room.id, room.activeUserIds(), message)
}

func (h *Hub) Run() {
	go h.botManager.Run()

	h.rooms["test"] = NewRoom("test", RoomConfig{Name: "test", Private: false, MaxSpectators: 10, GameTime: 4 * 60})

	for {
		select {
		case r := <-h.register:
			client := r.client
			clients, ok := h.clients[client.userId]
			if !ok {
				h.clients[client.userId] = []*WSClient{client}
			} else {
				h.clients[client.userId] = append(clients, client)
			}
			log.Printf("client registered for %s", client.userId)
			r.done <- true

		case client := <-h.unregister:
			log.Printf("client unregistered for %v", client.userId)
			clients, ok := h.clients[client.userId]
			if !ok {
				log.Printf("clients not found for %s", client.userId)
				continue
			}
			if client.roomId == "" {
				continue
			}
			otherClients := make([]*WSClient, 0, len(clients))
			for _, c := range clients {
				if c != client {
					otherClients = append(otherClients, c)
				}
			}
			h.clients[client.userId] = otherClients

			// Check if this client was the last one in the room
			roomClientCount := 0
			for _, c := range otherClients {
				if c.roomId == client.roomId {
					roomClientCount++
				}
			}
			if roomClientCount > 0 {
				continue
			}
			room, ok := h.rooms[client.roomId]
			if !ok {
				log.Printf("room not found for %s", client.roomId)
				continue
			}
			user, ok := room.users[client.userId]
			if !ok {
				continue
			}
			user.DisconnectedAt = time.Now()

		case m := <-h.receive:
			c := &Command{}

			err := json.Unmarshal(m.message, &c)
			if err != nil {
				fmt.Println(err)
				continue
			}

			log.Printf("userId=%s, roomId=%s, commandType=%s", m.client.userId, m.client.roomId, c.Type)

			switch c.Type {

			case ListRoomsType:
				p := &ListRoomsPayload{}
				json.Unmarshal(c.Payload, &p)
				summaries := make([]RoomSummary, 0, len(h.rooms))
				for _, room := range h.rooms {
					if !room.config.Private {
						adminName := ""
						admin := room.admin()
						if admin != nil {
							adminName = admin.Name
						}
						numPlayers := 0
						for _, seat := range room.seats() {
							if seat != "" {
								numPlayers++
							}
						}
						numSpectators := 0
						for _, spectator := range room.spectators() {
							if spectator != "" {
								numSpectators++
							}
						}
						summaries = append(summaries, RoomSummary{
							RoomId:        room.id,
							RoomName:      room.config.Name,
							AdminName:     adminName,
							NumPlayers:    numPlayers,
							NumSpectators: numSpectators,
							MaxSpectators: room.config.MaxSpectators,
						})
					}
				}

				page := p.Page
				maxPage := len(summaries) / p.PageSize
				if page > maxPage {
					page = maxPage
				}

				start := page * p.PageSize
				end := (page + 1) * p.PageSize
				if end > len(summaries) {
					end = len(summaries)
				}

				data, _ := json.Marshal(summaries[start:end])
				event := &PaginatedEvent{
					Type:     RoomsListedType,
					Total:    len(summaries),
					Page:     page,
					PageSize: p.PageSize,
					Data:     data,
				}
				message, _ := json.Marshal(event)
				m.client.send <- message

			case CreateRoomType:
				p := &CreateRoomPayload{}
				json.Unmarshal(c.Payload, &p)
				id := "room_" + uuid.New().String()
				room := NewRoom(id, p.Config)
				h.rooms[id] = room
				user := NewUser(m.client.userId, p.UserName, 1000, 0, -1, true)
				room.users[m.client.userId] = user

				m.client.roomId = room.id

				event := NewEvent(room.id,
					&RoomCreatedPayload{})
				message, _ := json.Marshal(event)
				m.client.send <- message

			case JoinRoomType:
				room, ok := h.rooms[c.RoomId]
				if !ok {
					event := NewEvent(c.RoomId, &JoinFailedPayload{Reason: "This room does not exist"})
					message, _ := json.Marshal(event)
					m.client.send <- message
					continue
				}

				activeUsers := room.activeUsers()

				if len(activeUsers) >= 4+room.config.MaxSpectators {
					event := NewEvent(c.RoomId, &JoinFailedPayload{Reason: "This room is full"})
					message, _ := json.Marshal(event)
					m.client.send <- message
					continue
				}

				m.client.roomId = c.RoomId
				user, ok := room.users[m.client.userId]
				if !ok {
					// Add user to the room if he isn't already there
					p := &JoinRoomPayload{}
					json.Unmarshal(c.Payload, p)
					name := p.Name
					if name == "" {
						name = RandomUserName()
					}
					seat := -1
					spectatorSeat := -1
					inGame := room.game != nil && !room.game.Done
					if !inGame {
						seat = room.getNextIndex(room.seats())
					}
					if seat == -1 {
						spectatorSeat = room.getNextIndex(room.spectators())
					}
					if seat == -1 && spectatorSeat == -1 {
						log.Printf("something went wrong. could not assign seat room=%s", room.id)
						continue
					}

					numActiveNonBotUsers := 0
					for _, u := range activeUsers {
						if u.Id[:3] != "bot" {
							numActiveNonBotUsers++
						}
					}

					user = NewUser(
						m.client.userId,
						name,
						1000,
						seat,
						spectatorSeat,
						numActiveNonBotUsers == 0,
					)
					room.users[user.Id] = user
				} else {
					// Reset disconnectedAt/left fields for this user in case of a reconnect
					user.DisconnectedAt = time.Time{}
					user.Left = false
				}

				g := room.game
				isPlaying := false

				if g != nil && !g.Done {
					_, isPlaying = g.findPlayer(user.Id)
				}

				var message []byte
				if isPlaying {
					// Send
					event := NewEvent(
						c.RoomId,
						&JoinedRoomRestrictedPayload{
							UserId:     user.Id,
							Users:      room.allUsers(),
							Config:     room.config,
							Seats:      room.seats(),
							Spectators: room.spectators(),
							Game:       room.game.restrictedView(user.Id),
						})
					message, _ = json.Marshal(event)
				} else {
					event := NewEvent(
						c.RoomId,
						&JoinedRoomPayload{
							UserId:     user.Id,
							Users:      room.allUsers(),
							Config:     room.config,
							Seats:      room.seats(),
							Spectators: room.spectators(),
							Game:       room.game,
						})
					message, _ = json.Marshal(event)
				}
				m.client.send <- message

				// Notify other users in the room that a new user has joined
				otherUserIds := room.otherActiveUserIds(user.Id)
				if len(otherUserIds) > 0 {
					payload := UserJoinedPayload(*user)
					event := NewEvent(c.RoomId, &payload)
					message, _ := json.Marshal(event)
					h.sendToUsersClientsInRoom(c.RoomId, otherUserIds, message)
				}

			case LeaveRoomType:
				room, ok := h.rooms[c.RoomId]
				if !ok {
					continue
				}

				user, ok := room.users[m.client.userId]
				if !ok {
					continue
				}

				// Remove this client from the room
				m.client.roomId = ""

				var p LeaveRoomPayload
				json.Unmarshal(c.Payload, &p)

				clients := h.clients[m.client.userId]
				numRoomClients := 0
				for _, c := range clients {
					if c.roomId != "" {
						numRoomClients++
					}
				}
				// Don't remove the user from the room if he has other clients in the room and didn't force disconnect all of them
				if numRoomClients > 0 && !p.DisconnectAllClients {
					continue
				}

				// Shift spectators down if user was a spectator
				if user.SpectatorSeat > 0 {
					room.shiftSpectatorsDown(user.SpectatorSeat)
				}

				// Mark the user as having left the room
				user.Left = true

				// Notify the user's other clients that the user has left
				event := NewEvent(c.RoomId, &LeftRoomPayload{})
				message, _ := json.Marshal(event)
				h.sendToUserClientsInRoom(c.RoomId, m.client.userId, message)

				// Move the user's clients out of the room
				for _, client := range clients {
					client.roomId = ""
				}

				// Notify other users in the room that a user has left
				otherUserIds := room.otherActiveUserIds(m.client.userId)
				event = NewEvent(c.RoomId, &UserLeftPayload{UserId: m.client.userId})
				message, _ = json.Marshal(event)
				h.sendToUsersClientsInRoom(c.RoomId, otherUserIds, message)

				if user.Admin {
					// Promote another user to be admin if the admin left
					h.pickNewAdmin(room)
				}

			case SendMessageType:
				room, ok := h.rooms[c.RoomId]
				if !ok {
					continue
				}
				p := &SendMessagePayload{}
				json.Unmarshal(c.Payload, p)
				event := NewEvent(c.RoomId, &UserMessagedPayload{
					UserId:  m.client.userId,
					Message: p.Message,
				})
				message, _ := json.Marshal(event)

				user, ok := room.users[m.client.userId]
				if !ok {
					continue
				}

				if room.game != nil && !room.game.Done && user.Seat == -1 {
					// Only send to spectators if game is in progress and user is spectator
					h.sendToUsersClientsInRoom(c.RoomId, room.spectators(), message)
				} else {
					// Send to everyone otherwise
					h.sendToUsersClientsInRoom(c.RoomId, room.activeUserIds(), message)
				}

			case TakeSeatType:
				room, ok := h.rooms[c.RoomId]
				if !ok {
					continue
				}

				if room.game != nil && !room.game.Done {
					// Can't take a seat while game is in progress
					continue
				}

				p := &TakeSeatPayload{}
				json.Unmarshal(c.Payload, p)
				if p.Seat > 3 {
					log.Printf("invalid seat: %d", p.Seat)
					continue
				}
				seats := room.seats()
				if seats[p.Seat] != "" {
					log.Printf("seat %d is already taken", p.Seat)
					continue
				}
				user, ok := room.users[m.client.userId]
				if !ok {
					continue
				}
				spectatorSeat := user.Seat
				if spectatorSeat >= 0 {
					// User was a spectator so shift the spectators that are after him down
					room.shiftSpectatorsDown(spectatorSeat)
				}
				user.Seat = p.Seat
				user.SpectatorSeat = -1

				event := NewEvent(c.RoomId, &UserTookSeatPayload{
					UserId: m.client.userId,
					Seat:   p.Seat,
				})

				message, _ := json.Marshal(event)
				h.sendToUsersClientsInRoom(c.RoomId, room.activeUserIds(), message)

			case ChangeNameType:
				room, ok := h.rooms[c.RoomId]
				if !ok {
					continue
				}
				p := &ChangeNamePayload{}
				json.Unmarshal(c.Payload, p)
				user, ok := room.users[m.client.userId]
				if !ok {
					continue
				}
				user.Name = p.Name
				event := NewEvent(c.RoomId, &UserChangedNamePayload{
					UserId: m.client.userId,
					Name:   user.Name,
				})

				message, _ := json.Marshal(event)
				h.sendToUsersClientsInRoom(c.RoomId, room.activeUserIds(), message)

			case StartSpectatingType:
				room, ok := h.rooms[c.RoomId]
				if !ok {
					continue
				}

				p := &StartSpectatingPayload{}
				json.Unmarshal(c.Payload, p)

				user, ok := room.users[m.client.userId]
				if !ok {
					continue
				}
				user.Seat = -1
				user.SpectatorSeat = p.Seat

				event := NewEvent(c.RoomId, &UserStartedSpectatingPayload{
					UserId: m.client.userId,
					Seat:   user.SpectatorSeat,
				})

				message, _ := json.Marshal(event)
				h.sendToUsersClientsInRoom(c.RoomId, room.activeUserIds(), message)

			case StartGameType:
				room, ok := h.rooms[c.RoomId]
				if !ok {
					continue
				}

				id := 1
				if room.game != nil {
					id = room.game.Id + 1
				}

				players := make([]string, 0, len(room.seats()))
				for _, userId := range room.seats() {
					players = append(players, userId)
				}
				g := NewGame(
					id,
					players,
					room.users,
				)
				room.game = g

				g.Start()

				end := time.NewTimer(time.Duration(room.config.GameTime) * time.Second)

				// Send end game command after time is up
				go func() {
					<-end.C

					payload, _ := json.Marshal(&EndGamePayload{GameId: g.Id})
					command := &Command{RoomId: c.RoomId, Type: EndGameType, Payload: payload}

					message, _ := json.Marshal(command)

					// TODO: revisit this when implementing bots
					client := &WSClient{
						userId: "",
						roomId: c.RoomId,
					}

					h.receive <- WSClientMessage{
						message: message,
						client:  client,
					}
				}()

				// Send restricted view of game to each player
				for _, player := range g.Players {
					if player == "" {
						continue
					}
					rv := g.restrictedView(player)
					payload := GameStartedRestrictedPayload(*rv)
					event := NewEvent(c.RoomId, &payload)
					if player[:3] == "bot" {
						// Send to bot
						h.botManager.events <- BotEvent{
							event:  event,
							userId: player,
						}
					} else {
						message, _ := json.Marshal(event)
						h.sendToUserClientsInRoom(c.RoomId, player, message)
					}
				}

				// Send full game to spectators
				payload := GameStartedPayload(*g)
				event := NewEvent(c.RoomId, &payload)
				message, _ := json.Marshal(event)
				h.sendToUsersClientsInRoom(c.RoomId, room.spectators(), message)

			case EndGameType:
				room, ok := h.rooms[c.RoomId]
				if !ok {
					continue
				}
				p := &EndGamePayload{}
				json.Unmarshal(c.Payload, p)
				g := room.game
				if g == nil || g.Id != p.GameId {
					continue
				}
				g.End()

				// Send full game results to everyone
				event := NewEvent(c.RoomId, &GameEndedPayload{
					Id:        g.Id,
					Hands:     g.Hands,
					Earnings:  g.Earnings,
					Bonuses:   g.Bonuses,
					GoalSuit:  g.GoalSuit,
					GoalCount: g.GoalCount,
				})
				message, _ := json.Marshal(event)
				h.sendToUsersClientsInRoom(c.RoomId, room.activeUserIds(), message)

				// Send to bots if applicable
				if len(room.bots()) > 0 {
					h.botManager.events <- BotEvent{
						event: event,
					}
				}

			case SendOrderType:
				room, ok := h.rooms[c.RoomId]
				if !ok {
					continue
				}

				p := &SendOrderPayload{}
				json.Unmarshal(c.Payload, p)

				g := room.game

				player, ok := g.findPlayer(m.client.userId)

				if !ok {
					continue
				}

				resp := g.HandleOrder(player, p.Price, p.Suit, p.Side)

				bots := room.bots()

				switch resp.Type {
				case Added:
					event := NewEvent(c.RoomId, &OrderAddedPayload{
						Player: player,
						Price:  p.Price,
						Suit:   p.Suit,
						Side:   p.Side,
					})
					g.Events = append(g.Events, event)
					message, _ := json.Marshal(event)
					h.sendToUsersClientsInRoom(c.RoomId, room.activeUserIds(), message)
					// Send to bots if applicable
					if len(bots) > 0 {
						h.botManager.events <- BotEvent{
							event: event,
						}
					}
				case Traded:
					price := resp.restingPrice
					var bidder, asker int
					if p.Side == 0 {
						bidder = player
						asker = resp.restingPlayer
					} else {
						bidder = resp.restingPlayer
						asker = player
					}
					event := NewEvent(c.RoomId, &OrderTradedPayload{
						Bidder: bidder,
						Asker:  asker,
						Side:   p.Side,
						Suit:   p.Suit,
						Price:  price,
					})
					g.Events = append(g.Events, event)
					message, _ := json.Marshal(event)
					h.sendToUsersClientsInRoom(c.RoomId, room.activeUserIds(), message)
					// Send to bots if applicable
					if len(bots) > 0 {
						h.botManager.events <- BotEvent{
							event: event,
						}
					}
				case Rejected:
					event := NewEvent(c.RoomId, &OrderRejectedPayload{
						Reason: resp.rejectReason,
					})
					message, _ := json.Marshal(event)
					h.sendToUserClientsInRoom(c.RoomId, m.client.userId, message)
				}

			case PromoteUserType:

				room, ok := h.rooms[c.RoomId]
				if !ok {
					continue
				}

				user, ok := room.users[m.client.userId]

				if !user.Admin {
					continue
				}

				p := &PromoteUserPayload{}
				json.Unmarshal(c.Payload, p)

				nextAdmin, ok := room.users[p.UserId]

				if !ok {
					continue
				}

				if nextAdmin.Left {
					continue
				}

				user.Admin = false
				nextAdmin.Admin = true

				event := NewEvent(c.RoomId, &UserPromotedPayload{UserId: nextAdmin.Id})
				message, _ := json.Marshal(event)
				h.sendToUsersClientsInRoom(c.RoomId, room.activeUserIds(), message)

			case KickUserType:
				room, ok := h.rooms[c.RoomId]
				if !ok {
					continue
				}

				user, ok := room.users[m.client.userId]

				if !user.Admin {
					continue
				}

				p := &KickUserPayload{}
				json.Unmarshal(c.Payload, p)

				targetUser, ok := room.users[p.UserId]

				if !ok {
					continue
				}

				if targetUser.Admin {
					// Admin can't kick himself
					continue
				}

				targetUser.Left = true

				event := NewEvent(c.RoomId, &UserKickedPayload{UserId: p.UserId})
				message, _ := json.Marshal(event)
				h.sendToUserClientsInRoom(c.RoomId, p.UserId, message)
				h.sendToUsersClientsInRoom(c.RoomId, room.activeUserIds(), message)

			case PingType:
				event := NewEvent(c.RoomId, &PongPayload{Time: time.Now().Unix() * 1000})
				message, _ := json.Marshal(event)
				m.client.send <- message

			case AddBotType:
				room, ok := h.rooms[c.RoomId]
				if !ok {
					continue
				}

				user, ok := room.users[m.client.userId]

				if !user.Admin {
					continue
				}

				p := &AddBotPayload{}
				json.Unmarshal(c.Payload, p)

				if room.seats()[p.Seat] != "" {
					// seat is already taken. shouldn't get here
					continue
				}

				botId := "bot_" + uuid.New().String()

				bot := NewUser(
					botId,
					RandomBotName(),
					1000,
					p.Seat,
					-1,
					false,
				)
				room.users[bot.Id] = bot

				log.Printf("adding bot %v: name=%v seat=%v", bot.Id, bot.Name, bot.Seat)

				h.botManager.register <- BotRegister{
					userId:   bot.Id,
					roomId:   room.id,
					playerId: p.Seat,
				}

				event := NewEvent(c.RoomId, &BotAddedPayload{
					Id:     bot.Id,
					Name:   bot.Name,
					Seat:   p.Seat,
					Money:  bot.Money,
					Rebuys: bot.Rebuys,
					Left:   bot.Left,
				})
				message, _ := json.Marshal(event)
				h.sendToUsersClientsInRoom(c.RoomId, room.activeUserIds(), message)

			case RemoveBotType:
				room, ok := h.rooms[c.RoomId]
				if !ok {
					continue
				}

				user, ok := room.users[m.client.userId]

				if !user.Admin {
					continue
				}

				p := &RemoveBotPayload{}
				json.Unmarshal(c.Payload, p)

				bot, ok := room.users[p.UserId]
				if !ok {
					continue
				}
				bot.Left = true

				h.botManager.unregister <- BotUnregister{
					userId: bot.Id,
					roomId: room.id,
				}

				event := NewEvent(c.RoomId, &BotRemovedPayload{
					UserId: bot.Id,
				})
				message, _ := json.Marshal(event)
				h.sendToUsersClientsInRoom(c.RoomId, room.activeUserIds(), message)

			}

		case <-h.ticker.C:
			now := time.Now()

			// Check for disconnected users
			for _, room := range h.rooms {
				for _, user := range room.users {
					if !user.Left && !user.DisconnectedAt.IsZero() && now.Sub(user.DisconnectedAt) > h.disconnectTimeout {

						log.Printf("disconnecting %v from %v", user.Id, room.id)

						user.Left = true

						// Take the user's clients out of the room
						clients, ok := h.clients[user.Id]
						if ok {
							for _, client := range clients {
								client.roomId = ""
							}
						}

						// Notify other users in the room that the user has left
						otherUserIds := room.otherActiveUserIds(user.Id)
						event := NewEvent(room.id, &UserLeftPayload{UserId: user.Id})
						message, _ := json.Marshal(event)
						h.sendToUsersClientsInRoom(room.id, otherUserIds, message)

						if user.Admin {
							// Promote new user as admin if user was admin
							user.Admin = false
							h.pickNewAdmin(room)
						}
					}
				}
			}

		}

	}
}
