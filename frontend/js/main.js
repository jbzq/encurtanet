import { ApiClient } from './modules/apiClient.js';
import { FormHandler } from './modules/formHandler.js';
import { HistoryManager } from './modules/historyManager.js';
import { StatsDashboard } from './modules/statsDashboard.js';

class App {
    constructor() {
        this.apiClient = new ApiClient();
        this.init();
    }

    async init() {
        await this.loadTemplate();
        const historyManager = new HistoryManager();
        new FormHandler(this.apiClient, historyManager);
        new StatsDashboard(this.apiClient);
        
        // Verificar status do servidor
        await this.checkServerStatus();
    }

    async loadTemplate() {
        try {
            const response = await fetch('/templates/main.html');
            const html = await response.text();
            document.getElementById('app').innerHTML = html;
        } catch (error) {
            console.error('Error loading template:', error);
            document.getElementById('app').innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao carregar a aplicação. Por favor, recarregue a página.</p>
                </div>
            `;
        }
    }

    async checkServerStatus() {
        const isHealthy = await this.apiClient.checkHealth();
        if (!isHealthy) {
            this.showAlert('Servidor está iniciando, aguarde alguns instantes...', 'error');
            await new Promise(resolve => setTimeout(resolve, 2000));
            return this.checkServerStatus();
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

// Inicializar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
