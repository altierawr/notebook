package data

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/lib/pq"
)

type Note struct {
	ID        int64     `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Tags      []string  `json:"tags"`
}

type NoteModel struct {
	DB *sql.DB
}

func (m NoteModel) Insert(note *Note) error {
	query := `
		INSERT INTO notes
		DEFAULT VALUES
		RETURNING id, created_at, title, content, tags`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	return m.DB.
		QueryRowContext(ctx, query).
		Scan(
			&note.ID,
			&note.CreatedAt,
			&note.Title,
			&note.Content,
			pq.Array(&note.Tags),
		)
}

func (m NoteModel) Get(id int64) (*Note, error) {
	if id < 1 {
		return nil, ErrRecordNotFound
	}

	query := `
		SELECT id, created_at, title, content, tags
		FROM notes
		WHERE id = $1`

	var note Note

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, id).Scan(
		&note.ID,
		&note.CreatedAt,
		&note.Title,
		&note.Content,
		pq.Array(&note.Tags),
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrRecordNotFound
		default:
			return nil, err
		}
	}

	return &note, nil
}

func (m NoteModel) GetAll() ([]*Note, error) {
	query := `
		SELECT id, created_at, title, content, tags
		FROM notes`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	notes := []*Note{}
	for rows.Next() {
		var note Note

		err := rows.Scan(
			&note.ID,
			&note.CreatedAt,
			&note.Title,
			&note.Content,
			pq.Array(&note.Tags),
		)
		if err != nil {
			return nil, err
		}

		notes = append(notes, &note)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return notes, nil
}
