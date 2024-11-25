package main

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/altierawr/notebook/internal/data"
	"github.com/altierawr/notebook/internal/data/validator"
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
		Title      *string  `json:"title"`
		Content    *string  `json:"content"`
		RawContent *string  `json:"rawContent"`
		Tags       []string `json:"tags"`
		IsTrashed  *bool    `json:"isTrashed"`
		IsFavorite *bool    `json:"isFavorite"`
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

	if input.RawContent != nil {
		note.RawContent = *input.RawContent
	}

	if input.Tags != nil {
		note.Tags = input.Tags
	}

	if input.IsTrashed != nil {
		note.IsTrashed = *input.IsTrashed

		if *input.IsTrashed {
			note.TrashedAt = time.Now()
		}
	}

	if input.IsFavorite != nil {
		note.IsFavorite = *input.IsFavorite
	}

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
		Query string
		data.Filters
	}

	qs := r.URL.Query()
	v := validator.New()

	input.Query = app.readString(qs, "query", "")
	input.Filters.Page = app.readInt(qs, "page", 1, v)
	input.Filters.PageSize = app.readInt(qs, "page_size", 50, v)
	input.Filters.Sort = app.readString(qs, "sort", "id")
	input.Filters.Favorited = app.readBool(qs, "favorited")
	input.Filters.Trashed = app.readBool(qs, "trashed")
	input.Filters.SortSafelist = []string{"id", "title", "-id", "-title"}

	if data.ValidateFilters(v, input.Filters); !v.Valid() {
		app.failedValidationResponse(w, r, v.Errors)
		return
	}

	notes := []*data.Note{}
	var err error

	notes, err = app.models.Notes.GetAll(input.Query, input.Filters)

	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"notes": notes}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}
