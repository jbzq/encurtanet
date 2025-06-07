export class StatsDashboard {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.statsUrlInput = document.getElementById('statsUrlInput');
        this.loadStatsBtn = document.getElementById('loadStatsBtn');
        this.statsContainer = document.getElementById('statsContainer');
        this.totalClicksElement = document.getElementById('totalClicks');
        this.lastClickElement = document.getElementById('lastClick');
        this.devicesChart = null;
        this.referrersChart = null;
        
        this.init();
    }

    init() {
        this.loadStatsBtn.addEventListener('click', () => this.loadStats());
    }

    async loadStats() {
        const shortUrl = this.statsUrlInput.value.trim();
        
        if (!shortUrl) {
            this.showAlert('Por favor, insira uma URL encurtada', 'error');
            return;
        }
        
        const urlParts = shortUrl.split('/');
        const shortId = urlParts[urlParts.length - 1];
        
        if (!shortId) {
            this.showAlert('URL inválida. Cole a URL encurtada completa.', 'error');
            return;
        }
        
        try {
            this.setLoadingState(true);
            
            const stats = await this.apiClient.getStats(shortId);
            this.displayStats(stats);
            
        } catch (error) {
            console.error('Error loading stats:', error);
            this.showAlert(`Erro ao carregar estatísticas: ${error.message}`, 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    displayStats(stats) {
        // Atualizar estatísticas sumárias
        this.totalClicksElement.textContent = stats.Clicks;
        this.lastClickElement.textContent = stats.LastClicked 
            ? new Date(stats.LastClicked).toLocaleString() 
            : 'N/A';
        
        // Preparar dados para os gráficos
        const devicesData = {
            labels: Object.keys(stats.datasets: [{
                data: Object.values(stats.Devices),
                backgroundColor: [
                    '#4cc9f0',
                    '#4895ef',
                    '#4361ee'
                ]
            }]
        };
        
        const referrersData = {
            labels: Object.keys(stats.Referrers),
            datasets: [{
                data: Object.values(stats.Referrers),
                backgroundColor: [
                    '#f72585',
                    '#b5179e',
                    '#7209b7',
                    '#560bad',
                    '#480ca8'
                ]
            }]
        };
        
        // Destruir gráficos existentes
        if (this.devicesChart) this.devicesChart.destroy();
        if (this.referrersChart) this.referrersChart.destroy();
        
        // Criar novos gráficos
        const devicesCtx = document.getElementById('devicesChart').getContext('2d');
        this.devicesChart = new Chart(devicesCtx, {
            type: 'doughnut',
            data: devicesData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        const referrersCtx = document.getElementById('referrersChart').getContext('2d');
        this.referrersChart = new Chart(referrersCtx, {
            type: 'pie',
            data: referrersData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // Mostrar container
        this.statsContainer.style.display = 'block';
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.loadStatsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
            this.loadStatsBtn.classList.add('loading');
            this.loadStatsBtn.disabled = true;
        } else {
            this.loadStatsBtn.innerHTML = '<i class="fas fa-chart-line"></i> Carregar Estatísticas';
            this.loadStatsBtn.classList.remove('loading');
            this.loadStatsBtn.disabled = false;
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
