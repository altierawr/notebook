// Code generated by ent, DO NOT EDIT.

package ent

import (
	"context"
	"errors"
	"fmt"
	"io"
	"strconv"

	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/dialect/sql"
	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/errcode"
	"github.com/altierawr/notebook/ent/folder"
	"github.com/altierawr/notebook/ent/note"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

// Common entgql types.
type (
	Cursor         = entgql.Cursor[int]
	PageInfo       = entgql.PageInfo[int]
	OrderDirection = entgql.OrderDirection
)

func orderFunc(o OrderDirection, field string) func(*sql.Selector) {
	if o == entgql.OrderDirectionDesc {
		return Desc(field)
	}
	return Asc(field)
}

const errInvalidPagination = "INVALID_PAGINATION"

func validateFirstLast(first, last *int) (err *gqlerror.Error) {
	switch {
	case first != nil && last != nil:
		err = &gqlerror.Error{
			Message: "Passing both `first` and `last` to paginate a connection is not supported.",
		}
	case first != nil && *first < 0:
		err = &gqlerror.Error{
			Message: "`first` on a connection cannot be less than zero.",
		}
		errcode.Set(err, errInvalidPagination)
	case last != nil && *last < 0:
		err = &gqlerror.Error{
			Message: "`last` on a connection cannot be less than zero.",
		}
		errcode.Set(err, errInvalidPagination)
	}
	return err
}

func collectedField(ctx context.Context, path ...string) *graphql.CollectedField {
	fc := graphql.GetFieldContext(ctx)
	if fc == nil {
		return nil
	}
	field := fc.Field
	oc := graphql.GetOperationContext(ctx)
walk:
	for _, name := range path {
		for _, f := range graphql.CollectFields(oc, field.Selections, nil) {
			if f.Alias == name {
				field = f
				continue walk
			}
		}
		return nil
	}
	return &field
}

func hasCollectedField(ctx context.Context, path ...string) bool {
	if graphql.GetFieldContext(ctx) == nil {
		return true
	}
	return collectedField(ctx, path...) != nil
}

const (
	edgesField      = "edges"
	nodeField       = "node"
	pageInfoField   = "pageInfo"
	totalCountField = "totalCount"
)

func paginateLimit(first, last *int) int {
	var limit int
	if first != nil {
		limit = *first + 1
	} else if last != nil {
		limit = *last + 1
	}
	return limit
}

// FolderEdge is the edge representation of Folder.
type FolderEdge struct {
	Node   *Folder `json:"node"`
	Cursor Cursor  `json:"cursor"`
}

// FolderConnection is the connection containing edges to Folder.
type FolderConnection struct {
	Edges      []*FolderEdge `json:"edges"`
	PageInfo   PageInfo      `json:"pageInfo"`
	TotalCount int           `json:"totalCount"`
}

func (c *FolderConnection) build(nodes []*Folder, pager *folderPager, after *Cursor, first *int, before *Cursor, last *int) {
	c.PageInfo.HasNextPage = before != nil
	c.PageInfo.HasPreviousPage = after != nil
	if first != nil && *first+1 == len(nodes) {
		c.PageInfo.HasNextPage = true
		nodes = nodes[:len(nodes)-1]
	} else if last != nil && *last+1 == len(nodes) {
		c.PageInfo.HasPreviousPage = true
		nodes = nodes[:len(nodes)-1]
	}
	var nodeAt func(int) *Folder
	if last != nil {
		n := len(nodes) - 1
		nodeAt = func(i int) *Folder {
			return nodes[n-i]
		}
	} else {
		nodeAt = func(i int) *Folder {
			return nodes[i]
		}
	}
	c.Edges = make([]*FolderEdge, len(nodes))
	for i := range nodes {
		node := nodeAt(i)
		c.Edges[i] = &FolderEdge{
			Node:   node,
			Cursor: pager.toCursor(node),
		}
	}
	if l := len(c.Edges); l > 0 {
		c.PageInfo.StartCursor = &c.Edges[0].Cursor
		c.PageInfo.EndCursor = &c.Edges[l-1].Cursor
	}
	if c.TotalCount == 0 {
		c.TotalCount = len(nodes)
	}
}

// FolderPaginateOption enables pagination customization.
type FolderPaginateOption func(*folderPager) error

// WithFolderOrder configures pagination ordering.
func WithFolderOrder(order []*FolderOrder) FolderPaginateOption {
	return func(pager *folderPager) error {
		for _, o := range order {
			if err := o.Direction.Validate(); err != nil {
				return err
			}
		}
		pager.order = append(pager.order, order...)
		return nil
	}
}

// WithFolderFilter configures pagination filter.
func WithFolderFilter(filter func(*FolderQuery) (*FolderQuery, error)) FolderPaginateOption {
	return func(pager *folderPager) error {
		if filter == nil {
			return errors.New("FolderQuery filter cannot be nil")
		}
		pager.filter = filter
		return nil
	}
}

type folderPager struct {
	reverse bool
	order   []*FolderOrder
	filter  func(*FolderQuery) (*FolderQuery, error)
}

func newFolderPager(opts []FolderPaginateOption, reverse bool) (*folderPager, error) {
	pager := &folderPager{reverse: reverse}
	for _, opt := range opts {
		if err := opt(pager); err != nil {
			return nil, err
		}
	}
	for i, o := range pager.order {
		if i > 0 && o.Field == pager.order[i-1].Field {
			return nil, fmt.Errorf("duplicate order direction %q", o.Direction)
		}
	}
	return pager, nil
}

func (p *folderPager) applyFilter(query *FolderQuery) (*FolderQuery, error) {
	if p.filter != nil {
		return p.filter(query)
	}
	return query, nil
}

func (p *folderPager) toCursor(f *Folder) Cursor {
	cs := make([]any, 0, len(p.order))
	for _, po := range p.order {
		cs = append(cs, po.Field.toCursor(f).Value)
	}
	return Cursor{ID: f.ID, Value: cs}
}

func (p *folderPager) applyCursors(query *FolderQuery, after, before *Cursor) (*FolderQuery, error) {
	idDirection := entgql.OrderDirectionAsc
	if p.reverse {
		idDirection = entgql.OrderDirectionDesc
	}
	fields, directions := make([]string, 0, len(p.order)), make([]OrderDirection, 0, len(p.order))
	for _, o := range p.order {
		fields = append(fields, o.Field.column)
		direction := o.Direction
		if p.reverse {
			direction = direction.Reverse()
		}
		directions = append(directions, direction)
	}
	predicates, err := entgql.MultiCursorsPredicate(after, before, &entgql.MultiCursorsOptions{
		FieldID:     DefaultFolderOrder.Field.column,
		DirectionID: idDirection,
		Fields:      fields,
		Directions:  directions,
	})
	if err != nil {
		return nil, err
	}
	for _, predicate := range predicates {
		query = query.Where(predicate)
	}
	return query, nil
}

func (p *folderPager) applyOrder(query *FolderQuery) *FolderQuery {
	var defaultOrdered bool
	for _, o := range p.order {
		direction := o.Direction
		if p.reverse {
			direction = direction.Reverse()
		}
		query = query.Order(o.Field.toTerm(direction.OrderTermOption()))
		if o.Field.column == DefaultFolderOrder.Field.column {
			defaultOrdered = true
		}
		switch o.Field.column {
		case FolderOrderFieldFoldersCount.column, FolderOrderFieldNotesCount.column:
		default:
			if len(query.ctx.Fields) > 0 {
				query.ctx.AppendFieldOnce(o.Field.column)
			}
		}
	}
	if !defaultOrdered {
		direction := entgql.OrderDirectionAsc
		if p.reverse {
			direction = direction.Reverse()
		}
		query = query.Order(DefaultFolderOrder.Field.toTerm(direction.OrderTermOption()))
	}
	return query
}

func (p *folderPager) orderExpr(query *FolderQuery) sql.Querier {
	for _, o := range p.order {
		switch o.Field.column {
		case FolderOrderFieldFoldersCount.column, FolderOrderFieldNotesCount.column:
			direction := o.Direction
			if p.reverse {
				direction = direction.Reverse()
			}
			query = query.Order(o.Field.toTerm(direction.OrderTermOption()))
		default:
			if len(query.ctx.Fields) > 0 {
				query.ctx.AppendFieldOnce(o.Field.column)
			}
		}
	}
	return sql.ExprFunc(func(b *sql.Builder) {
		for _, o := range p.order {
			direction := o.Direction
			if p.reverse {
				direction = direction.Reverse()
			}
			b.Ident(o.Field.column).Pad().WriteString(string(direction))
			b.Comma()
		}
		direction := entgql.OrderDirectionAsc
		if p.reverse {
			direction = direction.Reverse()
		}
		b.Ident(DefaultFolderOrder.Field.column).Pad().WriteString(string(direction))
	})
}

// Paginate executes the query and returns a relay based cursor connection to Folder.
func (f *FolderQuery) Paginate(
	ctx context.Context, after *Cursor, first *int,
	before *Cursor, last *int, opts ...FolderPaginateOption,
) (*FolderConnection, error) {
	if err := validateFirstLast(first, last); err != nil {
		return nil, err
	}
	pager, err := newFolderPager(opts, last != nil)
	if err != nil {
		return nil, err
	}
	if f, err = pager.applyFilter(f); err != nil {
		return nil, err
	}
	conn := &FolderConnection{Edges: []*FolderEdge{}}
	ignoredEdges := !hasCollectedField(ctx, edgesField)
	if hasCollectedField(ctx, totalCountField) || hasCollectedField(ctx, pageInfoField) {
		hasPagination := after != nil || first != nil || before != nil || last != nil
		if hasPagination || ignoredEdges {
			c := f.Clone()
			c.ctx.Fields = nil
			if conn.TotalCount, err = c.Count(ctx); err != nil {
				return nil, err
			}
			conn.PageInfo.HasNextPage = first != nil && conn.TotalCount > 0
			conn.PageInfo.HasPreviousPage = last != nil && conn.TotalCount > 0
		}
	}
	if ignoredEdges || (first != nil && *first == 0) || (last != nil && *last == 0) {
		return conn, nil
	}
	if f, err = pager.applyCursors(f, after, before); err != nil {
		return nil, err
	}
	if limit := paginateLimit(first, last); limit != 0 {
		f.Limit(limit)
	}
	if field := collectedField(ctx, edgesField, nodeField); field != nil {
		if err := f.collectField(ctx, graphql.GetOperationContext(ctx), *field, []string{edgesField, nodeField}); err != nil {
			return nil, err
		}
	}
	f = pager.applyOrder(f)
	nodes, err := f.All(ctx)
	if err != nil {
		return nil, err
	}
	conn.build(nodes, pager, after, first, before, last)
	return conn, nil
}

var (
	// FolderOrderFieldTitle orders Folder by title.
	FolderOrderFieldTitle = &FolderOrderField{
		Value: func(f *Folder) (ent.Value, error) {
			return f.Title, nil
		},
		column: folder.FieldTitle,
		toTerm: folder.ByTitle,
		toCursor: func(f *Folder) Cursor {
			return Cursor{
				ID:    f.ID,
				Value: f.Title,
			}
		},
	}
	// FolderOrderFieldCreatedAt orders Folder by created_at.
	FolderOrderFieldCreatedAt = &FolderOrderField{
		Value: func(f *Folder) (ent.Value, error) {
			return f.CreatedAt, nil
		},
		column: folder.FieldCreatedAt,
		toTerm: folder.ByCreatedAt,
		toCursor: func(f *Folder) Cursor {
			return Cursor{
				ID:    f.ID,
				Value: f.CreatedAt,
			}
		},
	}
	// FolderOrderFieldFoldersCount orders by FOLDERS_COUNT.
	FolderOrderFieldFoldersCount = &FolderOrderField{
		Value: func(f *Folder) (ent.Value, error) {
			return f.Value("folders_count")
		},
		column: "folders_count",
		toTerm: func(opts ...sql.OrderTermOption) folder.OrderOption {
			return folder.ByFoldersCount(
				append(opts, sql.OrderSelectAs("folders_count"))...,
			)
		},
		toCursor: func(f *Folder) Cursor {
			cv, _ := f.Value("folders_count")
			return Cursor{
				ID:    f.ID,
				Value: cv,
			}
		},
	}
	// FolderOrderFieldNotesCount orders by NOTES_COUNT.
	FolderOrderFieldNotesCount = &FolderOrderField{
		Value: func(f *Folder) (ent.Value, error) {
			return f.Value("notes_count")
		},
		column: "notes_count",
		toTerm: func(opts ...sql.OrderTermOption) folder.OrderOption {
			return folder.ByNotesCount(
				append(opts, sql.OrderSelectAs("notes_count"))...,
			)
		},
		toCursor: func(f *Folder) Cursor {
			cv, _ := f.Value("notes_count")
			return Cursor{
				ID:    f.ID,
				Value: cv,
			}
		},
	}
)

// String implement fmt.Stringer interface.
func (f FolderOrderField) String() string {
	var str string
	switch f.column {
	case FolderOrderFieldTitle.column:
		str = "TITLE"
	case FolderOrderFieldCreatedAt.column:
		str = "CREATED_AT"
	case FolderOrderFieldFoldersCount.column:
		str = "FOLDERS_COUNT"
	case FolderOrderFieldNotesCount.column:
		str = "NOTES_COUNT"
	}
	return str
}

// MarshalGQL implements graphql.Marshaler interface.
func (f FolderOrderField) MarshalGQL(w io.Writer) {
	io.WriteString(w, strconv.Quote(f.String()))
}

// UnmarshalGQL implements graphql.Unmarshaler interface.
func (f *FolderOrderField) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("FolderOrderField %T must be a string", v)
	}
	switch str {
	case "TITLE":
		*f = *FolderOrderFieldTitle
	case "CREATED_AT":
		*f = *FolderOrderFieldCreatedAt
	case "FOLDERS_COUNT":
		*f = *FolderOrderFieldFoldersCount
	case "NOTES_COUNT":
		*f = *FolderOrderFieldNotesCount
	default:
		return fmt.Errorf("%s is not a valid FolderOrderField", str)
	}
	return nil
}

