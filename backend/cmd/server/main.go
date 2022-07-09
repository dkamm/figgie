package main

import (
	"embed"
	"flag"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/gorilla/websocket"
	"io/fs"
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
		return origin == "http://localhost:3000" || origin == "http://localhost:8080"
	},
}

//go:embed static
var staticFiles embed.FS

//go:embed static/index.html
var indexFile []byte

type catchAllHandler struct{}

func (h *catchAllHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func main() {
	hub := app.NewHub()
	go hub.Run()

	connectWS := func(w http.ResponseWriter, r *http.Request) {
		var userId string
		session, _ := store.Get(r, "figgie-session")
		userId, ok := session.Values["userId"].(string)

		if !ok {
			userId = "user_" + uuid.New().String()
			log.Printf("could not find user id in session, created a new one %s", userId)
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

	sub, _ := fs.Sub(staticFiles, "static")
	fs := http.FileServer(http.FS(sub))

	r := mux.NewRouter()
	r.HandleFunc("/ws", connectWS).Methods("GET")
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", fs))
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		session, _ := store.Get(r, "figgie-session")
		_, ok := session.Values["userId"]

		if !ok {
			session.Values["userId"] = "user_" + uuid.New().String()

			err := session.Save(r, w)
			if err != nil {
				log.Printf("error saving session: %v", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}

		w.Write(indexFile)
	})
	r.PathPrefix("/").Handler(&catchAllHandler{})

	log.Printf("serving on %v", *addrFlag)
	err := http.ListenAndServe(*addrFlag, r)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
