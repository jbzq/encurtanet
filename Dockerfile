FROM golang:1.24 as builder

WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o encurtanet ./backend

FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/encurtanet .
COPY --from=builder /app/frontend ./frontend

EXPOSE 8080
CMD ["./encurtanet"]
