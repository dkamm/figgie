package app

import (
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"log"
	"time"
)

type Hub struct {
	register          chan WSClientRegister
	unregister        chan *WSClient
	ticker            *time.Ticker
	receive           chan WSClientMessage
	clients           map[string][]*WSClient // userId -> []*WSClient
	rooms             map[string]*Room
	disconnectTimeout time.Duration
}

func NewHub() *Hub {
	return &Hub{
		ticker:            time.NewTicker(time.Second),
		receive:           make(chan WSClientMessage, 256),
		register:          make(chan WSClientRegister),
		unregister:        make(chan *WSClient),
		clients:           make(map[string][]*WSClient),
		rooms:             make(map[string]*Room),
		disconnectTimeout: 2 * time.Second,
	}
}

func (h *Hub) sendToUsersClientsInRoom(roomId string, userIds []string, message []byte) {
	for _, userId := range userIds {
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

func (h *Hub) Run() {

	h.rooms["test"] = NewRoom("test", RoomConfig{Name: "test", Private: false, MaxSpectators: 10})

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
						summaries = append(summaries, RoomSummary{
							RoomId:        room.id,
							RoomName:      room.config.Name,
							AdminName:     adminName,
							NumSpectators: len(room.activeUserIds()),
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
				user := NewUser(m.client.userId, p.UserName, 0, -1, true)
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
					seat := room.getNextIndex(room.seats())
					spectatorSeat := -1
					if seat == -1 {
						spectatorSeat = room.getNextIndex(room.spectators())
					}
					if seat == -1 && spectatorSeat == -1 {
						log.Printf("something went wrong. could not assign seat room=%s", room.id)
						continue
					}
					user = NewUser(
						m.client.userId,
						name,
						seat,
						spectatorSeat,
						len(activeUsers) == 0,
					)
					room.users[user.Id] = user
				} else {
					// Reset disconnectedAt/left fields for this user in case of a reconnect
					user.DisconnectedAt = time.Time{}
					user.Left = false
				}

				// Send the current room state to the client
				event := NewEvent(
					c.RoomId,
					&JoinedRoomPayload{
						UserId:     user.Id,
						Users:      room.activeUsers(),
						Config:     room.config,
						Seats:      room.seats(),
						Spectators: room.spectators(),
					})
				message, _ := json.Marshal(event)
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
				m.client.roomId = c.RoomId

				user, ok := room.users[m.client.userId]
				if !ok {
					continue
				}

				// Shift spectators down if user was a spectator
				if user.SpectatorSeat > 0 {
					room.shiftSpectatorsDown(user.SpectatorSeat)
				}

				// Mark the user as having left the room
				user.Left = true

				// Notify the user's clients that the user has left
				event := NewEvent(c.RoomId, &LeftRoomPayload{})
				message, _ := json.Marshal(event)
				h.sendToUserClientsInRoom(c.RoomId, m.client.userId, message)

				// Move the user's clients out of the room
				clients, _ := h.clients[m.client.userId]
				for _, client := range clients {
					client.roomId = ""
				}

				// Notify other users in the room that a user has left
				otherUserIds := room.otherActiveUserIds(m.client.userId)
				event = NewEvent(c.RoomId, &UserLeftPayload{UserId: m.client.userId})
				message, _ = json.Marshal(event)
				h.sendToUsersClientsInRoom(c.RoomId, otherUserIds, message)

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
				h.sendToUsersClientsInRoom(c.RoomId, room.activeUserIds(), message)

			case TakeSeatType:
				room, ok := h.rooms[c.RoomId]
				if !ok {
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
				user, ok := room.users[m.client.userId]
				spectators := room.spectators()
				spectatorSeat := room.getNextIndex(spectators)
				if spectatorSeat == -1 {
					log.Printf("next spectator seat is wrong! room=%s", room.id)
					continue
				}
				user.Seat = -1
				user.SpectatorSeat = spectatorSeat

				event := NewEvent(c.RoomId, &UserStartedSpectatingPayload{
					UserId: m.client.userId,
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
						user.Left = true

						// Notify other users in the room that a user has left
						otherUserIds := room.otherActiveUserIds(user.Id)
						event := NewEvent(room.id, &UserLeftPayload{UserId: user.Id})
						message, _ := json.Marshal(event)
						h.sendToUsersClientsInRoom(room.id, otherUserIds, message)
					}
				}
			}

		}

	}
}
