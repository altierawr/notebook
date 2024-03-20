import React from "react"
import ReactDOM from "react-dom/client"
import { RelayEnvironmentProvider } from "react-relay"
import { RouterProvider } from "react-router-dom"
import "./index.css"
import { RelayEnvironment } from "./relay-env"
import router from "./router"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RelayEnvironmentProvider environment={RelayEnvironment}>
      <RouterProvider router={router} />
    </RelayEnvironmentProvider>
  </React.StrictMode>
)
