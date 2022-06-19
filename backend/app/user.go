package app

import (
	"math/rand"
	"strings"
	"time"
)

// User represents a user in the room.
type User struct {
	Id             string    `json:"id"`
	Name           string    `json:"name"`
	Money          int       `json:"money"`
	Rebuys         int       `json:"rebuys"`
	Seat           int       `json:"-"` // -1 if not seated
	SpectatorSeat  int       `json:"-"` // -1 if not spectating
	Admin          bool      `json:"admin"`
	Left           bool      `json:"left"`
	DisconnectedAt time.Time `json:"-"`
}

var animals = []string{"bat", "cat", "dog", "elephant", "fox", "giraffe", "horse", "lion", "monkey", "panda", "penguin", "pig", "rabbit", "sheep", "tiger", "zebra"}
var adjectives = []string{"sleepy", "angry", "hungry", "happy", "sad"}

func RandomUserName() string {
	return strings.Title(adjectives[rand.Intn(len(adjectives))]) + " " + strings.Title(animals[rand.Intn(len(animals))])
}

func NewUser(id string, name string, seat int, spectatorSeat int, admin bool) *User {
	return &User{Id: id, Name: name, Seat: seat, SpectatorSeat: spectatorSeat, Admin: admin}
}
