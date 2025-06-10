FROM golang:1.24 as builder

WORKDIR /app
COPY go.mod .
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o encurtanet ./backend

FROM alpine:3.19
WORKDIR /app

COPY --from=builder /app/encurtanet .
COPY --from=builder /app/frontend ./frontend

RUN chmod -R 755 /app/frontend/static

EXPOSE 8080
CMD ["./encurtanet"]
