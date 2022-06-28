package app

import (
	"encoding/json"
	"log"
)

type EventType string

const (
	NullEventType             EventType = ""
	RoomCreatedType                     = "roomCreated"
	RoomsListedType                     = "roomsListed"
	JoinFailedType                      = "joinFailed"
	JoinedRoomType                      = "joinedRoom"
	LeftRoomType                        = "leftRoom"
	UserJoinedType                      = "userJoined"
	UserLeftType                        = "userLeft"
	UserMessagedType                    = "userMessaged"
	UserChangedNameType                 = "userChangedName"
	UserTookSeatType                    = "userTookSeat"
	UserStartedSpectatingType           = "userStartedSpectating"
	UserPromotedType                    = "userPromoted"
	UserKickedType                      = "userKicked"
	GameStartedType                     = "gameStarted"
	GameEndedType                       = "gameEnded"
	OrderAddedType                      = "orderAdded"
	OrderTradedType                     = "orderTraded"
	OrderRejectedType                   = "orderRejected"
	PongType                            = "pong"
)

type RoomCreatedPayload struct{}

type RoomsListedPayload struct {
	Rooms []RoomSummary `json:"rooms"`
}

type JoinFailedPayload struct {
	Reason string `json:"reason"`
}

type JoinedRoomPayload struct {
	UserId     string     `json:"userId"`
	Users      []*User    `json:"users"`
	Config     RoomConfig `json:"config"`
	Seats      []string   `json:"seats"`
	Spectators []string   `json:"spectators"`
	Game       *Game      `json:"game"`
}

type JoinedRoomRestrictedPayload struct {
	UserId     string              `json:"userId"`
	Users      []*User             `json:"users"`
	Config     RoomConfig          `json:"config"`
	Seats      []string            `json:"seats"`
	Spectators []string            `json:"spectators"`
	Game       *GameRestrictedView `json:"game"`
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

type UserChangedNamePayload struct {
	UserId string `json:"userId"`
	Name   string `json:"name"`
}

type UserTookSeatPayload struct {
	UserId string `json:"userId"`
	Seat   int    `json:"seat"`
}

type UserStartedSpectatingPayload struct {
	UserId string `json:"userId"`
	Seat   int    `json:"seat"`
}

type UserPromotedPayload struct {
	UserId string `json:"userId"`
}

type UserKickedPayload struct {
	UserId string `json:"userId"`
}

type OrderAddedPayload struct {
	Player int  `json:"player"`
	Price  int  `json:"price"`
	Suit   Suit `json:"suit"`
	Side   Side `json:"side"`
}

type OrderTradedPayload struct {
	Bidder int  `json:"bidder"`
	Asker  int  `json:"asker"`
	Price  int  `json:"price"`
	Suit   Suit `json:"suit"`
	Side   Side `json:"side"`
}

type OrderRejectedPayload struct {
	Reason string `json:"reason"`
}

type GameStartedRestrictedPayload = GameRestrictedView

type GameStartedPayload = Game

type GameEndedPayload struct {
	Id        int     `json:"id"`
	Hands     [][]int `json:"hands"`
	Earnings  []int   `json:"earnings"`
	Bonuses   []int   `json:"bonuses"`
	GoalSuit  Suit    `json:"goalSuit"`
	GoalCount int     `json:"goalCount"`
}

type PongPayload struct {
	Time int64 `json:"time"`
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

	case *JoinedRoomRestrictedPayload:
		eventType = JoinedRoomType
		raw, _ = json.Marshal(payload.(*JoinedRoomRestrictedPayload))

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

	case *UserChangedNamePayload:
		eventType = UserChangedNameType
		raw, _ = json.Marshal(payload.(*UserChangedNamePayload))

	case *UserTookSeatPayload:
		eventType = UserTookSeatType
		raw, _ = json.Marshal(payload.(*UserTookSeatPayload))

	case *UserStartedSpectatingPayload:
		eventType = UserStartedSpectatingType
		raw, _ = json.Marshal(payload.(*UserStartedSpectatingPayload))

	case *UserPromotedPayload:
		eventType = UserPromotedType
		raw, _ = json.Marshal(payload.(*UserPromotedPayload))

	case *UserKickedPayload:
		eventType = UserKickedType
		raw, _ = json.Marshal(payload.(*UserKickedPayload))

	case *GameStartedPayload:
		eventType = GameStartedType
		raw, _ = json.Marshal(payload.(*GameStartedPayload))

	case *GameStartedRestrictedPayload:
		eventType = GameStartedType
		raw, _ = json.Marshal(payload.(*GameStartedRestrictedPayload))

	case *GameEndedPayload:
		eventType = GameEndedType
		raw, _ = json.Marshal(payload.(*GameEndedPayload))

	case *OrderAddedPayload:
		eventType = OrderAddedType
		raw, _ = json.Marshal(payload.(*OrderAddedPayload))

	case *OrderTradedPayload:
		eventType = OrderTradedType
		raw, _ = json.Marshal(payload.(*OrderTradedPayload))

	case *OrderRejectedPayload:
		eventType = OrderRejectedType
		raw, _ = json.Marshal(payload.(*OrderRejectedPayload))

	case *PongPayload:
		eventType = PongType
		raw, _ = json.Marshal(payload.(*PongPayload))

	default:
		log.Printf("invalid payload")
	}

	return &Event{
		Type:    eventType,
		RoomId:  roomId,
		Payload: raw,
	}

}
