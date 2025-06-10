package main

import (
    "log"
    "net/http"
    "os"
    "path/filepath"
    "sync"
		"strings"

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
		mu          sync.RWMutex
		frontendDir = "frontend" // No Docker, está no mesmo nível
	)

	// Middleware CORS
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

	// Handler para arquivos estáticos com MIME types corretos
http.Handle("/static/", http.StripPrefix("/static/", 
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Configura headers de segurança
			w.Header().Set("X-Content-Type-Options", "nosniff")
			
			// Determina o Content-Type baseado na extensão do arquivo
			ext := strings.ToLower(filepath.Ext(r.URL.Path))
			switch ext {
			case ".css":
				w.Header().Set("Content-Type", "text/css; charset=utf-8")
			case ".js":
				w.Header().Set("Content-Type", "application/javascript; charset=utf-8")
			case ".png":
				w.Header().Set("Content-Type", "image/png")
			case ".jpg", ".jpeg":
				w.Header().Set("Content-Type", "image/jpeg")
			case ".svg":
				w.Header().Set("Content-Type", "image/svg+xml")
			case ".ico":
				w.Header().Set("Content-Type", "image/x-icon")
			case ".webmanifest":
				w.Header().Set("Content-Type", "application/manifest+json")
			case ".woff":
				w.Header().Set("Content-Type", "font/woff")
			case ".woff2":
				w.Header().Set("Content-Type", "font/woff2")
			case ".ttf":
				w.Header().Set("Content-Type", "font/ttf")
			case ".json":
				w.Header().Set("Content-Type", "application/json")
			default:
				w.Header().Set("Content-Type", "text/plain")
			}

			// Cache por 1 ano para arquivos estáticos
			if ext == ".css" || ext == ".js" || ext == ".png" || ext == ".jpg" || 
			   ext == ".jpeg" || ext == ".svg" || ext == ".woff" || ext == ".woff2" || 
			   ext == ".ttf" || ext == ".ico" {
				w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
			}

			// Serve o arquivo
			http.FileServer(http.Dir(filepath.Join(frontendDir, "static"))).ServeHTTP(w, r)
		})))
	// Handler para arquivos CSS (servindo da pasta css/)
	http.Handle("/css/", http.StripPrefix("/css/",
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "text/css")
			fs := http.FileServer(http.Dir(filepath.Join(frontendDir, "css")))
			fs.ServeHTTP(w, r)
		})))

	// Handler para arquivos JS (servindo da pasta js/)
	http.Handle("/js/", http.StripPrefix("/js/",
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/javascript")
			fs := http.FileServer(http.Dir(filepath.Join(frontendDir, "js")))
			fs.ServeHTTP(w, r)
		})))

	// Rotas da API
	http.HandleFunc("/api/shorten", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		handlers.ShortenHandler(w, r, urlStore, &mu)
	}))

	http.HandleFunc("/api/stats", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		handlers.StatsHandler(w, r, urlStore, &mu)
	}))

	http.HandleFunc("/health", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		handlers.HealthHandler(w, r)
	}))

	// Rota principal (SPA - Single Page Application)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Verifica se é um código curto (7 caracteres)
		if len(r.URL.Path) == 7 && r.URL.Path[0] == '/' {
			handlers.RedirectHandler(w, r, urlStore, &mu)
			return
		}

		// Serve o index.html para todas as outras rotas
		http.ServeFile(w, r, filepath.Join(frontendDir, "index.html"))
	})

	log.Printf("Servidor iniciado na porta :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
