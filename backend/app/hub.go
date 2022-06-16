package app

import (
	"encoding/json"
	"fmt"
	"log"
	"time"
)

type Hub struct {
	register          chan *WSClient
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
		register:          make(chan *WSClient),
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

	h.rooms["test"] = NewRoom("test")

	for {
		select {
		case client := <-h.register:
			clients, ok := h.clients[client.userId]
			if !ok {
				h.clients[client.userId] = []*WSClient{client}
			} else {
				h.clients[client.userId] = append(clients, client)
			}
			log.Printf("new client registered for %s", client.userId)

		case client := <-h.unregister:
			clients, ok := h.clients[client.userId]
			if !ok {
				log.Printf("clients not found for %s", client.userId)
				return
			}
			if client.roomId == "" {
				return
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
				return
			}
			room, ok := h.rooms[client.roomId]
			if !ok {
				log.Printf("room not found for %s", client.roomId)
				return
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

			case JoinRoomType:
				room, ok := h.rooms[c.RoomId]
				if !ok {
					event := NewEvent(c.RoomId, &JoinFailedPayload{Reason: "This room does not exist"})
					message, _ := json.Marshal(event)
					m.client.send <- message
					return
				}
				m.client.roomId = c.RoomId
				user, ok := room.users[m.client.userId]
				if !ok {
					p := &JoinRoomPayload{}
					json.Unmarshal(c.Payload, p)
					name := p.Name
					if name == "" {
						name = RandomUserName()
					}
					user = NewUser(
						m.client.userId,
						name,
						len(room.activeUsers()) == 0,
					)
					room.users[user.Id] = user

					// Sent the current room state to the client
					event := NewEvent(
						c.RoomId,
						&JoinedRoomPayload{
							UserId: user.Id,
							Users:  room.activeUsers(),
						})
					message, _ := json.Marshal(event)
					m.client.send <- message
				} else {
					// Reset disconnectedAt/left fields for this user in case of a reconnect
					user.DisconnectedAt = time.Time{}
					user.Left = false
				}

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
					return
				}
				m.client.roomId = c.RoomId

				user, ok := room.users[m.client.userId]
				if !ok {
					return
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
					return
				}
				p := &SendMessagePayload{}
				json.Unmarshal(c.Payload, p)
				event := NewEvent(c.RoomId, &UserMessagedPayload{
					UserId:  m.client.userId,
					Message: p.Message,
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
