package app

import (
	"encoding/json"
	"log"
	"math/rand"
)

type BotManager struct {
	hub        *Hub
	events     chan BotEvent
	orders     chan BotOrder
	register   chan BotRegister
	unregister chan BotUnregister
	bots       map[string][]*Bot // roomId -> bots
}

type BotEvent struct {
	userId string
	event  *Event
}

type BotRegister struct {
	userId   string
	roomId   string
	playerId int
}

type BotUnregister struct {
	userId string
	roomId string
}

func NewBotManager(hub *Hub) *BotManager {
	return &BotManager{
		hub:        hub,
		events:     make(chan BotEvent),
		orders:     make(chan BotOrder),
		register:   make(chan BotRegister),
		unregister: make(chan BotUnregister),
		bots:       make(map[string][]*Bot),
	}
}

func (bm *BotManager) Run() {

	for {
		select {
		case br := <-bm.register:
			bots, ok := bm.bots[br.roomId]
			if !ok {
				bots = make([]*Bot, 0, 4)
				bm.bots[br.roomId] = bots
			}
			bot := NewBot(br.userId, br.roomId, br.playerId, 1.5+rand.Float64()*.5, StartingMoney, bm)
			go bot.Run()
			bm.bots[br.roomId] = append(bots, bot)
			log.Printf("registered %s", bot.id)

		case br := <-bm.unregister:
			bots, ok := bm.bots[br.roomId]
			if !ok {
				continue
			}

			newBots := make([]*Bot, 0, 4)
			for _, bot := range bots {
				if bot.id == br.userId {
					bot.stop <- true
					log.Printf("unregistered %s", bot.id)
				} else {
					newBots = append(newBots, bot)
				}
			}
			bm.bots[br.roomId] = newBots

		case be := <-bm.events:
			bots, _ := bm.bots[be.event.RoomId]
			for _, bot := range bots {
				if be.userId == "" || be.userId == bot.id {
					bot.events <- be.event
				}
			}

		case bo := <-bm.orders:
			payload, _ := json.Marshal(&SendOrderPayload{
				Price:    bo.price,
				Suit:     bo.suit,
				Side:     bo.side,
				TradeNum: bo.tradeNum,
			})

			message, _ := json.Marshal(&Command{
				Type:    SendOrderType,
				RoomId:  bo.roomId,
				Payload: payload,
			})

			bm.hub.receive <- WSClientMessage{
				client: &WSClient{
					userId: bo.userId,
				},
				message: message,
			}
		}
	}
}
