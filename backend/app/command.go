package app

import (
	"encoding/json"
)

type CommandType string


const (
	CreateRoomType CommandType = "createRoom"
	ListRoomsType = "listRooms"
	JoinRoomType = "joinRoom"
	LeaveRoomType = "leaveRoom"
	SendMessageType = "sendMessage"
)

type JoinRoomPayload struct {
	Name string `json:"name,omitempty"`
}

type SendMessagePayload struct {
	Message string `json:"message"`
}

type Command struct {
	Type CommandType `json:"type"`
	RoomId string `json:"roomId,omitempty"`
	Payload json.RawMessage `json:"payload"`
}
