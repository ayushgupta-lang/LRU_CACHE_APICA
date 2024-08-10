package main

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	lru "github.com/hashicorp/golang-lru"
)

var (
	cache *lru.Cache
	mutex sync.Mutex
)

func init() {
	var err error
	cache, err = lru.New(1024)
	if err != nil {
		panic(err)
	}
}

type cacheItem struct {
	value     string
	createdAt time.Time
	expiresAt time.Time
}

func setHandler(c *gin.Context) {
	var input struct {
		Key       string `json:"key"`
		Value     string `json:"value"`
		ExpiresIn int    `json:"expires_in"`
	}

	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	key := input.Key
	value := input.Value
	expiresIn := input.ExpiresIn

	if expiresIn == 0 {
		expiresIn = 60 // Default expiration time in seconds
	}
	expiresAt := time.Now().Add(time.Duration(expiresIn) * time.Second)

	item := cacheItem{
		value:     value,
		createdAt: time.Now(),
		expiresAt: expiresAt,
	}

	// Set key-value pair in the cache
	mutex.Lock()
	cache.Add(key, item)
	mutex.Unlock()

	c.JSON(http.StatusOK, gin.H{"message": "Key/Value set successfully"})
}

func getHandler(c *gin.Context) {
	key := c.Query("key")

	mutex.Lock()
	defer mutex.Unlock()

	if val, ok := cache.Get(key); ok {
		item := val.(cacheItem)
		if time.Now().Before(item.expiresAt) {
			c.JSON(http.StatusOK, gin.H{"message": item.value})
			return
		}
		cache.Remove(key)
	}

	c.JSON(http.StatusNotFound, gin.H{"error": "Key not found in the cache"})
}

func main() {
	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"GET", "POST", "DELETE"}
	r.Use(cors.New(config))

	r.POST("/set", setHandler)
	r.GET("/get", getHandler)
	fmt.Println("Server starting at 8080")
	r.Run(":8080")

}
