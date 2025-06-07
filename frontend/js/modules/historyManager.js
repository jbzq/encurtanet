export class HistoryManager {
    constructor() {
        this.historyList = document.getElementById('historyList');
        this.history = JSON.parse(localStorage.getItem('urlHistory')) || [];
        
        this.render();
    }

    addToHistory(originalUrl, shortUrl) {
        const newItem = {
            originalUrl,
            shortUrl,
            date: new Date().toLocaleString(),
            id: Date.now()
        };
        
        this.history.unshift(newItem);
        
        // Limitar histórico
        if (this.history.length > 10) {
            this.history.pop();
        }
        
        this.saveToLocalStorage();
        this.render();
    }

    saveToLocalStorage() {
        localStorage.setItem('urlHistory', JSON.stringify(this.history));
    }

    removeFromHistory(id) {
        this.history = this.history.filter(item => item.id !== id);
        this.saveToLocalStorage();
        this.render();
    }

    render() {
        this.historyList.innerHTML = '';
        
        if (this.history.length === 0) {
            this.historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>Nenhuma URL encurtada ainda</p>
                </div>
            `;
            return;
        }
        
        this.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="url-info">
                    <div class="original-url" title="${item.originalUrl}">
                        ${this.truncateText(item.originalUrl, 50)}
                    </div>
                    <div class="shortened-url" title="${item.shortUrl}">
                        ${this.truncateText(item.shortUrl, 30)}
                    </div>
                    <div class="history-date">${item.date}</div>
                </div>
                <div class="history-actions">
                    <button class="action-btn copy-btn-history" data-url="${item.shortUrl}">
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                    <button class="action-btn delete-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            `;
            
            this.historyList.appendChild(historyItem);
        });
        
        this.setupItemEvents();
    }

    setupItemEvents() {
        document.querySelectorAll('.copy-btn-history').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.getAttribute('data-url');
                navigator.clipboard.writeText(url)
                    .then(() => {
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                        setTimeout(() => {
                            btn.innerHTML = originalText;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy:', err);
                        this.showAlert('Falha ao copiar URL', 'error');
                    });
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                this.removeFromHistory(id);
            });
        });
    }

    truncateText(text, maxLength) {
        return text.length > maxLength 
            ? text.substring(0, maxLength) + '...' 
            : text;
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
