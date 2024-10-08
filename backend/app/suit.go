package app

type Suit int

const (
	Club Suit = iota
	Spade
	Heart
	Diamond
)

func SisterSuit(s Suit) Suit {
	switch s {
	case Club:
		return Spade
	case Spade:
		return Club
	case Diamond:
		return Heart
	default:
		return Diamond
	}
}
