package schema

import (
	"time"

	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Folder holds the schema definition for the Folder entity.
type Folder struct {
	ent.Schema
}

// Fields of the Folder.
func (Folder) Fields() []ent.Field {
	return []ent.Field{
		field.String("title").
			NotEmpty().
			Annotations(
				entgql.OrderField("TITLE"),
			),
		field.Time("created_at").
			Default(time.Now).
			Immutable().
			Annotations(
				entgql.OrderField("CREATED_AT"),
			),
	}
}

// Edges of the Folder.
func (Folder) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("folders", Folder.Type).
			Annotations(
				entgql.RelayConnection(),
				entgql.OrderField("FOLDERS_COUNT"),
			),
		edge.From("parent", Folder.Type).
			Ref("folders"),
		edge.To("notes", Note.Type).
			Annotations(
				entgql.RelayConnection(),
				entgql.OrderField("NOTES_COUNT"),
			),
	}
}

func (Folder) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.RelayConnection(),
		entgql.QueryField(),
		entgql.MultiOrder(),
		entgql.Mutations(entgql.MutationCreate(), entgql.MutationUpdate()),
	}
}
