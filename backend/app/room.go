package app

type Room struct {
	id    string
	users map[string]*User
}

func NewRoom(id string) *Room {
	return &Room{id: id, users: make(map[string]*User)}
}

func (r *Room) activeUsers() []*User {
	users := make([]*User, 0, len(r.users))
	for _, user := range r.users {
		if !user.Left {
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
		if !user.Left {
			ids = append(ids, id)
		}
	}
	return ids
}

func (r *Room) otherActiveUserIds(userId string) []string {
	ids := make([]string, 0, len(r.users))
	for id, user := range r.users {
		if id != userId && !user.Left {
			ids = append(ids, id)
		}
	}
	return ids
}
