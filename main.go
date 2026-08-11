package main

import (
	"bufio"
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"sync/atomic"
	"syscall"
	"time"
)

const (
	totalRequests = 1_000_000
	workers       = 100
)

type RedirectRequest struct {
	Alias *string `json:"alias"`
	URL   string  `json:"url"`
}

type Stats struct {
	sent       atomic.Int64
	created    atomic.Int64
	clientErr  atomic.Int64
	serverErr  atomic.Int64
	networkErr atomic.Int64
}

func randomString(bytesLength int) string {
	b := make([]byte, bytesLength)

	if _, err := rand.Read(b); err != nil {
		panic(err)
	}

	return hex.EncodeToString(b)
}

func makePayload() RedirectRequest {
	var alias *string

	// Roughly 50% of requests have an alias.
	randomByte := make([]byte, 1)
	if _, err := rand.Read(randomByte); err != nil {
		panic(err)
	}

	if randomByte[0]%2 == 0 {
		value := "stress-" + randomString(8)
		alias = &value
	}

	return RedirectRequest{
		Alias: alias,
		URL:   "https://example.com/stress/" + randomString(12),
	}
}

func main() {
	baseURL := os.Getenv("BASE_URL")

	if baseURL == "" {
		fmt.Println("BASE_URL environment variable is required")
		fmt.Println()
		fmt.Println("Example:")
		fmt.Println(`BASE_URL=http://localhost:8000 go run main.go`)
		os.Exit(1)
	}

	endpoint := baseURL + "/api/v1/redirects/guest_redirect"

	fmt.Println("Stress test starting")
	fmt.Println("--------------------")
	fmt.Println("Endpoint :", endpoint)
	fmt.Println("Requests :", totalRequests)
	fmt.Println("Workers  :", workers)
	fmt.Println()

	client := &http.Client{
		Transport: &http.Transport{
			MaxIdleConns:        workers * 2,
			MaxIdleConnsPerHost: workers,
			MaxConnsPerHost:     workers,
			IdleConnTimeout:     90 * time.Second,
		},
		Timeout: 15 * time.Second,
	}

	createdFile, err := os.Create("created.log")
	if err != nil {
		panic(err)
	}
	defer createdFile.Close()

	errorFile, err := os.Create("5xx.log")
	if err != nil {
		panic(err)
	}
	defer errorFile.Close()

	createdWriter := bufio.NewWriterSize(createdFile, 1024*1024)
	errorWriter := bufio.NewWriterSize(errorFile, 1024*1024)

	defer createdWriter.Flush()
	defer errorWriter.Flush()

	var createdMu sync.Mutex
	var errorMu sync.Mutex

	var stats Stats

	ctx, cancel := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
	)
	defer cancel()

	jobs := make(chan int, workers*2)

	var wg sync.WaitGroup

	start := time.Now()

	for workerID := 0; workerID < workers; workerID++ {
		wg.Add(1)

		go func(workerID int) {
			defer wg.Done()

			for requestNumber := range jobs {
				select {
				case <-ctx.Done():
					return
				default:
				}

				payload := makePayload()

				body, err := json.Marshal(payload)
				if err != nil {
					fmt.Printf("marshal error: %v\n", err)
					continue
				}

				req, err := http.NewRequestWithContext(
					ctx,
					http.MethodPost,
					endpoint,
					bytes.NewReader(body),
				)

				if err != nil {
					stats.networkErr.Add(1)
					continue
				}

				req.Header.Set("Content-Type", "application/json")
				req.Header.Set("Accept", "application/json")

				response, err := client.Do(req)

				stats.sent.Add(1)

				if err != nil {
					stats.networkErr.Add(1)

					errorMu.Lock()
					fmt.Fprintf(
						errorWriter,
						"REQUEST=%d WORKER=%d NETWORK_ERROR=%q PAYLOAD=%s\n",
						requestNumber,
						workerID,
						err.Error(),
						string(body),
					)
					errorMu.Unlock()

					continue
				}

				responseBody, err := io.ReadAll(response.Body)
				response.Body.Close()

				if err != nil {
					stats.networkErr.Add(1)
					continue
				}

				switch {
				case response.StatusCode >= 200 && response.StatusCode < 300:
					stats.created.Add(1)

					createdMu.Lock()
					fmt.Fprintf(
						createdWriter,
						"REQUEST=%d STATUS=%d PAYLOAD=%s RESPONSE=%s\n",
						requestNumber,
						response.StatusCode,
						string(body),
						string(responseBody),
					)
					createdMu.Unlock()

				case response.StatusCode >= 500:
					stats.serverErr.Add(1)

					errorMu.Lock()
					fmt.Fprintf(
						errorWriter,
						"REQUEST=%d STATUS=%d PAYLOAD=%s RESPONSE=%s\n",
						requestNumber,
						response.StatusCode,
						string(body),
						string(responseBody),
					)
					errorMu.Unlock()

				case response.StatusCode >= 400:
					stats.clientErr.Add(1)
				}
			}
		}(workerID)
	}

	// Live statistics.
	done := make(chan struct{})

	go func() {
		ticker := time.NewTicker(time.Second)
		defer ticker.Stop()

		var previous int64

		for {
			select {
			case <-ticker.C:
				sent := stats.sent.Load()
				currentRate := sent - previous
				previous = sent

				elapsed := time.Since(start).Seconds()

				var averageRate float64
				if elapsed > 0 {
					averageRate = float64(sent) / elapsed
				}

				fmt.Printf(
					"\rSent: %d/%d | Created: %d | 4xx: %d | 5xx: %d | Network: %d | RPS: %d | Avg RPS: %.0f",
					sent,
					totalRequests,
					stats.created.Load(),
					stats.clientErr.Load(),
					stats.serverErr.Load(),
					stats.networkErr.Load(),
					currentRate,
					averageRate,
				)

			case <-done:
				return
			}
		}
	}()

	for i := 1; i <= totalRequests; i++ {
		select {
		case jobs <- i:
		case <-ctx.Done():
			break
		}

		if ctx.Err() != nil {
			break
		}
	}

	close(jobs)

	wg.Wait()
	close(done)

	createdWriter.Flush()
	errorWriter.Flush()

	duration := time.Since(start)

	fmt.Println()
	fmt.Println()
	fmt.Println("Stress test finished")
	fmt.Println("--------------------")
	fmt.Printf("Duration       : %s\n", duration)
	fmt.Printf("Requests sent  : %d\n", stats.sent.Load())
	fmt.Printf("Created        : %d\n", stats.created.Load())
	fmt.Printf("4xx responses  : %d\n", stats.clientErr.Load())
	fmt.Printf("5xx responses  : %d\n", stats.serverErr.Load())
	fmt.Printf("Network errors : %d\n", stats.networkErr.Load())

	if duration.Seconds() > 0 {
		fmt.Printf(
			"Average RPS    : %.2f\n",
			float64(stats.sent.Load())/duration.Seconds(),
		)
	}

	fmt.Println()
	fmt.Println("Created responses: created.log")
	fmt.Println("5xx responses    : 5xx.log")
}