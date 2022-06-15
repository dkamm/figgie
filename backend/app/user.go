package app

import (
	"math/rand"
	"strings"
)

type User struct {
	Id string `json:"id"`
	Name string `json:"name"`
	Score int `json:"score"`
	Admin bool `json:"admin"`
	Left bool `json:"left"`
}


var animals = []string{"bat","cat", "dog", "elephant", "fox", "giraffe", "horse", "lion", "monkey", "panda", "penguin", "pig", "rabbit", "sheep", "tiger", "zebra"}
var adjectives =[]string{"sleepy", "angry", "hungry", "happy", "sad"}

func RandomUserName() string {
	return strings.Title(adjectives[rand.Intn(len(adjectives))]) + " " + strings.Title(animals[rand.Intn(len(animals))])
}

func NewUser(id string, name string, admin bool) *User {
	return &User{Id: id, Name: name, Admin: admin}
}