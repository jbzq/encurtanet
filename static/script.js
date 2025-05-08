const form = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const resultDiv = document.getElementById('result');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value;

    try {
        const response = await fetch('http://localhost:8080/shorten?url=' + encodeURIComponent(url), {
            method: 'GET',
        });

        if (response.ok) {
            const shortUrl = await response.text();
            resultDiv.style.display = 'block'; // Exibe a caixa de resultado
            resultDiv.innerHTML = `<p>Shortened URL:</p><a href="${shortUrl}" target="_blank">${shortUrl}</a>`;
        } else {
            const errorText = await response.text();
            resultDiv.style.display = 'block'; // Exibe a caixa de erro
            resultDiv.innerHTML = `<p style="color: red;">Error: ${errorText}</p>`;
        }
    } catch (error) {
        resultDiv.style.display = 'block'; // Exibe a caixa de erro
        resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
});