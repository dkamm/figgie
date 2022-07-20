package app

type RoomSummary struct {
	RoomId        string `json:"roomId"`
	RoomName      string `json:"roomName"`
	HostName      string `json:"hostName"`
	NumPlayers    int    `json:"numPlayers"`
	NumSpectators int    `json:"numSpectators"`
	MaxSpectators int    `json:"maxSpectators"`
}