// FolderOrderField defines the ordering field of Folder.
type FolderOrderField struct {
	// Value extracts the ordering value from the given Folder.
	Value    func(*Folder) (ent.Value, error)
	column   string // field or computed.
	toTerm   func(...sql.OrderTermOption) folder.OrderOption
	toCursor func(*Folder) Cursor
}

// FolderOrder defines the ordering of Folder.
type FolderOrder struct {
	Direction OrderDirection    `json:"direction"`
	Field     *FolderOrderField `json:"field"`
}

// DefaultFolderOrder is the default ordering of Folder.
var DefaultFolderOrder = &FolderOrder{
	Direction: entgql.OrderDirectionAsc,
	Field: &FolderOrderField{
		Value: func(f *Folder) (ent.Value, error) {
			return f.ID, nil
		},
		column: folder.FieldID,
		toTerm: folder.ByID,
		toCursor: func(f *Folder) Cursor {
			return Cursor{ID: f.ID}
		},
	},
}

// ToEdge converts Folder into FolderEdge.
func (f *Folder) ToEdge(order *FolderOrder) *FolderEdge {
	if order == nil {
		order = DefaultFolderOrder
	}
	return &FolderEdge{
		Node:   f,
		Cursor: order.Field.toCursor(f),
	}
}

// NoteEdge is the edge representation of Note.
type NoteEdge struct {
	Node   *Note  `json:"node"`
	Cursor Cursor `json:"cursor"`
}

