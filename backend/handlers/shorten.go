package handlers

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"math/big"
	"net/http"
	"strings"
	"sync"
	
	"encurtanet/backend/models"
)

var lettersRune = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

func ShortenHandler(w http.ResponseWriter, r *http.Request, urlStore map[string]models.UrlData, mu *sync.RWMutex) {
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
	urlStore[shortId] = models.NewUrlData(originalUrl, encryptedUrl)
	mu.Unlock()

	shortUrl := fmt.Sprintf("%s/%s", getBaseUrl(r), shortId)
	fmt.Fprintf(w, "%s", shortUrl)
}

func encrypt(text string) string {
	block, err := aes.NewCipher([]byte("mysecretkey1234567654321"))
	if err != nil {
		panic(err)
	}

	plaintext := []byte(text)
	ciphertext := make([]byte, aes.BlockSize+len(plaintext))

	iv := ciphertext[:aes.BlockSize]
	if _, err := rand.Read(iv); err != nil {
		panic(err)
	}

	stream := cipher.NewCTR(block, iv)
	stream.XORKeyStream(ciphertext[aes.BlockSize:], plaintext)

	return hex.EncodeToString(ciphertext)
}

func generateShortId() string {
	b := make([]rune, 6)
	for i := range b {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(lettersRune))))
		if err != nil {
			panic(err)
		}
		b[i] = lettersRune[num.Int64()]
	}
	return string(b)
}

func getBaseUrl(r *http.Request) string {
	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	return fmt.Sprintf("%s://%s", scheme, r.Host)
}
