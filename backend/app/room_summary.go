package app

type RoomSummary struct {
	RoomId        string `json:"roomId"`
	RoomName      string `json:"roomName"`
	AdminName     string `json:"adminName"`
	NumSpectators int    `json:"numSpectators"`
	MaxSpectators int    `json:"maxSpectators"`
}
