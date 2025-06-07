package models

import (
	"time"
)

type UrlData struct {
	Original  string
	Encrypted string
	CreatedAt time.Time
	Stats     StatsData
}

type StatsData struct {
	Clicks      int
	LastClicked time.Time
	Referrers   map[string]int
	Devices     map[string]int
}

func NewUrlData(original, encrypted string) UrlData {
	return UrlData{
		Original:  original,
		Encrypted: encrypted,
		CreatedAt: time.Now(),
		Stats: StatsData{
			Referrers: make(map[string]int),
			Devices:   make(map[string]int),
		},
	}
}
