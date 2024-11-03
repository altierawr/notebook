package main

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/altierawr/notebook/internal/data"
)

func (app *application) createNoteHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Title   string   `json:"title"`
		Content string   `json:"content"`
		Tags    []string `json:"tags"`
	}

	err := app.readJSON(w, r, &input)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	note := &data.Note{}

	err = app.models.Notes.Insert(note, input.Title, input.Content, input.Tags)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	headers := make(http.Header)
	headers.Set("Location", fmt.Sprintf("/notes/%d", note.ID))

	err = app.writeJSON(w, http.StatusCreated, envelope{"note": note}, headers)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) viewNoteHandler(w http.ResponseWriter, r *http.Request) {
	id, err := app.readIDParam(r)
	if err != nil || id < 1 {
		app.notFoundResponse(w, r)
		return
	}

	note, err := app.models.Notes.Get(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrRecordNotFound):
			app.notFoundResponse(w, r)
			return
		default:
			app.serverErrorResponse(w, r, err)
			return
		}
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"note": note}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) listNotesHandler(w http.ResponseWriter, r *http.Request) {
	notes, err := app.models.Notes.GetAll()
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"notes": notes}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}
