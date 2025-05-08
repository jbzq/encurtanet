# encurtanet

[`portuguese`](/README-pt.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Go](https://img.shields.io/badge/Go-1.20+-00ADD8?logo=go)
![Status](https://img.shields.io/badge/status-In%20Development-yellow)

> [!NOTE]
> This project does not save shortened URLs in a database or file. All shortened URLs are stored in memory and will be lost when the server restarts.
>
> The project is designed to run locally and does not include configurations for production deployment.
>

## Features

* URL Shortening: Generates a unique identifier for each provided URL.
* Redirection: Shortened URLs redirect to the original address.
* Simple Interface: Includes a web interface to shorten URLs directly in the browser.
* Encryption: URLs are stored securely in memory using encryption.

## How to Run the Project

1. Clone this repository:

   ```bash
   git clone https://github.com/jbzq/encurtanet.git
   cd encurtanet
   ```

2. Start the server:

   ```bash
   go run main.go
   ```

3. Shorten URLs via terminal:

   ```bash
   curl localhost:8080/shorten?url=https://your-url
   ```

Exemple:
   ```bash
   curl localhost:8080/shorten?url=https://www.google.com
   ```

4. Access the web interface in your browser: http://localhost:8080


## Future Improvements

* Add persistence with a database (e.g., SQLite, PostgreSQL).
* Implement authentication to manage shortened URLs.
* Create a complete RESTful API for integration with other systems.
* Add support for usage metrics (e.g., number of clicks per URL).

## License

This project is licensed under the [MIT License.](/LICENSE)