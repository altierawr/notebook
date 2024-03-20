import { loadQuery } from "react-relay"
import { createBrowserRouter } from "react-router-dom"
import App from "./App"
import AppQuery from "./__generated__/AppQuery.graphql"
import { RelayEnvironment } from "./relay-env"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    loader: async () => {
      return loadQuery(RelayEnvironment, AppQuery, {})
    },
  },
])

export default router
