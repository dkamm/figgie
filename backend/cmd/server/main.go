package main

import (
	"flag"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"os"

	"github.com/dkamm/figgie/backend/app"
)

var addrFlag = flag.String("addr", ":8080", "http service address")

var store = sessions.NewCookieStore([]byte(os.Getenv("SESSION_KEY")))

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		return origin == "http://localhost:3000"
	},
}

func main() {
	hub := app.NewHub()
	go hub.Run()

	connectWS := func(w http.ResponseWriter, r *http.Request) {
		session, _ := store.Get(r, "figgie-session")
		userId, ok := session.Values["userId"].(string)

		if !ok {
			session.Values["userId"] = "user_" + uuid.New().String()

			err := session.Save(r, w)
			if err != nil {
				log.Printf("error saving session: %v", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			userId = session.Values["userId"].(string)
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println(err)
			return
		}
		client := app.NewWSClient(userId, hub, conn)
		client.Register()
		client.Run()
	}

	r := mux.NewRouter()
	r.HandleFunc("/ws", connectWS).Methods("GET")
	http.Handle("/", r)

	log.Printf("serving on %v", *addrFlag)
	err := http.ListenAndServe(*addrFlag, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
