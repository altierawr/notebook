package main

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (app *application) routes() http.Handler {
	router := httprouter.New()

	router.HandlerFunc(http.MethodGet, "/healthcheck", app.healthcheckHandler)

	router.HandlerFunc(http.MethodPost, "/notes", app.createNoteHandler)
	router.HandlerFunc(http.MethodGet, "/notes", app.listNotesHandler)
	router.HandlerFunc(http.MethodGet, "/notes/:id", app.viewNoteHandler)
	router.HandlerFunc(http.MethodPatch, "/notes/:id", app.updateNoteHandler)

	return app.enableCORS(router)
}
