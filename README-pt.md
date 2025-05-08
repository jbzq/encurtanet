# encurtanet

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Go](https://img.shields.io/badge/Go-1.20+-00ADD8?logo=go)
![Status](https://img.shields.io/badge/status-In%20Development-yellow)

> [!NOTE]
> Este projeto não salva URLs encurtadas em um banco de dados ou arquivo. Todos as URLs encurtadas são armazenados na memória e serão perdidas quando o servidor for reiniciado.
>
> O projeto foi projetado para ser executado localmente e não inclui configurações para implantação de produção.
>

Um encurtador de urls simples escrito em golang

## Funcionalidades

* Encurtamento de URLs: Gera um identificador único para cada URL fornecida.
* Redirecionamento: URLs encurtadas redirecionam para o endereço original.
* Interface Simples: Inclui uma interface web para encurtar URLs diretamente no navegador.
* Criptografia: URLs são armazenadas de forma criptografada na memória.

## Como usar

Para rodar o projeto, clone este repositorio

Excute `go run main.go` e execute em outro terminal `curl localhost:8080/shorten?url=<https://sua-url>`;

por exemplo: `curl localhost:8080/shorten?url=https://www.google.com` ;

ou acesse no seu navegador: http://localhost:8080

## Limitações

* Não Persistente: Este projeto não salva os encurtamentos em um banco de dados ou arquivo. Todas as URLs encurtadas são armazenadas apenas na memória e serão perdidas ao reiniciar o servidor.
* Uso Local: O projeto foi projetado para rodar localmente e não inclui configurações para implantação em produção.

## Melhorias Futuras

* Adicionar persistência com banco de dados (ex.: SQLite, PostgreSQL).
* Implementar autenticação para gerenciar URLs encurtadas.
* Criar uma API RESTful completa para integração com outros sistemas.
* Adicionar suporte para métricas de uso (ex.: número de cliques em cada URL).

## Licença

Este projeto está licenciado sob a [`MIT License.`](/LICENSE)