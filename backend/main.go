package main

import (
	rooms "goMeet/signaling"
	server "goMeet/signaling"
	"os"

	"log"
	"net/http"

	"github.com/joho/godotenv"
)

func loadEnv() string {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file: %s", err)
	}
	port := os.Getenv("PORT")
	return port

}

func main() {
	rooms.AllRooms.Init()

	http.HandleFunc("/create", server.CreateRoomRequestHandler)
	http.HandleFunc("/join", server.JoinRoomRequestHandler)

	serverPort := loadEnv()
	log.Println("Starting Server on Port -", serverPort)

	connErr := http.ListenAndServe(serverPort, nil)
	if connErr != nil {
		log.Fatal(connErr)
	}
}
