import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./pages/root";
import NotePage from "./pages/note";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Number.MAX_SAFE_INTEGER,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "favorites",
        element: <div></div>,
      },
      {
        path: "trash",
        element: <div></div>,
      },
      {
        path: "notes/:id",
        element: <NotePage />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
