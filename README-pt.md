# encurtanet

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Go](https://img.shields.io/badge/Go-1.20+-00ADD8?logo=go)
![Status](https://img.shields.io/badge/status-In%20Development-yellow)

Um encurtador de URLs simples porém poderoso, construído em Go, com criptografia e interface web moderna.

> [!NOTE]
> Este é um encurtador de URLs em memória. As URLs encurtadas são armazenadas na memória e serão perdidas quando o servidor reiniciar.
>
> Projetado principalmente para desenvolvimento local e testes. Não recomendado para uso em produção sem uma camada adicional de persistência.

## Funcionalidades

* **Encurtamento de URLs**: Gera identificadores curtos e únicos para URLs longas
* **Armazenamento seguro**: Criptografa URLs na memória usando AES
* **Interface Web Moderna**:
  * Formulário para encurtar URLs
  * Funcionalidade de copiar
  * Histórico de URLs encurtadas recentemente
* **API Simples**: Fácil integração via endpoint REST
* **Redirecionamentos**: URLs curtas redirecionam para os destinos originais

## Começando

### Pré-requisitos
- Go 1.20+ instalado
- Conhecimento básico de terminal

### Instalação
1. Clone o repositório:
   ```bash
   git clone https://github.com/jbzq/encurtanet.git
   cd encurtanet
   ```

2. Execute o Servidor:
   ```bash
   go run main.go
   ```

### Como Usar
#### Interface Web
Acesse a interface web em: http://localhost:8080

#### Uso da API
Encurte URLs via API:
```bash
curl "localhost:8080/shorten?url=https://sua-url-longa.com"
```

Exemplo:
```bash
curl "localhost:8080/shorten?url=https://www.google.com"
```

### Detalhes Técnicos

Criptografia: Usa AES-CTR para armazenamento seguro na memória
Geração de IDs Curtos: Cria identificadores aleatórios de 6 caracteres
Gerenciamento de Memória: Usa sync.Mutex para operações thread-safe

## Limitações

Sem persistência: URLs são perdidas ao reiniciar o servidor
Sem análises: Não conta cliques nas URLs
Sem autenticação: Todos os usuários têm acesso igual

## Melhorias Futuras

Adicionar persistência em banco de dados (SQLite/PostgreSQL)
Implementar autenticação de usuários
Adicionar estatísticas de cliques
Criar documentação da API REST
Dockerizar a aplicação
Adicionar limitação de taxa (rate limiting)

### Contribuindo
Contribuições são bem-vindas! Por favor abra uma issue ou pull request.

### Licença
Este projeto está licenciado sob a [MIT License](/LICENSE).
