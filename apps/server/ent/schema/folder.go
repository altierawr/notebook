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
		field.String("title"),
		field.Time("created_at").
			Default(time.Now),
	}
}

// Edges of the Folder.
func (Folder) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("folders", Folder.Type),
		edge.From("parent", Folder.Type).
			Ref("folders"),
		edge.To("notes", Note.Type),
	}
}

func (Folder) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
		entgql.Mutations(entgql.MutationCreate(), entgql.MutationUpdate()),
	}
}