// NoteConnection is the connection containing edges to Note.
type NoteConnection struct {
	Edges      []*NoteEdge `json:"edges"`
	PageInfo   PageInfo    `json:"pageInfo"`
	TotalCount int         `json:"totalCount"`
}

func (c *NoteConnection) build(nodes []*Note, pager *notePager, after *Cursor, first *int, before *Cursor, last *int) {
	c.PageInfo.HasNextPage = before != nil
	c.PageInfo.HasPreviousPage = after != nil
	if first != nil && *first+1 == len(nodes) {
		c.PageInfo.HasNextPage = true
		nodes = nodes[:len(nodes)-1]
	} else if last != nil && *last+1 == len(nodes) {
		c.PageInfo.HasPreviousPage = true
		nodes = nodes[:len(nodes)-1]
	}
	var nodeAt func(int) *Note
	if last != nil {
		n := len(nodes) - 1
		nodeAt = func(i int) *Note {
			return nodes[n-i]
		}
	} else {
		nodeAt = func(i int) *Note {
			return nodes[i]
		}
	}
	c.Edges = make([]*NoteEdge, len(nodes))
	for i := range nodes {
		node := nodeAt(i)
		c.Edges[i] = &NoteEdge{
			Node:   node,
			Cursor: pager.toCursor(node),
		}
	}
	if l := len(c.Edges); l > 0 {
		c.PageInfo.StartCursor = &c.Edges[0].Cursor
		c.PageInfo.EndCursor = &c.Edges[l-1].Cursor
	}
	if c.TotalCount == 0 {
		c.TotalCount = len(nodes)
	}
}

