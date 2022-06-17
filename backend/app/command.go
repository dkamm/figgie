package app

import (
	"encoding/json"
)

type CommandType string

const (
	CreateRoomType      CommandType = "createRoom"
	ListRoomsType                   = "listRooms"
	JoinRoomType                    = "joinRoom"
	LeaveRoomType                   = "leaveRoom"
	SendMessageType                 = "sendMessage"
	TakeSeatType                    = "takeSeat"
	StartSpectatingType             = "startSpectating"
	ChangeNameType                  = "changeName"
)

type CreateRoomPayload struct {
	UserName string     `json:"userName,omitempty"`
	Config   RoomConfig `json:"config"`
}

type ListRoomsPayload struct {
	Page     int `json:"page"`
	PageSize int `json:"pageSize"`
}

type JoinRoomPayload struct {
	Name string `json:"name,omitempty"`
}

type SendMessagePayload struct {
	Message string `json:"message"`
}

type TakeSeatPayload struct {
	Seat int `json:"seat"`
}

type StartSpectatingPayload struct{}

type ChangeNamePayload struct {
	Name string `json:"name"`
}

type Command struct {
	Type    CommandType     `json:"type"`
	RoomId  string          `json:"roomId,omitempty"`
	Payload json.RawMessage `json:"payload"`
}
