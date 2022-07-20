package app

import (
	"encoding/json"
	"log"
	"math"
	"math/rand"
	"time"
)

type BotOrder struct {
	userId   string
	roomId   string
	gameId   int
	price    int
	suit     Suit
	side     Side
	tradeNum int
}

type Bot struct {
	manager       *BotManager
	id            string
	roomId        string
	playerId      int
	gameId        int
	inGame        bool
	numGameTrades int

	money int

	events chan *Event
	stop   chan bool

	pendingOrders []BotOrder

	r         float64
	books     [][]int
	hands     [][]int
	alphas    []float64
	deckProbs []float64
}

var decks = [][]int{
	{12, 10, 10, 8},
	{12, 10, 8, 10},
	{12, 8, 10, 10},
	{8, 12, 10, 10},
	{10, 12, 10, 8},
	{10, 12, 8, 10},
	{10, 8, 12, 10},
	{8, 10, 12, 10},
	{10, 10, 12, 8},
	{10, 10, 8, 12},
	{10, 8, 10, 12},
	{8, 10, 10, 12},
}

// pre-compute binomials
var nChooseKs = map[int][]int{
	8:  []int{1, 8, 28, 56, 70, 56, 28, 8},
	10: []int{1, 10, 45, 120, 210, 252, 210, 120, 45, 10},
	12: []int{1, 12, 66, 220, 495, 792, 924, 792, 495, 220, 66, 12},
}

