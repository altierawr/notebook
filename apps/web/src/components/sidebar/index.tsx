import { Spacer } from "design"
import { useState } from "react"
import { PreloadedQuery, graphql, usePreloadedQuery } from "react-relay"
import { SORTING } from "@/utils/constants"
import { sidebarQuery } from "./__generated__/sidebarQuery.graphql"
import Button from "./button"
import SidebarButtonGroup from "./button-group"
import SidebarFolderButtonGroup from "./folder-button-group"
import Header from "./header"
import SidebarNoteButton from "./note-button"

type TProps = {
  queryRef: PreloadedQuery<sidebarQuery>
}

const Sidebar = (props: TProps) => {
  const data = usePreloadedQuery<sidebarQuery>(
    graphql`
      query sidebarQuery {
        folders(where: { hasParent: false }) {
          edges {
            node {
              id
              title
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
    props.queryRef
  )

  const [sorting, setSorting] = useState<SORTING>(SORTING.DESC)

  const handleSortingButtonPress = () => {
    setSorting(sorting === SORTING.ASC ? SORTING.DESC : SORTING.ASC)
  }

  const sortedFolders = [...(data.folders.edges || [])].sort((a, b) => {
    if (!a?.node?.title || !b?.node?.title) return 0

    if (a.node.title < b.node.title) return sorting === SORTING.DESC ? -1 : 1
    if (b.node.title < a.node.title) return sorting === SORTING.DESC ? 1 : -1
    return 0
  })

  const sortedNotes = [...(data.notes.edges || [])].sort((a, b) => {
    if (!a?.node?.title || !b?.node?.title) return 0

    if (a.node.title < b.node.title) return sorting === SORTING.DESC ? -1 : 1
    if (b.node.title < a.node.title) return sorting === SORTING.DESC ? 1 : -1
    return 0
  })

  return (
    <>
      <div className="bg-gray-1 border-r-gray-6 w-[280px] border-r border-solid">
        <Header
          sorting={sorting}
          onSortingButtonPress={handleSortingButtonPress}
        />
        <Spacer size="5" />
        <SidebarButtonGroup>
          {sortedFolders.map((folder) => {
            if (!folder?.node) return null

            return (
              <SidebarFolderButtonGroup
                key={folder.node.id}
                folderRef={folder.node}
                sorting={sorting}
              />
            )
          })}

          {sortedNotes.map((note) => {
            if (!note?.node) return null

            return (
              <Sidebar.NoteButton
                key={note.node.id}
                id={note.node.id}
                text={note.node.title}
              />
            )
          })}
        </SidebarButtonGroup>
      </div>
    </>
  )
}

Sidebar.Button = Button
Sidebar.NoteButton = SidebarNoteButton

export default Sidebar
