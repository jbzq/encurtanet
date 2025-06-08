/**
 * Cliente API para o encurtador de URLs
 * version 2.0.0
 */
export class ApiClient {
  constructor(config = {}) {
    // Configurações padrão
    this.config = {
      baseUrl: this._determineBaseUrl(),
      timeout: 8000, // 8 segundos
      retries: 2, // Número de tentativas
      retryDelay: 1000, // 1 segundo entre tentativas
      ...config
    };

    // Polyfill para fetch se necessário
    this._ensureFetch();
  }

  /* ========== Métodos Públicos ========== */

  /**
   * Verifica a saúde do servidor
   * @returns {Promise<boolean>}
   */
  async checkHealth() {
    try {
      const response = await this._fetchWithRetry(
        `${this.config.baseUrl}/health`,
        {
          method: 'GET',
          headers: { 'Accept': 'text/plain' }
        }
      );
      
      const text = await response.text();
      return text.trim() === "OK";
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Encurta uma URL
   * @param {string} originalUrl - URL original para encurtar
   * @returns {Promise<string>} URL encurtada
   */
  async shortenUrl(originalUrl) {
    if (!this._isValidUrl(originalUrl)) {
      throw new Error('URL inválida. Deve começar com http:// ou https://');
    }

    try {
      const response = await this._fetchWithRetry(
        `${this.config.baseUrl}/api/shorten?url=${encodeURIComponent(originalUrl)}`,
        {
          method: 'GET',
          headers: { 'Accept': 'text/plain' }
        }
      );

      return await response.text();
    } catch (error) {
      throw this._enhanceError(error, 'Erro ao encurtar URL');
    }
  }

  /**
   * Obtém estatísticas de uma URL encurtada
   * @param {string} shortId - ID da URL encurtada
   * @returns {Promise<Object>} Estatísticas
   */
  async getStats(shortId) {
    try {
      const response = await this._fetchWithRetry(
        `${this.config.baseUrl}/api/stats?id=${shortId}`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }
      );

      return await response.json();
    } catch (error) {
      throw this._enhanceError(error, 'Erro ao obter estatísticas');
    }
  }

  /* ========== Métodos Privados ========== */

  async _fetchWithRetry(resource, options, retries = this.config.retries) {
    try {
      return await this._fetchWithTimeout(resource, options);
    } catch (error) {
      if (retries > 0 && this._isRetriable(error)) {
        await this._delay(this.config.retryDelay);
        return this._fetchWithRetry(resource, options, retries - 1);
      }
      throw error;
    }
  }

  async _fetchWithTimeout(resource, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await window.fetch(resource, {
        method: 'GET', // padrão
        cache: 'no-store',
        referrerPolicy: 'strict-origin-when-cross-origin',
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await this._parseError(response);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw this._normalizeError(error);
    }
  }

  _determineBaseUrl() {
    // Ambiente de desenvolvimento
    if (typeof window === 'undefined') {
      return process.env.API_BASE_URL || 'http://localhost:8080';
    }

    // Verifica se estamos em localhost
    if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      return 'http://localhost:8080';
    }

    // Produção - usa a URL atual
    return window.location.origin;
  }

  _ensureFetch() {
    if (typeof window !== 'undefined' && !window.fetch) {
      console.warn('Fetch API não disponível, carregando polyfill...');
      import('whatwg-fetch').then(({ fetch }) => {
        window.fetch = fetch;
      });
    }
  }

  _isValidUrl(url) {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }

  async _parseError(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      try {
        return await response.json();
      } catch {
        return { message: 'Resposta inválida do servidor' };
      }
    }
    
    return { message: await response.text() };
  }

  _normalizeError(error) {
    if (error.name === 'AbortError') {
      return new Error(`Timeout: A requisição excedeu o tempo limite de ${this.config.timeout}ms`);
    }

    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return new Error('Falha na conexão com o servidor');
    }

    return error;
  }

  _enhanceError(error, context) {
    error.message = `${context}: ${error.message}`;
    return error;
  }

  _isRetriable(error) {
    // Erros de rede ou timeout podem ser tentados novamente
    return error.message.includes('Timeout') || 
           error.message.includes('Falha na conexão');
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Exportação para uso em módulos
export default ApiClient;
