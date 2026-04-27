FROM golang:1.21 AS builder
WORKDIR /chaincode

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o governance-chaincode .

FROM alpine:3.20
RUN adduser -D -u 10001 chaincode
USER chaincode
WORKDIR /app
COPY --from=builder /chaincode/governance-chaincode /app/governance-chaincode
EXPOSE 9999
ENTRYPOINT ["/app/governance-chaincode"]