// NotePaginateOption enables pagination customization.
type NotePaginateOption func(*notePager) error

// WithNoteOrder configures pagination ordering.
func WithNoteOrder(order []*NoteOrder) NotePaginateOption {
	return func(pager *notePager) error {
		for _, o := range order {
			if err := o.Direction.Validate(); err != nil {
				return err
			}
		}
		pager.order = append(pager.order, order...)
		return nil
	}
}

// WithNoteFilter configures pagination filter.
func WithNoteFilter(filter func(*NoteQuery) (*NoteQuery, error)) NotePaginateOption {
	return func(pager *notePager) error {
		if filter == nil {
			return errors.New("NoteQuery filter cannot be nil")
		}
		pager.filter = filter
		return nil
	}
}

type notePager struct {
	reverse bool
	order   []*NoteOrder
	filter  func(*NoteQuery) (*NoteQuery, error)
}

func newNotePager(opts []NotePaginateOption, reverse bool) (*notePager, error) {
	pager := &notePager{reverse: reverse}
	for _, opt := range opts {
		if err := opt(pager); err != nil {
			return nil, err
		}
	}
	for i, o := range pager.order {
		if i > 0 && o.Field == pager.order[i-1].Field {
			return nil, fmt.Errorf("duplicate order direction %q", o.Direction)
		}
	}
	return pager, nil
}

