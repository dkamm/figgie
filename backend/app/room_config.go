package app

type RoomConfig struct {
	Name          string `json:"name"`
	Private       bool   `json:"private"`
	MaxSpectators int    `json:"maxSpectators"`
}
