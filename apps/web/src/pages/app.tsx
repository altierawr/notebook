import clsx from "clsx"
import { Suspense } from "react"
import { PreloadedQuery, graphql, usePreloadedQuery } from "react-relay"
import { Outlet, useLoaderData } from "react-router-dom"
import Sidebar from "@/components/sidebar"
import SidebarFolderButtonGroup from "@/components/sidebar/folder-button-group"
import useDarkMode from "@/hooks/use-dark-mode"
import { appPageQuery } from "./__generated__/appPageQuery.graphql"

const Component = () => {
  const isDark = useDarkMode()
  const queryRef = useLoaderData() as PreloadedQuery<appPageQuery>

  const data = usePreloadedQuery<appPageQuery>(
    graphql`
      query appPageQuery {
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
    queryRef
  )

  return (
    <div className={clsx(isDark && "dark")}>
      <div className="flex bg-gray-0 h-[100dvh] w-full">
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
              <Sidebar.NoteButton
                key={note.node.id}
                id={note.node.id}
                text={note.node.title}
              />
            )
          })}
        </Sidebar>
        <Suspense fallback={<p>Loading...</p>}>
          <div className="flex-1">
            <Outlet />
          </div>
        </Suspense>
      </div>
    </div>
  )
}

const ErrorBoundary = () => {
  return <></>
}

export { Component, ErrorBoundary }
