package app

import (
	"time"
)

type Room struct {
	id        string
	config    RoomConfig
	users     map[string]*User
	game      *Game
	emptyTime time.Time
}

func NewRoom(id string, config RoomConfig) *Room {
	return &Room{
		id:     id,
		config: config,
		users:  make(map[string]*User),
	}
}

func (r *Room) bots() []*User {
	bots := make([]*User, 0, 4)
	for userId, user := range r.users {
		if userId[:3] == "bot" && !user.Left {
			bots = append(bots, user)
		}
	}
	return bots
}

func (r *Room) shiftSpectatorsDown(spectatorSeat int) {
	for _, user := range r.users {
		if !user.Left && user.SpectatorSeat > spectatorSeat {
			user.SpectatorSeat--
		}
	}
}

func (r *Room) seats() []string {
	seats := make([]string, 4)
	for _, user := range r.users {
		if !user.Left && user.Seat >= 0 {
			seats[user.Seat] = user.Id
		}
	}
	return seats
}

func (r *Room) spectators() []string {
	spectators := make([]string, r.config.MaxSpectators)
	for _, user := range r.users {
		if !user.Left && user.SpectatorSeat >= 0 {
			spectators[user.SpectatorSeat] = user.Id
		}
	}
	return spectators
}

func (r *Room) getNextIndex(userIds []string) int {
	for i := 0; i < len(userIds); i++ {
		if userIds[i] == "" {
			return i
		}
	}
	return -1
}

func (r *Room) admin() *User {
	for _, user := range r.users {
		if user.Admin {
			return user
		}
	}
	return nil
}

func (r *Room) activeUsers() []*User {
	users := make([]*User, 0, len(r.users))
	for _, user := range r.users {
		if user.Id[:4] == "user" && !user.Left {
			users = append(users, user)
		}
	}
	return users
}

func (r *Room) allUsers() []*User {
	users := make([]*User, 0, len(r.users))
	for _, user := range r.users {
		users = append(users, user)
	}
	return users
}

func (r *Room) activeUserIds() []string {
	ids := make([]string, 0, len(r.users))
	for id, user := range r.users {
		if id[:4] == "user" && !user.Left {
			ids = append(ids, id)
		}
	}
	return ids
}

func (r *Room) otherActiveUserIds(userId string) []string {
	ids := make([]string, 0, len(r.users))
	for id, user := range r.users {
		if id[:4] == "user" && id != userId && !user.Left {
			ids = append(ids, id)
		}
	}
	return ids
}
