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
        urlStore    = make(map[string]models.UrlData)
        mu         sync.RWMutex
        frontendDir = "frontend" // Caminho relativo ao diretório de execução
    )

    // Verificar se o diretório frontend existe
    if _, err := os.Stat(frontendDir); os.IsNotExist(err) {
        // Tentar caminho alternativo para Docker
        frontendDir = filepath.Join("..", "frontend")
        if _, err := os.Stat(frontendDir); os.IsNotExist(err) {
            log.Fatalf("Diretório frontend não encontrado em: %s ou ../frontend", frontendDir)
        }
    }

    corsMiddleware := func(next http.HandlerFunc) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
            w.Header().Set("Access-Control-Allow-Origin", "*")
            w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
            
            if r.Method == "OPTIONS" {
                w.WriteHeader(http.StatusOK)
                return
            }
            next(w, r)
        }
    }

    // Configuração do fileserver para arquivos estáticos
    staticHandler := http.StripPrefix("/static/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Definir Content-Type apropriado
        switch filepath.Ext(r.URL.Path) {
        case ".css":
            w.Header().Set("Content-Type", "text/css")
        case ".js":
            w.Header().Set("Content-Type", "application/javascript")
        case ".html":
            w.Header().Set("Content-Type", "text/html")
        }
        
        http.FileServer(http.Dir(frontendDir)).ServeHTTP(w, r)
    }))
    http.Handle("/static/", staticHandler)

    // Rotas da API
    http.HandleFunc("/api/shorten", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
        handlers.ShortenHandler(w, r, urlStore, &mu)
    }))

    http.HandleFunc("/api/stats", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
        handlers.StatsHandler(w, r, urlStore, &mu)
    }))

    http.HandleFunc("/health", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        w.Write([]byte("OK"))
    }))

    // Rota principal (SPA)
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // URL encurtada (6 caracteres)
        if len(r.URL.Path) == 7 && r.URL.Path[0] == '/' {
            handlers.RedirectHandler(w, r, urlStore, &mu)
            return
        }

        // Serve o index.html para todas as outras rotas
        http.ServeFile(w, r, filepath.Join(frontendDir, "index.html"))
    })

    log.Printf("Servidor iniciado na porta :%s", port)
    log.Printf("Diretório frontend: %s", frontendDir)
    log.Printf("Acesse: http://localhost:%s", port)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}