func (p *notePager) applyFilter(query *NoteQuery) (*NoteQuery, error) {
	if p.filter != nil {
		return p.filter(query)
	}
	return query, nil
}

func (p *notePager) toCursor(n *Note) Cursor {
	cs := make([]any, 0, len(p.order))
	for _, po := range p.order {
		cs = append(cs, po.Field.toCursor(n).Value)
	}
	return Cursor{ID: n.ID, Value: cs}
}

func (p *notePager) applyCursors(query *NoteQuery, after, before *Cursor) (*NoteQuery, error) {
	idDirection := entgql.OrderDirectionAsc
	if p.reverse {
		idDirection = entgql.OrderDirectionDesc
	}
	fields, directions := make([]string, 0, len(p.order)), make([]OrderDirection, 0, len(p.order))
	for _, o := range p.order {
		fields = append(fields, o.Field.column)
		direction := o.Direction
		if p.reverse {
			direction = direction.Reverse()
		}
		directions = append(directions, direction)
	}
	predicates, err := entgql.MultiCursorsPredicate(after, before, &entgql.MultiCursorsOptions{
		FieldID:     DefaultNoteOrder.Field.column,
		DirectionID: idDirection,
		Fields:      fields,
		Directions:  directions,
	})
	if err != nil {
		return nil, err
	}
	for _, predicate := range predicates {
		query = query.Where(predicate)
	}
	return query, nil
}

