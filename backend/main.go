package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
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
		frontendDir = filepath.Join("frontend") // Caminho absoluto dentro do container
	)

	// Configuração do fileserver
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir(frontendDir))))
	
	// Rotas da API
	http.HandleFunc("/api/shorten", func(w http.ResponseWriter, r *http.Request) {
		handlers.ShortenHandler(w, r, urlStore, &mu)
	})
	
	http.HandleFunc("/api/stats", func(w http.ResponseWriter, r *http.Request) {
		handlers.StatsHandler(w, r, urlStore, &mu)
	})
	
	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Rota principal
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// URL encurtada (6 caracteres)
		if len(r.URL.Path) == 7 && r.URL.Path[0] == '/' {
			handlers.RedirectHandler(w, r, urlStore, &mu)
			return
		}
		
		// Serve o frontend
		http.ServeFile(w, r, filepath.Join(frontendDir, "index.html"))
	})

	log.Printf("Server started on port :%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
