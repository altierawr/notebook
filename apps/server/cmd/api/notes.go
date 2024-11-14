package main

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/altierawr/notebook/internal/data"
)

func (app *application) createNoteHandler(w http.ResponseWriter, r *http.Request) {
	note := &data.Note{}

	err := app.models.Notes.Insert(note)
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

func (app *application) updateNoteHandler(w http.ResponseWriter, r *http.Request) {
	id, err := app.readIDParam(r)
	if err != nil || id < 1 {
		app.notFoundResponse(w, r)
		return
	}

	note, err := app.models.Notes.Get(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrRecordNotFound):
			app.badRequestResponse(w, r, err)
		default:
			app.serverErrorResponse(w, r, err)
		}

		return
	}

	var input struct {
		Title   *string  `json:"title"`
		Content *string  `json:"content"`
		Tags    []string `json:"tags"`
	}

	err = app.readJSON(w, r, &input)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if input.Title != nil {
		note.Title = *input.Title
	}

	if input.Content != nil {
		note.Content = *input.Content
	}

	if input.Tags != nil {
		note.Tags = input.Tags
	}

	fmt.Println("Saving note content for note id", note.ID)
	fmt.Println(note.Content)

	err = app.models.Notes.Update(note)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrEditConflict):
			app.editConflictResponse(w, r)
		default:
			app.serverErrorResponse(w, r, err)
		}

		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"note": note}, nil)
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
	var input struct {
		IDs []int `json:"ids"`
	}

	qs := r.URL.Query()

	ids := app.readCSV(qs, "ids", []string{})
	input.IDs = []int{}
	for _, id := range ids {
		intId, err := strconv.Atoi(id)
		if err != nil {
			app.badRequestResponse(w, r, err)
			return
		}

		input.IDs = append(input.IDs, intId)
	}

	fmt.Println(input.IDs)

	notes := []*data.Note{}
	var err error

	if len(input.IDs) > 0 {
		notes, err = app.models.Notes.GetByIds(input.IDs)
	} else {
		notes, err = app.models.Notes.GetAll()
	}
	if err != nil {
		fmt.Println("yo")
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"notes": notes}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}
