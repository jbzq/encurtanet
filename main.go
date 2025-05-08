package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"strings"
	"sync"
)

var (
	urlStore    = make(map[string]string)
	mu          sync.Mutex
	secretKey   = []byte("mysecretkey1234567654321")
	lettersRune = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
)

func encrypt(url string) string {
	block, err := aes.NewCipher([]byte(secretKey))

	if err != nil {
		log.Fatal(err)
	}

	plaintext := []byte(url)
	ciphertext := make([]byte, aes.BlockSize+len(plaintext))

	iv := ciphertext[:aes.BlockSize]

	if _, err := rand.Read(iv); err != nil {
		log.Fatal(err)
	}

	stream := cipher.NewCTR(block, iv)
	stream.XORKeyStream(ciphertext[aes.BlockSize:], plaintext)

	return hex.EncodeToString(ciphertext)
}

func decrypt(encryptedUrl string) string {
	block, err := aes.NewCipher([]byte(secretKey))
	if err != nil {
		log.Fatal(err)
	}

	ciphertext, _ := hex.DecodeString(encryptedUrl)
	if len(ciphertext) < aes.BlockSize {
		log.Fatal("ciphertext too short")
	}

	iv := ciphertext[:aes.BlockSize]
	ciphertext = ciphertext[aes.BlockSize:]

	stream := cipher.NewCTR(block, iv)
	stream.XORKeyStream(ciphertext, ciphertext)

	return string(ciphertext)
}

func generateShortId() string {
	b := make([]rune, 6)
	for i := range b {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(lettersRune))))
		if err != nil {
			log.Fatal(err)
		}

		b[i] = lettersRune[num.Int64()]

	}
	return string(b)
}

func shortUrl(w http.ResponseWriter, r *http.Request) {
	originalUrl := r.URL.Query().Get("url")
	if originalUrl == "" {
		http.Error(w, "URL is required", http.StatusBadRequest)
		return
	}

	if !(strings.HasPrefix(originalUrl, "http://") || strings.HasPrefix(originalUrl, "https://")) {
		http.Error(w, "https:// or http:// is required", http.StatusBadRequest)
		return
	}

	encryptedUrl := encrypt(originalUrl)
	shortId := generateShortId()
	mu.Lock()
	urlStore[shortId] = encryptedUrl
	mu.Unlock()

	shortUrl := fmt.Sprintf("http://jbzq.github.io/encurtanet/%s", shortId)
	fmt.Fprintf(w, "%s", shortUrl)
}

func redirectUrl(w http.ResponseWriter, r *http.Request) {
	shortId := r.URL.Path[len("/"):]

	mu.Lock()
	encryptedUrl, exists := urlStore[shortId]
	mu.Unlock()

	if !exists {
		http.Error(w, "URL not found", http.StatusNotFound)
		return
	}

	decryptedUrl := decrypt(encryptedUrl)
	http.Redirect(w, r, decryptedUrl, http.StatusFound)
}

func main() {
	http.HandleFunc("/shorten", shortUrl)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			http.ServeFile(w, r, "./index.html")
			return
		}
		redirectUrl(w, r)
	})
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))

	fmt.Println("Server started at localhost:8080")
	log.Fatal(http.ListenAndServe("localhost:8080", nil))
}
