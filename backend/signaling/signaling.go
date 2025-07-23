package server

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var AllRooms RoomMap

func init() {
	AllRooms.Init()
	// Start the broadcaster once during server initialization
	go broadcaster()
}

// CreateRoomRequestHandler creates a room and returns its ID
func CreateRoomRequestHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	roomID := AllRooms.CreateRoom()

	type resp struct {
		RoomID string `json:"room_id"`
	}

	fmt.Printf("AllRooms.Map: %+v\n", AllRooms.Map)
	json.NewEncoder(w).Encode(resp{RoomID: roomID})
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type broadcastMsg struct {
	Message  map[string]interface{}
	RoomID   string
	Client   *websocket.Conn
	ClientID string
}

var broadcast = make(chan broadcastMsg)

func broadcaster() {
	for msg := range broadcast {
		fmt.Printf("📢 Broadcasting message to room [%s]: %+v\n", msg.RoomID, msg.Message)

		for _, client := range AllRooms.Get(msg.RoomID) {
			fmt.Println("🔄  client  connection \n", client.Conn)
			fmt.Println("🔄 Sender connection \n", msg.Client)

			if client.Conn == msg.Client {
				fmt.Println("🧍 Skipped sender client")
			} else {
				err := client.Conn.WriteJSON(msg.Message)
				if err != nil {
					fmt.Printf("⚠️ Broadcast WriteJSON Error: %v\n", err)
					client.Conn.Close()
					fmt.Println("🔌 Closed faulty client connection")
					// Remove the client from the room
					AllRooms.RemoveFromRoom(msg.RoomID, client.Conn)
				} else {
					fmt.Println("✅ Message sent to client", client.Conn.RemoteAddr())
				}
			}
		}
	}
}

// JoinRoomRequestHandler handles clients joining a room
func JoinRoomRequestHandler(w http.ResponseWriter, r *http.Request) {
	roomID, ok := r.URL.Query()["roomID"]
	if !ok || len(roomID) == 0 {
		fmt.Println("roomID missing in URL Parameters")
		http.Error(w, "roomID missing", http.StatusBadRequest)
		return
	}

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Printf("WebSocket Upgrade Error: %v\n", err)
		http.Error(w, "WebSocket upgrade failed", http.StatusInternalServerError)
		return
	}

	clientID := generateClientID()
	fmt.Printf("🚪 Client %s joining Room: %s\n", clientID, roomID[0])

	// Insert client into room
	AllRooms.InsertIntoRoom(roomID[0], false, ws, clientID)

	// Handle incoming messages
	for {
		var msg broadcastMsg
		err := ws.ReadJSON(&msg.Message)
		if err != nil {
			fmt.Printf("❌ Read Error: %v\n", err)
			AllRooms.RemoveFromRoom(roomID[0], ws)
			ws.Close()
			return
		}

		msg.Client = ws
		msg.RoomID = roomID[0]
		msg.ClientID = clientID
		msg.Message["clientID"] = clientID // Add clientID to message

		fmt.Printf("📩 Received Message from Client %s: %+v\n", clientID, msg.Message)
		broadcast <- msg
		fmt.Println("📡 Message broadcasted to channel")
	}
}

// generateClientID creates a random client ID
func generateClientID() string {
	rand.Seed(time.Now().UnixNano())
	letters := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")
	b := make([]rune, 8)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