func (p *notePager) applyOrder(query *NoteQuery) *NoteQuery {
	var defaultOrdered bool
	for _, o := range p.order {
		direction := o.Direction
		if p.reverse {
			direction = direction.Reverse()
		}
		query = query.Order(o.Field.toTerm(direction.OrderTermOption()))
		if o.Field.column == DefaultNoteOrder.Field.column {
			defaultOrdered = true
		}
		if len(query.ctx.Fields) > 0 {
			query.ctx.AppendFieldOnce(o.Field.column)
		}
	}
	if !defaultOrdered {
		direction := entgql.OrderDirectionAsc
		if p.reverse {
			direction = direction.Reverse()
		}
		query = query.Order(DefaultNoteOrder.Field.toTerm(direction.OrderTermOption()))
	}
	return query
}

func (p *notePager) orderExpr(query *NoteQuery) sql.Querier {
	if len(query.ctx.Fields) > 0 {
		for _, o := range p.order {
			query.ctx.AppendFieldOnce(o.Field.column)
		}
	}
	return sql.ExprFunc(func(b *sql.Builder) {
		for _, o := range p.order {
			direction := o.Direction
			if p.reverse {
				direction = direction.Reverse()
			}
			b.Ident(o.Field.column).Pad().WriteString(string(direction))
			b.Comma()
		}
		direction := entgql.OrderDirectionAsc
		if p.reverse {
			direction = direction.Reverse()
		}
		b.Ident(DefaultNoteOrder.Field.column).Pad().WriteString(string(direction))
	})
}

// Paginate executes the query and returns a relay based cursor connection to Note.
func (n *NoteQuery) Paginate(
	ctx context.Context, after *Cursor, first *int,
	before *Cursor, last *int, opts ...NotePaginateOption,
) (*NoteConnection, error) {
	if err := validateFirstLast(first, last); err != nil {
		return nil, err
	}
	pager, err := newNotePager(opts, last != nil)
	if err != nil {
		return nil, err
	}
	if n, err = pager.applyFilter(n); err != nil {
		return nil, err
	}
	conn := &NoteConnection{Edges: []*NoteEdge{}}
	ignoredEdges := !hasCollectedField(ctx, edgesField)
	if hasCollectedField(ctx, totalCountField) || hasCollectedField(ctx, pageInfoField) {
		hasPagination := after != nil || first != nil || before != nil || last != nil
		if hasPagination || ignoredEdges {
			c := n.Clone()
			c.ctx.Fields = nil
			if conn.TotalCount, err = c.Count(ctx); err != nil {
				return nil, err
			}
			conn.PageInfo.HasNextPage = first != nil && conn.TotalCount > 0
			conn.PageInfo.HasPreviousPage = last != nil && conn.TotalCount > 0
		}
	}
	if ignoredEdges || (first != nil && *first == 0) || (last != nil && *last == 0) {
		return conn, nil
	}
	if n, err = pager.applyCursors(n, after, before); err != nil {
		return nil, err
	}
	if limit := paginateLimit(first, last); limit != 0 {
		n.Limit(limit)
	}
	if field := collectedField(ctx, edgesField, nodeField); field != nil {
		if err := n.collectField(ctx, graphql.GetOperationContext(ctx), *field, []string{edgesField, nodeField}); err != nil {
			return nil, err
		}
	}
	n = pager.applyOrder(n)
	nodes, err := n.All(ctx)
	if err != nil {
		return nil, err
	}
	conn.build(nodes, pager, after, first, before, last)
	return conn, nil
}

