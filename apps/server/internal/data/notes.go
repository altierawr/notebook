package data

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/lib/pq"
)

type Note struct {
	ID         int64     `json:"id"`
	CreatedAt  time.Time `json:"created_at"`
	Title      string    `json:"title"`
	Content    string    `json:"content"`
	RawContent string    `json:"rawContent"`
	Tags       []string  `json:"tags"`
	IsTrashed  bool      `json:"isTrashed"`
	TrashedAt  time.Time `json:"trashedAt"`
	IsFavorite bool      `json:"isFavorite"`
	Version    int64     `json:"version"`
}

type NoteModel struct {
	DB *sql.DB
}

func (m NoteModel) Insert(note *Note) error {
	query := `
		INSERT INTO notes
		DEFAULT VALUES
		RETURNING id, created_at, title, content, tags, is_trashed, trashed_at, is_favorite, version`

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
			&note.IsTrashed,
			&note.TrashedAt,
			&note.IsFavorite,
			&note.Version,
		)
}

func (m NoteModel) Update(note *Note) error {
	query := `
		UPDATE notes
		SET title = $1, content = $2, raw_content = $3, tags = $4, is_trashed = $5, trashed_at = $6, is_favorite = $7, version = version + 1
		WHERE id = $8 AND version = $9
		RETURNING version`

	args := []interface{}{
		note.Title,
		note.Content,
		note.RawContent,
		pq.Array(note.Tags),
		note.IsTrashed,
		note.TrashedAt,
		note.IsFavorite,
		note.ID,
		note.Version,
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, args...).Scan(&note.Version)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return ErrEditConflict
		default:
			return err
		}
	}

	return nil
}

func (m NoteModel) Get(id int64) (*Note, error) {
	if id < 1 {
		return nil, ErrRecordNotFound
	}

	query := `
		SELECT id, created_at, title, content, tags, is_trashed, trashed_at, is_favorite, version
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
		&note.IsTrashed,
		&note.TrashedAt,
		&note.IsFavorite,
		&note.Version,
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

func (m NoteModel) GetAll(searchQuery string, filters Filters) ([]*Note, error) {
	favoriteQuery := ""
	trashQuery := ""

	if filters.Favorited != nil && *filters.Favorited {
		favoriteQuery = "AND is_favorite = true"
	} else if filters.Favorited != nil && !*filters.Favorited {
		favoriteQuery = "AND is_favorite = false"
	}

	if filters.Trashed != nil && *filters.Trashed {
		trashQuery = "AND is_trashed = true"
	} else if filters.Trashed != nil && !*filters.Trashed {
		trashQuery = "AND is_trashed = false"
	}

	query := fmt.Sprintf(`
		SELECT COUNT(*) OVER(), id, created_at, title, content, raw_content, tags, is_trashed, trashed_at, is_favorite, version
		FROM notes
		WHERE ((to_tsvector('simple', title) @@ plainto_tsquery('simple', $1) OR $1 = '')
		OR (to_tsvector('simple', raw_content) @@ plainto_tsquery('simple', $1) OR $1 = ''))
		%s
		%s
		ORDER BY id ASC`, favoriteQuery, trashQuery)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, searchQuery)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	totalRecords := 0
	notes := []*Note{}

	for rows.Next() {
		var note Note

		err := rows.Scan(
			&totalRecords,
			&note.ID,
			&note.CreatedAt,
			&note.Title,
			&note.Content,
			&note.RawContent,
			pq.Array(&note.Tags),
			&note.IsTrashed,
			&note.TrashedAt,
			&note.IsFavorite,
			&note.Version,
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
