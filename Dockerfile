# Build stage
FROM golang:1.24 as builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o encurtanet

# Execution stage
FROM gcr.io/distroless/static-debian11
WORKDIR /app
COPY --from=builder /app/encurtanet .
COPY --from=builder /app/index.html .
COPY --from=builder /app/static ./static
EXPOSE 8080
CMD ["./encurtanet"]