func NewBot(id string, roomId string, playerId int, r float64, money int, manager *BotManager) *Bot {

	alphas := make([]float64, len(decks))
	for i, deck := range decks {
		common := Suit(i / 3)
		goal := SisterSuit(common)
		goalCount := deck[goal]
		majority := goalCount/2 + 1
		payout := 100.
		if goalCount == 8 {
			payout = 120.
		}
		alphas[i] = payout * (1 - r) / (1 - math.Pow(r, float64(majority)))
	}

	return &Bot{
		id:            id,
		roomId:        roomId,
		playerId:      playerId,
		money:         money,
		manager:       manager,
		r:             r,
		alphas:        alphas,
		pendingOrders: make([]BotOrder, 0, 16),
		stop:          make(chan bool, 1),
		events:        make(chan *Event, 256),
		deckProbs:     []float64{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
	}
}

func (b *Bot) Run() {
	log.Printf("starting %v: player=%v", b.id, b.playerId)

	interval := 2000 + rand.Intn(500)
	ticker := time.NewTicker(time.Duration(interval) * time.Millisecond)

	for {
		select {
		case <-ticker.C:
			if len(b.pendingOrders) == 0 {
				continue
			}
			order := b.pendingOrders[0]
			log.Printf("sending order for %v: order=%v pendingOrders=%v", b.id, order, b.pendingOrders[1:])
			b.manager.orders <- order
			b.pendingOrders = b.pendingOrders[1:]
		case event := <-b.events:
			b.handleEvent(event)
		case <-b.stop:
			log.Printf("stopping %v", b.id)
			return
		}
	}
}

func (b *Bot) recalcDeckProbs() {
	Z := 0
	numerators := make([]int, len(decks))
	for i, deck := range decks {
		numerator := 1
		for suit, deckSuitCount := range deck {
			seenSuitCount := 0
			for _, hand := range b.hands {
				seenSuitCount += hand[suit]
			}
			if deckSuitCount < seenSuitCount {
				numerator = 0
				break
			}
			numerator *= nChooseKs[deckSuitCount][suit]
		}
		numerators[i] = numerator
		Z += numerator
	}
	for i, numerator := range numerators {
		b.deckProbs[i] = float64(numerator) / float64(Z)
	}
	log.Printf("recalculated deck probs for %v: deckProbs=%v hands=%v", b.id, b.deckProbs, b.hands)
}

func (b *Bot) valueBuy(handCount int, deckCount int, alpha float64) float64 {
	majority := deckCount/2 + 1
	if handCount < majority {
		return alpha * math.Pow(b.r, float64(handCount))
	}

	return 0.
}

func (b *Bot) placeOrders() {

	orders := make([]BotOrder, 0, 16)

	for _, goalSuit := range []Suit{Club, Spade, Heart, Diamond} {

		book := b.books[goalSuit]
		bid := book[0]
		ask := book[2]

		handCount := b.hands[b.playerId][goalSuit]

		vbuy := 0.
		vsell := 0.
		// These are the decks with correct commonSuit count
		for j, deck := range decks {
			commonSuit := SisterSuit(goalSuit)
			if deck[commonSuit] != 12 {
				continue
			}
			pdeck := b.deckProbs[j]
			deckCount := deck[goalSuit]
			alpha := b.alphas[j]
			vbuy += pdeck * b.valueBuy(handCount, deckCount, alpha)
			if handCount > 0 {
				vsell += pdeck * b.valueBuy(handCount-1, deckCount, alpha)
			}
		}

		log.Printf("update fair price for %v: goalSuit=%v, vbuy=%v, vsell=%v", b.id, goalSuit, vbuy, vsell)

		buyPrice := int(math.Floor(vbuy))
		sellPrice := int(math.Ceil(vsell))

		if bid < buyPrice {
			// queue buy
			orders = append(orders, BotOrder{
				userId:   b.id,
				roomId:   b.roomId,
				price:    buyPrice,
				suit:     goalSuit,
				side:     Bid,
				tradeNum: b.numGameTrades,
			})
		}
		if ask == 0 || ask > sellPrice {
			// queue sell
			orders = append(orders, BotOrder{
				userId:   b.id,
				roomId:   b.roomId,
				price:    sellPrice,
				suit:     goalSuit,
				side:     Ask,
				tradeNum: b.numGameTrades,
			})
		}
	}

	// Shuffle orders to make it more interesting
	rand.Shuffle(len(orders), func(i, j int) {
		orders[i], orders[j] = orders[j], orders[i]
	})

	log.Printf("new orders for %v: orders=%v", b.id, orders)

	b.pendingOrders = append(b.pendingOrders, orders...)

}

func (b *Bot) handleEvent(e *Event) {
	switch e.Type {

	case GameStartedType:
		var p GameStartedRestrictedPayload
		json.Unmarshal(e.Payload, &p)

		b.gameId = p.Id
		b.inGame = true
		b.numGameTrades = 0
		b.pendingOrders = b.pendingOrders[:0]

		b.money -= 50
		b.books = [][]int{
			{0, 0, 0, 0},
			{0, 0, 0, 0},
			{0, 0, 0, 0},
			{0, 0, 0, 0},
		}
		b.hands = p.Hands
		b.recalcDeckProbs()
		b.placeOrders()

	case OrderAddedType:
		var p OrderAddedPayload
		json.Unmarshal(e.Payload, &p)

		book := b.books[p.Suit]
		if p.Side == Bid {
			book[0] = p.Price
			book[1] = p.Player
		} else {
			book[2] = p.Price
			book[3] = p.Player
		}

		// This was our order so our deck probs do not change
		if p.Player == b.playerId {
			return
		}

		// We didn't know that this player had a suit to sell before this order
		if p.Side == Ask && b.hands[p.Player][p.Suit] == 0 {
			b.hands[p.Player][p.Suit] = 1
			b.recalcDeckProbs()
			b.pendingOrders = b.pendingOrders[:0]
			b.placeOrders()
		}

	case OrderTradedType:
		var p OrderTradedPayload
		json.Unmarshal(e.Payload, &p)

		b.numGameTrades++
		b.books = [][]int{
			{0, 0, 0, 0},
			{0, 0, 0, 0},
			{0, 0, 0, 0},
			{0, 0, 0, 0},
		}

		b.hands[p.Bidder][p.Suit]++
		if b.hands[p.Asker][p.Suit] > 0 {
			b.hands[p.Asker][p.Suit]--
		} else {
			// We didn't know that the seller had a suit to sell before this trade
			b.recalcDeckProbs()
		}
		// clear pending orders
		b.pendingOrders = b.pendingOrders[:0]
		b.placeOrders()

	case GameEndedType:
		var p GameEndedPayload
		json.Unmarshal(e.Payload, &p)

		b.inGame = false
		b.numGameTrades = 0
		b.pendingOrders = b.pendingOrders[:0]
	}
}
