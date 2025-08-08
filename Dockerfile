# Build stage
FROM cgr.dev/chainguard/go AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/main ./cmd/server

# Final stage
FROM cgr.dev/chainguard/static

WORKDIR /app

COPY --from=builder /app/main .
COPY --from=builder /app/static ./static

EXPOSE 8000

CMD ["/app/main"]
