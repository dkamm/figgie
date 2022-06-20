package app

import (
	"time"
)

const (
	EmptyPrice int = 0
	MinPrice       = 1
	MaxPrice       = 100
)

type Side int

const (
	Bid Side = iota
	Ask
)

type Book []int

// Game holds state for a single game of Figgie
type Game struct {
	Id        int              `json:"id"`
	Done      bool             `json:"done"`
	Players   []string         `json:"players"`
	users     map[string]*User `json:"-"`
	Hands     [][]int          `json:"hands"`
	Deltas    []int            `json:"deltas"`
	Bonuses   []int            `json:"bonuses"`
	Books     []Book           `json:"books"` // 0 - bidPrice, 1 - bidPlayer, 2 - askPrice, 3 - askPlayer
	GoalSuit  Suit             `json:"goalSuit"`
	GoalCount int              `json:"goalCount"`
	StartedAt time.Time        `json:"startedAt"`
}

type GameRestrictedView struct {
	Id        int       `json:"id"`
	Done      bool      `json:"done"`
	Players   []string  `json:"players"`
	Hands     [][]int   `json:"hands"`
	Deltas    []int     `json:"deltas"`
	Books     []Book    `json:"books"`
	StartedAt time.Time `json:"startedAt"`
}

func (g *Game) restrictedView(userId string) *GameRestrictedView {
	player, _ := g.findPlayer(userId)
	hands := [][]int{
		{0, 0, 0, 0},
		{0, 0, 0, 0},
		{0, 0, 0, 0},
		{0, 0, 0, 0},
	}
	hands[player] = g.Hands[player]
	return &GameRestrictedView{
		Id:        g.Id,
		Done:      g.Done,
		Players:   g.Players,
		Hands:     hands,
		Deltas:    g.Deltas,
		Books:     g.Books,
		StartedAt: g.StartedAt,
	}
}

func NewGame(id int, players []string, users map[string]*User) *Game {
	return &Game{
		Id:   id,
		Done: false,
		Hands: [][]int{
			{0, 0, 0, 0},
			{0, 0, 0, 0},
			{0, 0, 0, 0},
			{0, 0, 0, 0},
		},
		Books: []Book{
			{0, 0, 0, 0},
			{0, 0, 0, 0},
			{0, 0, 0, 0},
			{0, 0, 0, 0},
		},
		Players: players,
		users:   users,
		Deltas:  []int{0, 0, 0, 0},
	}
}

func (g *Game) Start() {
	g.StartedAt = time.Now()

	// TODO deal hand
	g.Hands = [][]int{
		{3, 3, 3, 3},
		{3, 3, 3, 3},
		{3, 3, 3, 3},
		{3, 3, 3, 3},
	}
	g.GoalSuit = Club
	g.GoalCount = 8

	for _, player := range g.Players {
		if player == "" {
			continue
		}
		user := g.users[player]
		user.Money -= 50
	}
	g.Deltas = []int{-50, -50, -50, -50}
}

func (g *Game) resetBooks() {
	g.Books = []Book{
		{0, 0, 0, 0},
		{0, 0, 0, 0},
		{0, 0, 0, 0},
		{0, 0, 0, 0},
	}
}

type HandleOrderResponseType int

const (
	Added HandleOrderResponseType = iota
	Traded
	Rejected
)

type HandleOrderResponse struct {
	Type          HandleOrderResponseType
	restingPlayer int
	restingPrice  int
	rejectReason  string
}

func (g *Game) findPlayer(userId string) (int, bool) {
	for i, id := range g.Players {
		if id == userId {
			return i, true
		}
	}
	return 0, false
}

func (g *Game) HandleOrder(player int, price int, suit Suit, side Side) HandleOrderResponse {

	user := g.users[g.Players[player]]
	hand := g.Hands[player]
	book := g.Books[suit]

	bidPrice := book[0]
	bidPlayer := book[1]
	askPrice := book[2]
	askPlayer := book[3]

	if price < MinPrice {
		return HandleOrderResponse{
			Type:         Rejected,
			rejectReason: "price is too low",
		}
	}

	if price > MaxPrice {
		return HandleOrderResponse{
			Type:         Rejected,
			rejectReason: "price is too high",
		}
	}

	if side == Bid && price > user.Money {
		return HandleOrderResponse{
			Type:         Rejected,
			rejectReason: "not enough money",
		}
	}

	if side == Ask && hand[suit] <= 0 {
		return HandleOrderResponse{
			Type:         Rejected,
			rejectReason: "no cards in suit",
		}
	}

	if side == Bid {
		if askPrice != 0 && price >= askPrice {
			if player == askPlayer {
				return HandleOrderResponse{
					Type:         Rejected,
					rejectReason: "You cannot trade with yourself",
				}
			} else {
				g.resetBooks()
				askUser := g.users[g.Players[askPlayer]]
				askHand := g.Hands[askPlayer]
				askHand[suit]--
				askUser.Money += askPrice
				g.Deltas[askPlayer] += askPrice
				hand[suit]++
				user.Money -= askPrice
				g.Deltas[player] -= askPrice
				return HandleOrderResponse{
					Type:          Traded,
					restingPlayer: askPlayer,
					restingPrice:  askPrice,
				}
			}
		} else {
			if bidPrice != 0 && price < bidPrice {
				return HandleOrderResponse{
					Type:         Rejected,
					rejectReason: "price is too low",
				}
			}

			book[0] = price
			book[1] = player

			return HandleOrderResponse{
				Type: Added,
			}
		}

	} else {
		if bidPrice != 0 && price <= bidPrice {
			if player == bidPlayer {
				return HandleOrderResponse{
					Type:         Rejected,
					rejectReason: "You cannot trade with yourself",
				}
			} else {
				g.resetBooks()
				bidUser := g.users[g.Players[bidPlayer]]
				bidHand := g.Hands[bidPlayer]
				bidHand[suit]++
				bidUser.Money -= bidPrice
				g.Deltas[bidPlayer] -= bidPrice
				hand[suit]--
				user.Money += bidPrice
				g.Deltas[player] += bidPrice
				return HandleOrderResponse{
					Type:          Traded,
					restingPlayer: bidPlayer,
					restingPrice:  bidPrice,
				}
			}
		} else {
			if askPrice != 0 && price > askPrice {
				return HandleOrderResponse{
					Type:         Rejected,
					rejectReason: "price is too high",
				}
			}

			book[2] = price
			book[3] = player
			return HandleOrderResponse{
				Type: Added,
			}
		}
	}
}
