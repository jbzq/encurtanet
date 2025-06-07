export class ApiClient {
    constructor() {
        this.baseUrl = window.location.origin;
    }

    async shortenUrl(originalUrl) {
        const response = await fetch(`${this.baseUrl}/shorten?url=${encodeURIComponent(originalUrl)}`, {
            headers: {
                'Accept': 'text/plain'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erro ao encurtar URL');
        }
        
        return await response.text();
    }

    async getStats(shortId) {
        const response = await fetch(`${this.baseUrl}/stats?id=${shortId}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erro ao carregar estatísticas');
        }
        
        return await response.json();
    }

    async checkHealth() {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}
