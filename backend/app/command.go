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
	RebuyInType                     = "rebuyIn"
	SendOrderType                   = "sendOrder"
	StartGameType                   = "startGame"
	PromoteUserType                 = "promoteUser"
	KickUserType                    = "kickUser"
	EndGameType                     = "endGame"
	PingType                        = "ping"
	AddBotType                      = "addBot"
	RemoveBotType                   = "removeBot"
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

type LeaveRoomPayload struct {
	DisconnectAllClients bool `json:"disconnectAllClients"`
}

type SendMessagePayload struct {
	Message string `json:"message"`
}

type TakeSeatPayload struct {
	Seat int `json:"seat"`
}

type StartSpectatingPayload struct {
	Seat int `json:"seat"`
}

type ChangeNamePayload struct {
	Name string `json:"name"`
}

type RebuyInPayload struct{}

type SendOrderPayload struct {
	Price    int  `json:"price"`
	Suit     Suit `json:"suit"`
	Side     Side `json:"side"`
	TradeNum int  `json:"tradeNum"`
}

type PromoteUserPayload struct {
	UserId string `json:"userId"`
}

type KickUserPayload struct {
	UserId string `json:"userId"`
}

type EndGamePayload struct {
	GameId int `json:"id"`
}

type AddBotPayload struct {
	Seat int `json:"seat"`
}

type RemoveBotPayload struct {
	UserId string `json:"userId"`
}

type Command struct {
	Type    CommandType     `json:"type"`
	RoomId  string          `json:"roomId,omitempty"`
	Payload json.RawMessage `json:"payload"`
}
