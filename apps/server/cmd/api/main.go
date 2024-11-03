package main

import (
	"context"
	"database/sql"
	"errors"
	"flag"
	"net/http"
	"sync"
	"time"

	"github.com/altierawr/notebook/internal/data"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

type application struct {
	wg     sync.WaitGroup
	models data.Models
	config config
}

type config struct {
	db struct {
		dsn string
	}
}

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix

	var cfg config

	flag.StringVar(&cfg.db.dsn, "db-dsn", "postgres://notebook:pa55word@localhost/notebook?sslmode=disable", "PostgreSQL DSN")

	flag.Parse()

	log.Info().
		Msg("connecting to database...")

	db, err := openDB(cfg)
	if err != nil {
		log.Fatal().Err(err)
	}

	log.Info().
		Msg("connected to database")

	defer db.Close()

	app := &application{
		models: data.NewModels(db),
		config: cfg,
	}

	server := &http.Server{
		Addr:    ":4000",
		Handler: app.routes(),
	}

	log.Info().
		Dict("details", zerolog.Dict().
			Str("addr", ":4000"),
		).
		Msg("starting server")

	err = server.ListenAndServe()
	if !errors.Is(err, http.ErrServerClosed) {
		log.Fatal().Err(err)
	}
}

func openDB(cfg config) (*sql.DB, error) {
	db, err := sql.Open("postgres", cfg.db.dsn)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// tests the connection to the db
	err = db.PingContext(ctx)
	if err != nil {
		return nil, err
	}

	return db, nil
}
