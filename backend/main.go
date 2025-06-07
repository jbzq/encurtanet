package main

import (
	"log"
	"net/http"
	"os"
	"sync"
	
	"encurtanet/backend/handlers"
	"encurtanet/backend/models"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	var (
		urlStore = make(map[string]models.UrlData)
		mu       sync.RWMutex
	)

	http.HandleFunc("/shorten", func(w http.ResponseWriter, r *http.Request) {
		handlers.ShortenHandler(w, r, urlStore, &mu)
	})
	
	http.HandleFunc("/stats", func(w http.ResponseWriter, r *http.Request) {
		handlers.StatsHandler(w, r, urlStore, &mu)
	})
	
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})
	
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			http.ServeFile(w, r, "../frontend/index.html")
			return
		}
		handlers.RedirectHandler(w, r, urlStore, &mu)
	})

	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("../frontend"))))

	log.Printf("Server started at :%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
