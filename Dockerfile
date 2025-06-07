# Build stage
FROM golang:1.21 as builder
WORKDIR /app
COPY . .
RUN go mod download
RUN CGO_ENABLED=0 GOSS=linux go build -o encurtanet

# Execution stage
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/encurtanet .
COPY --from=builder /app/index.html .
COPY --from-builder /app/static .static
EXPOSE 8080
CMD ["./encurtanet"]
