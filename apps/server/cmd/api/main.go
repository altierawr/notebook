package main

import (
	"errors"
	"net/http"
	"sync"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

type application struct {
	wg sync.WaitGroup
}

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix

	log.Info().
		Msg("Hello world")

	app := &application{}

	server := &http.Server{
		Addr:    ":4000",
		Handler: app.routes(),
	}

	log.Info().
		Dict("details", zerolog.Dict().
			Str("addr", ":4000"),
		).
		Msg("starting server")

	err := server.ListenAndServe()
	if !errors.Is(err, http.ErrServerClosed) {
		log.Fatal().
			Err(err)
	}
}
