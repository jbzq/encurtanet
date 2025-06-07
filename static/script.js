document.addEventListener('DOMContentLoaded', function() {
    const urlForm = document.getElementById('urlForm');
    const originalUrlInput = document.getElementById('originalUrl');
    const shortenBtn = document.getElementById('shortenBtn');
    const resultContainer = document.getElementById('resultContainer');
    const shortUrlElement = document.getElementById('shortUrl');
    const copyBtn = document.getElementById('copyBtn');
    const historyList = document.getElementById('historyList');
    
    // Obter a URL base dinamicamente
    const baseUrl = window.location.origin;
    
    // Carregar histórico do localStorage
    let urlHistory = JSON.parse(localStorage.getItem('urlHistory')) || [];
    renderHistory();
    
    urlForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const originalUrl = originalUrlInput.value.trim();
        
        if (!isValidUrl(originalUrl)) {
            showAlert('Por favor, insira uma URL válida.', 'error');
            return;
        }
        
        // Mostrar estado de carregamento
        shortenBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Encurtando...';
        shortenBtn.classList.add('loading');
        
        try {
            // Chamar o endpoint do backend para encurtar a URL
            const response = await fetch(`${baseUrl}/shorten?url=${encodeURIComponent(originalUrl)}`, {
                headers: {
                    'Accept': 'text/plain'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Erro ao encurtar URL');
            }
            
            const shortUrl = await response.text();
            
            // Exibir resultado
            shortUrlElement.textContent = shortUrl;
            resultContainer.style.display = 'block';
            
            // Adicionar ao histórico
            const urlData = {
                originalUrl,
                shortUrl,
                date: new Date().toLocaleString()
            };
            
            urlHistory.unshift(urlData);
            if (urlHistory.length > 10) urlHistory.pop();
            
            // Salvar no localStorage
            localStorage.setItem('urlHistory', JSON.stringify(urlHistory));
            
            // Atualizar histórico na tela
            renderHistory();
            
        } catch (error) {
            console.error('Erro ao encurtar URL:', error);
            showAlert(`Erro ao encurtar URL: ${error.message}`, 'error');
        } finally {
            // Restaurar o botão
            shortenBtn.innerHTML = '<i class="fas fa-rocket"></i> Encurtar URL';
            shortenBtn.classList.remove('loading');
        }
    });
    
    copyBtn.addEventListener('click', function() {
        if (!shortUrlElement.textContent) return;
        
        navigator.clipboard.writeText(shortUrlElement.textContent)
            .then(() => {
                // Feedback visual
                copyBtn.classList.add('copied');
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
                }, 2000);
            })
            .catch(err => {
                console.error('Falha ao copiar texto: ', err);
                showAlert('Falha ao copiar URL', 'error');
            });
    });
    
    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    function renderHistory() {
        historyList.innerHTML = '';
        
        if (urlHistory.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; padding: 20px;">Nenhuma URL encurtada ainda.</p>';
            return;
        }
        
        urlHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="url-info">
                    <div class="original-url">${item.originalUrl}</div>
                    <div class="shortened-url">${item.shortUrl}</div>
                    <div class="history-date">${item.date}</div>
                </div>
                <div class="history-actions">
                    <button class="action-btn copy-btn-history" data-url="${item.shortUrl}">
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                    <button class="action-btn delete-btn" data-url="${item.shortUrl}">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            `;
            
            historyList.appendChild(historyItem);
        });
        
        // Adicionar eventos aos botões do histórico
        document.querySelectorAll('.copy-btn-history').forEach(btn => {
            btn.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                
                navigator.clipboard.writeText(url)
                    .then(() => {
                        const originalText = this.innerHTML;
                        this.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                        
                        setTimeout(() => {
                            this.innerHTML = originalText;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Falha ao copiar texto: ', err);
                        showAlert('Falha ao copiar URL', 'error');
                    });
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                urlHistory = urlHistory.filter(item => item.shortUrl !== url);
                localStorage.setItem('urlHistory', JSON.stringify(urlHistory));
                renderHistory();
            });
        });
    }
    
    function showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${type}`;
        alertDiv.textContent = message;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.classList.add('fade-out');
            setTimeout(() => {
                alertDiv.remove();
            }, 500);
        }, 3000);
    }
});