var (
	// NoteOrderFieldTitle orders Note by title.
	NoteOrderFieldTitle = &NoteOrderField{
		Value: func(n *Note) (ent.Value, error) {
			return n.Title, nil
		},
		column: note.FieldTitle,
		toTerm: note.ByTitle,
		toCursor: func(n *Note) Cursor {
			return Cursor{
				ID:    n.ID,
				Value: n.Title,
			}
		},
	}
	// NoteOrderFieldContent orders Note by content.
	NoteOrderFieldContent = &NoteOrderField{
		Value: func(n *Note) (ent.Value, error) {
			return n.Content, nil
		},
		column: note.FieldContent,
		toTerm: note.ByContent,
		toCursor: func(n *Note) Cursor {
			return Cursor{
				ID:    n.ID,
				Value: n.Content,
			}
		},
	}
	// NoteOrderFieldCreatedAt orders Note by created_at.
	NoteOrderFieldCreatedAt = &NoteOrderField{
		Value: func(n *Note) (ent.Value, error) {
			return n.CreatedAt, nil
		},
		column: note.FieldCreatedAt,
		toTerm: note.ByCreatedAt,
		toCursor: func(n *Note) Cursor {
			return Cursor{
				ID:    n.ID,
				Value: n.CreatedAt,
			}
		},
	}
)

// String implement fmt.Stringer interface.
func (f NoteOrderField) String() string {
	var str string
	switch f.column {
	case NoteOrderFieldTitle.column:
		str = "TITLE"
	case NoteOrderFieldContent.column:
		str = "CONTENT"
	case NoteOrderFieldCreatedAt.column:
		str = "CREATED_AT"
	}
	return str
}

// MarshalGQL implements graphql.Marshaler interface.
func (f NoteOrderField) MarshalGQL(w io.Writer) {
	io.WriteString(w, strconv.Quote(f.String()))
}

// UnmarshalGQL implements graphql.Unmarshaler interface.
func (f *NoteOrderField) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("NoteOrderField %T must be a string", v)
	}
	switch str {
	case "TITLE":
		*f = *NoteOrderFieldTitle
	case "CONTENT":
		*f = *NoteOrderFieldContent
	case "CREATED_AT":
		*f = *NoteOrderFieldCreatedAt
	default:
		return fmt.Errorf("%s is not a valid NoteOrderField", str)
	}
	return nil
}

// NoteOrderField defines the ordering field of Note.
type NoteOrderField struct {
	// Value extracts the ordering value from the given Note.
	Value    func(*Note) (ent.Value, error)
	column   string // field or computed.
	toTerm   func(...sql.OrderTermOption) note.OrderOption
	toCursor func(*Note) Cursor
}

// NoteOrder defines the ordering of Note.
type NoteOrder struct {
	Direction OrderDirection  `json:"direction"`
	Field     *NoteOrderField `json:"field"`
}

// DefaultNoteOrder is the default ordering of Note.
var DefaultNoteOrder = &NoteOrder{
	Direction: entgql.OrderDirectionAsc,
	Field: &NoteOrderField{
		Value: func(n *Note) (ent.Value, error) {
			return n.ID, nil
		},
		column: note.FieldID,
		toTerm: note.ByID,
		toCursor: func(n *Note) Cursor {
			return Cursor{ID: n.ID}
		},
	},
}

// ToEdge converts Note into NoteEdge.
func (n *Note) ToEdge(order *NoteOrder) *NoteEdge {
	if order == nil {
		order = DefaultNoteOrder
	}
	return &NoteEdge{
		Node:   n,
		Cursor: order.Field.toCursor(n),
	}
}
