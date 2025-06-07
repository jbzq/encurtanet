export class FormHandler {
    constructor(apiClient, historyManager) {
        this.apiClient = apiClient;
        this.historyManager = historyManager;
        this.form = document.getElementById('urlForm');
        this.urlInput = document.getElementById('originalUrl');
        this.shortenBtn = document.getElementById('shortenBtn');
        this.resultContainer = document.getElementById('resultContainer');
        this.shortUrlElement = document.getElementById('shortUrl');
        this.copyBtn = document.getElementById('copyBtn');
        
        this.setupEvents();
    }

    setupEvents() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });
        
        this.copyBtn.addEventListener('click', () => this.handleCopyClick());
    }

    async handleSubmit() {
        const originalUrl = this.urlInput.value.trim();
        
        if (!this.isValidUrl(originalUrl)) {
            this.showAlert('Por favor, insira uma URL válida começando com http:// ou https://', 'error');
            return;
        }
        
        try {
            this.setLoadingState(true);
            
            const shortUrl = await this.apiClient.shortenUrl(originalUrl);
            
            this.shortUrlElement.textContent = shortUrl;
            this.resultContainer.style.display = 'block';
            
            this.historyManager.addToHistory(originalUrl, shortUrl);
            this.showAlert('URL encurtada com sucesso!', 'success');
            
        } catch (error) {
            console.error('Error:', error);
            this.showAlert(`Erro ao encurtar URL: ${error.message}`, 'error');
        } finally {
            this.setLoadingState(false);
            this.urlInput.focus();
        }
    }

    handleCopyClick() {
        if (!this.shortUrlElement.textContent) return;
        
        navigator.clipboard.writeText(this.shortUrlElement.textContent)
            .then(() => {
                this.showCopyFeedback();
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                this.showAlert('Falha ao copiar URL', 'error');
            });
    }

    showCopyFeedback() {
        this.copyBtn.classList.add('copied');
        this.copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        
        setTimeout(() => {
            this.copyBtn.classList.remove('copied');
            this.copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
        }, 2000);
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return url.startsWith('http://') || url.startsWith('https://');
        } catch (e) {
            return false;
        }
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.shortenBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Encurtando...';
            this.shortenBtn.classList.add('loading');
            this.shortenBtn.disabled = true;
        } else {
            this.shortenBtn.innerHTML = '<i class="fas fa-rocket"></i> Encurtar URL';
            this.shortenBtn.classList.remove('loading');
            this.shortenBtn.disabled = false;
        }
    }

    showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${type}`;
        alertDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.classList.add('fade-out');
            setTimeout(() => {
                alertDiv.remove();
            }, 500);
        }, 3000);
    }
}
