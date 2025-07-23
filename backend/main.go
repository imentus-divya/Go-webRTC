package main

import (
	rooms "goMeet/signaling"
	server "goMeet/signaling"

	"log"
	"net/http"
)

func main() {
	rooms.AllRooms.Init()

	http.HandleFunc("/create", server.CreateRoomRequestHandler)
	http.HandleFunc("/join", server.JoinRoomRequestHandler)

	log.Println("Starting Server on Port 8000")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal(err)
	}
}
