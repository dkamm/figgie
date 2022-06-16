package app

import (
	"encoding/json"
	"log"
)

type EventType string

const (
	NullEventType    EventType = ""
	RoomCreatedType            = "roomCreated"
	RoomsListedType            = "roomsListed"
	JoinFailedType             = "joinFailed"
	JoinedRoomType             = "joinedRoom"
	LeftRoomType               = "leftRoom"
	UserJoinedType             = "userJoined"
	UserLeftType               = "userLeft"
	UserMessagedType           = "userMessaged"
)

type RoomCreatedPayload struct{}

type RoomsListedPayload struct {
	Rooms []RoomSummary `json:"rooms"`
}

type JoinFailedPayload struct {
	Reason string `json:"reason"`
}

type JoinedRoomPayload struct {
	UserId string     `json:"userId"`
	Users  []*User    `json:"users"`
	Config RoomConfig `json:"config"`
}

type LeftRoomPayload struct{}

type UserJoinedPayload = User

type UserLeftPayload struct {
	UserId string `json:"userId"`
}

type UserMessagedPayload struct {
	UserId  string `json:"userId"`
	Message string `json:"message"`
}

type Event struct {
	Type    EventType       `json:"type"`
	RoomId  string          `json:"roomId,omitempty"`
	Payload json.RawMessage `json:"payload"`
}

type PaginatedEvent struct {
	Total    int             `json:"total"`
	Page     int             `json:"page"`
	PageSize int             `json:"pageSize"`
	Type     EventType       `json:"type"`
	Data     json.RawMessage `json:"data"`
}

func NewEvent(roomId string, payload interface{}) *Event {

	var raw json.RawMessage
	var eventType = NullEventType

	switch payload.(type) {

	case *RoomsListedPayload:
		eventType = RoomsListedType
		raw, _ = json.Marshal(payload.(*RoomsListedPayload))

	case *RoomCreatedPayload:
		eventType = RoomCreatedType
		raw, _ = json.Marshal(payload.(*RoomCreatedPayload))

	case *JoinFailedPayload:
		eventType = JoinFailedType
		raw, _ = json.Marshal(payload.(*JoinFailedPayload))

	case *JoinedRoomPayload:
		eventType = JoinedRoomType
		raw, _ = json.Marshal(payload.(*JoinedRoomPayload))

	case *LeftRoomPayload:
		eventType = LeftRoomType
		raw, _ = json.Marshal(payload.(*LeftRoomPayload))

	case *UserJoinedPayload:
		eventType = UserJoinedType
		raw, _ = json.Marshal(payload.(*UserJoinedPayload))

	case *UserLeftPayload:
		eventType = UserLeftType
		raw, _ = json.Marshal(payload.(*UserLeftPayload))

	case *UserMessagedPayload:
		eventType = UserMessagedType
		raw, _ = json.Marshal(payload.(*UserMessagedPayload))

	default:
		log.Printf("invalid payload")
	}

	return &Event{
		Type:    eventType,
		RoomId:  roomId,
		Payload: raw,
	}

}
