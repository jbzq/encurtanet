package handlers

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/hex"
	"net/http"
	"strings"
	"time"
	
	"encurtanet/backend/models"
)

func RedirectHandler(w http.ResponseWriter, r *http.Request, urlStore map[string]models.UrlData, mu *sync.RWMutex) {
	shortId := r.URL.Path[len("/"):]

	mu.Lock()
	defer mu.Unlock()

	urlData, exists := urlStore[shortId]
	if !exists {
		http.Error(w, "URL not found", http.StatusNotFound)
		return
	}

	// Registrar estatísticas
	urlData.Stats.Clicks++
	urlData.Stats.LastClicked = time.Now()
	
	// Registrar referer
	referer := r.Referer()
	if referer == "" {
		referer = "Direct"
	}
	urlData.Stats.Referrers[referer]++
	
	// Registrar dispositivo
	userAgent := r.UserAgent()
	deviceType := "Desktop"
	if strings.Contains(userAgent, "Mobile") {
		deviceType = "Mobile"
	} else if strings.Contains(userAgent, "Tablet") {
		deviceType = "Tablet"
	}
	urlData.Stats.Devices[deviceType]++
	
	urlStore[shortId] = urlData

	decryptedUrl := decrypt(urlData.Encrypted)
	http.Redirect(w, r, decryptedUrl, http.StatusFound)
}

func decrypt(encryptedText string) string {
	block, err := aes.NewCipher([]byte("mysecretkey1234567654321"))
	if err != nil {
		panic(err)
	}

	ciphertext, _ := hex.DecodeString(encryptedText)
	if len(ciphertext) < aes.BlockSize {
		panic("ciphertext too short")
	}

	iv := ciphertext[:aes.BlockSize]
	ciphertext = ciphertext[aes.BlockSize:]

	stream := cipher.NewCTR(block, iv)
	stream.XORKeyStream(ciphertext, ciphertext)

	return string(ciphertext)
}
