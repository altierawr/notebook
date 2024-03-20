import clsx from "clsx"
import { PreloadedQuery, graphql, usePreloadedQuery } from "react-relay"
import { useLoaderData } from "react-router-dom"
import Sidebar from "@/components/sidebar"
import { AppQuery } from "./__generated__/AppQuery.graphql"
import SidebarFolderButtonGroup from "./components/sidebar/folder-button-group"
import useDarkMode from "./hooks/use-dark-mode"

function App() {
  const isDark = useDarkMode()
  const query = useLoaderData() as PreloadedQuery<AppQuery>

  const data = usePreloadedQuery<AppQuery>(
    graphql`
      query AppQuery {
        folders(where: { hasParent: false }) {
          edges {
            node {
              id
              ...folderButtonGroup_folder
            }
          }
        }

        notes(where: { hasParent: false }) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    `,
    query
  )

  return (
    <div className={clsx(isDark && "dark")}>
      <div className="bg-gray-0 h-[100dvh] w-full">
        <Sidebar>
          {data.folders.edges?.map((folder) => {
            if (!folder?.node) return null

            return (
              <SidebarFolderButtonGroup
                key={folder.node.id}
                folderRef={folder.node}
              />
            )
          })}

          {data.notes.edges?.map((note) => {
            if (!note?.node) return null

            return (
              <Sidebar.NoteButton key={note.node.id} text={note.node.title} />
            )
          })}
        </Sidebar>
      </div>
    </div>
  )
}

export default App
