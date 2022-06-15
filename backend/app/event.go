package app

import (
	"log"
	"encoding/json"
)

type EventType string

const (
	NullEventType EventType = ""
	JoinFailedType = "joinFailed"
	JoinedRoomType = "joinedRoom"
	LeftRoomType = "leftRoom"
	UserJoinedType = "userJoined"
	UserLeftType = "userLeft"
	UserMessagedType = "userMessaged"
)

type JoinFailedPayload struct {
	Reason string `json:"reason"`
}

type JoinedRoomPayload struct {
	UserId string `json:"userId"`
	Users []*User `json:"users"`
}

type LeftRoomPayload struct {}

type UserJoinedPayload = User

type UserLeftPayload struct {
	UserId string `json:"userId"`
}

type UserMessagedPayload struct {
	UserId string `json:"userId"`
	Message string `json:"message"`
}

type Event struct {
	Type EventType `json:"type"`
	RoomId string `json:"roomId,omitempty"`
	Payload json.RawMessage `json:"payload"`
}

func NewEvent(roomId string, payload interface{}) *Event {

	var raw json.RawMessage
	var eventType = NullEventType

	switch payload.(type) {

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
		Type: eventType,
		RoomId: roomId,
		Payload: raw,
	}

}