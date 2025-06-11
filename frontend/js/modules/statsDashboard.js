export class StatsDashboard {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.statsContainer = document.getElementById('statsContainer');
        this.init();
    }

    async init() {
        if (!this.statsContainer) {
            console.error('Stats container not found');
            return;
        }
        await this.loadStats();
        this.setupEventListeners();
    }

    async loadStats() {
        try {
            const stats = await this.apiClient.getStats();
            this.displayStats(stats || {}); // Fallback para objeto vazio
        } catch (error) {
            console.error('Error loading stats:', error);
            this.showError();
        }
    }

    displayStats(stats) {
        // Verificação segura
        const safeStats = stats || {};
        const statsData = {
            totalClicks: safeStats.totalClicks || 0,
            browsers: safeStats.browsers || {},
            devices: safeStats.devices || {},
            lastAccessed: safeStats.lastAccessed || 'Nunca'
        };

        // Renderização segura
        this.statsContainer.innerHTML = `
            <div class="stats-card">
                <h3>Estatísticas</h3>
                <div class="stat-item">
                    <span>Total de acessos:</span>
                    <strong>${statsData.totalClicks}</strong>
                </div>
                <div class="stat-item">
                    <span>Último acesso:</span>
                    <strong>${statsData.lastAccessed}</strong>
                </div>
                <!-- Adicione mais estatísticas conforme necessário -->
            </div>
        `;

        this.renderCharts(statsData);
    }

    renderCharts(statsData) {
        // Verificação adicional para gráficos
        if (!statsData.browsers || !statsData.devices) {
            console.warn('Dados incompletos para gráficos');
            return;
        }
        
        // Sua lógica de gráficos aqui
        // Exemplo com Chart.js:
        new Chart(document.getElementById('browserChart'), {
            type: 'pie',
            data: {
                labels: Object.keys(statsData.browsers),
                datasets: [{
                    data: Object.values(statsData.browsers),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
                }]
            }
        });
    }

    showError() {
        this.statsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Não foi possível carregar as estatísticas</p>
                <button class="retry-btn">Tentar novamente</button>
            </div>
        `;
    }

    setupEventListeners() {
        this.statsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('retry-btn')) {
                this.loadStats();
            }
        });
    }
}
