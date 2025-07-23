package server

import (
	"fmt"
	"math/rand"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Participant describes a single entity in the hashmap
type Participant struct {
	Host     bool
	Conn     *websocket.Conn
	ClientID string
}

// RoomMap is the main hashmap [roomID string] -> [[]Participant]
type RoomMap struct {
	Mutex sync.RWMutex
	Map   map[string][]Participant
}

// Init initialises the RoomMap struct
func (r *RoomMap) Init() {
	r.Map = make(map[string][]Participant)
	fmt.Println("✨ [RoomMap] Initialized room map!")
}

// Get will return the array of participants in the room
func (r *RoomMap) Get(roomID string) []Participant {
	r.Mutex.RLock()
	defer r.Mutex.RUnlock()

	fmt.Printf("🔍 [RoomMap] Getting participants for RoomID: %s\n", roomID)
	return r.Map[roomID]
}

// CreateRoom generates a unique room ID and returns it
func (r *RoomMap) CreateRoom() string {
	r.Mutex.Lock()
	defer r.Mutex.Unlock()

	rand.Seed(time.Now().UnixNano())
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")
	b := make([]rune, 8)

	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}

	roomID := string(b)
	r.Map[roomID] = []Participant{}

	fmt.Printf("🎉 [RoomMap] Created new RoomID: %s\n", roomID)
	return roomID
}

// InsertIntoRoom creates a participant and adds it to the hashmap
func (r *RoomMap) InsertIntoRoom(roomID string, host bool, conn *websocket.Conn, clientID string) {
	r.Mutex.Lock()
	defer r.Mutex.Unlock()

	p := Participant{host, conn, clientID}

	fmt.Printf("👤 [RoomMap] Inserting participant (Host: %v, ClientID: %s) into RoomID: %s\n", host, clientID, roomID)
	r.Map[roomID] = append(r.Map[roomID], p)
}

// RemoveFromRoom removes a participant from a room
func (r *RoomMap) RemoveFromRoom(roomID string, conn *websocket.Conn) {
	r.Mutex.Lock()
	defer r.Mutex.Unlock()

	if participants, exists := r.Map[roomID]; exists {
		newParticipants := []Participant{}
		for _, p := range participants {
			if p.Conn != conn {
				newParticipants = append(newParticipants, p)
			}
		}
		r.Map[roomID] = newParticipants
		fmt.Printf("🧹 [RoomMap] Removed participant from RoomID: %s\n", roomID)

		if len(r.Map[roomID]) == 0 {
			delete(r.Map, roomID)
			fmt.Printf("🗑️ [RoomMap] Deleted empty RoomID: %s\n", roomID)
		}
	}
}
