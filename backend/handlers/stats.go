package handlers

import (
	"encoding/json"
	"net/http"
	"sync"
	
	"encurtanet/backend/models"
)

func StatsHandler(w http.ResponseWriter, r *http.Request, urlStore map[string]models.UrlData, mu *sync.RWMutex) {
	shortId := r.URL.Query().Get("id")
	if shortId == "" {
		http.Error(w, "ID is required", http.StatusBadRequest)
		return
	}

	mu.RLock()
	urlData, exists := urlStore[shortId]
	mu.RUnlock()

	if !exists {
		http.Error(w, "URL not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(urlData.Stats)
}
