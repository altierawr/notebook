import { loadQuery } from "react-relay"
import { createBrowserRouter } from "react-router-dom"
import appPageQuery from "./pages/__generated__/appPageQuery.graphql"
import notePageQuery from "./pages/__generated__/notePageQuery.graphql"
import { RelayEnvironment } from "./relay-env"

const router = createBrowserRouter([
  {
    path: "/",
    lazy: () => import("./pages/app"),
    loader: () => {
      return loadQuery(RelayEnvironment, appPageQuery, {})
    },
    children: [
      {
        path: "notes/:id",
        lazy: () => import("./pages/note"),
        loader: ({ params }) => {
          return loadQuery(RelayEnvironment, notePageQuery, {
            id: params.id,
          })
        },
      },
    ],
  },
])

export default router
