package app

import (
	"math/rand"
	"strconv"
	"strings"
	"time"
)

// User represents a user in the room.
type User struct {
	Id             string    `json:"id"`
	Name           string    `json:"name"`
	Money          int       `json:"money"`
	Seat           int       `json:"-"` // -1 if not seated
	SpectatorSeat  int       `json:"-"` // -1 if not spectating
	Host           bool      `json:"host"`
	Left           bool      `json:"left"`
	DisconnectedAt time.Time `json:"-"`
	Bot            bool      `json:"bot"`
}

var animals = []string{"bat", "cat", "dog", "elephant", "fox", "giraffe", "horse", "lion", "monkey", "panda", "penguin", "pig", "rabbit", "sheep", "tiger", "zebra"}
var adjectives = []string{"sleepy", "angry", "hungry", "happy", "sad"}

func RandomUserName() string {
	return strings.Title(adjectives[rand.Intn(len(adjectives))]) + " " + strings.Title(animals[rand.Intn(len(animals))])
}

func RandomBotName() string {
	return strings.Title(animals[rand.Intn(len(animals))]) + " Bot " + strconv.Itoa(1+rand.Intn(19))
}

func NewUser(id string, name string, money int, seat int, spectatorSeat int, host bool) *User {
	return &User{Id: id, Name: name, Money: money, Seat: seat, SpectatorSeat: spectatorSeat, Host: host}
}
