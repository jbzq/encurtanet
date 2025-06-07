# Build stage
FROM golang:1.24 as builder

WORKDIR /app

ENV GO111MODULE=on

COPY go.mod go.sum ./
RUN go mod download
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o encurtanet ./backend

FROM alpine:3.19
RUN apk --no-cache add \
    ca-certificates \
    tzdata

WORKDIR /app

# Copy binary and static files
COPY --from=builder /app/encurtanet .
COPY --from=builder /app/frontend ./frontend

# Set timezone
ENV TZ=UTC

# Expose port and health check
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the application
CMD ["./encurtanet"]
