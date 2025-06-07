const form = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const resultDiv = document.getElementById('result');

// URL do backend no Render - substitua 'encurtanet' pelo nome do seu serviço no Render
const API_BASE_URL = 'https://encurtanet.onrender.com';

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    
    // Validação básica do URL
    if (!url) {
        showError('Por favor, insira uma URL');
        return;
    }

    try {
        // Usando POST em vez de GET para melhor segurança
        const response = await fetch(`${API_BASE_URL}/shorten?url=${encodeURIComponent(url)}`, {
            method: 'GET', // Mantendo GET conforme seu backend atual
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const shortUrl = await response.text();
            showResult(shortUrl);
        } else {
            const errorText = await response.text();
            showError(errorText);
        }
    } catch (error) {
        showError(`Erro de conexão: ${error.message}`);
    }
});

function showResult(shortUrl) {
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <p>URL encurtada:</p>
        <div class="result-link">
            <a href="${shortUrl}" target="_blank" id="shortUrlLink">${shortUrl}</a>
            <button onclick="copyToClipboard('${shortUrl}')" class="copy-btn">
                <i class="fas fa-copy"></i> Copiar
            </button>
        </div>
    `;
}

function showError(message) {
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `<p class="error-message">${message}</p>`;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
        }, 2000);
    });
}
