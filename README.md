# encurtanet

[`português`](/README-pt.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Go](https://img.shields.io/badge/Go-1.20+-00ADD8?logo=go)
![Status](https://img.shields.io/badge/status-In%20Development-yellow)

A simple yet powerful URL shortener built with Go, featuring encryption and a modern web interface.

> [!NOTE]
> This is an in-memory URL shortener. Shortened URLs are stored in memory and will be lost when the server restarts.
>
> Designed primarily for local development and testing. Not recommended for production use without additional persistence layer.

## Features

* **URL Shortening**: Generates short, unique identifiers for long URLs
* **Secure Storage**: Encrypts URLs in memory using AES encryption
* **Modern Web Interface**: Responsive UI with:
  * URL shortening form
  * Copy functionality
  * History of recent shortened URLs
* **Simple API**: Easy integration via REST endpoint
* **Redirects**: Short URLs properly redirect to original destinations

## Getting Started

### Prerequisites
- Go 1.20+ installed
- Basic terminal knowledge

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/jbzq/encurtanet.git
   cd encurtanet
   ```

2. Run the Server:
  ```bash
  go run main.go
  ``` 

### Usage

#### Web Interface
Access the web interface at: http://localhost:8080

#### API Usage
Shorten URLs via API:

```bash
curl "localhost:8080/shorten?url=https://your-long-url.com"
```

Example:

```bash
curl "localhost:8080/shorten?url=https://www.google.com"
```

### Technical Details
* Encryption: Uses AES-CTR for URL storage in memory
* Short ID Generation: Creates 6-character random identifiers
* Memory Management: Uses sync.Mutex for thread-safe operations

### Limitations
* No persistence: URLs are lost on server restart
* No analytics: Doesn't track click counts
* No authentication: All users have equal access

### Future Improvements

* Add database persistence (SQLite/PostgreSQL)
* Implement user authentication
* Add click analytics
* Create REST API documentation
* Dockerize application
* Add rate limiting

### Contributing
Contributions are welcome! Please open an issue or pull request.

### License
This project is licensed under the [MIT License](/LICENSE).
