import { Collapsible, Loader } from "design"
import { PropsWithChildren, Suspense, useState } from "react"
import {
  PreloadedQuery,
  graphql,
  useFragment,
  usePreloadedQuery,
  useQueryLoader,
} from "react-relay"
import { SORTING } from "@/utils/constants"
import { folderButtonGroupQuery } from "./__generated__/folderButtonGroupQuery.graphql"
import { folderButtonGroup_folder$key } from "./__generated__/folderButtonGroup_folder.graphql"
import SidebarButtonGroup from "./button-group"
import Sidebar from "."

export const SidebarFolderButtonGroupQuery = graphql`
  query folderButtonGroupQuery($folderId: ID!) {
    folders(where: { hasParentWith: { id: $folderId } }) {
      edges {
        node {
          id
          title
          ...folderButtonGroup_folder
        }
      }
    }

    notes(where: { hasParentWith: { id: $folderId } }) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`

const GroupContainer = (props: PropsWithChildren) => {
  return (
    <div className="flex pl-2">
      <div className="grid w-5 place-items-center">
        <div className="border-r-gray-6 h-full border-r" />
      </div>

      <SidebarButtonGroup>{props.children}</SidebarButtonGroup>
    </div>
  )
}

type TGroupProps = {
  sorting: SORTING
  queryRef: PreloadedQuery<folderButtonGroupQuery>
}

const Group = (props: TGroupProps) => {
  const data = usePreloadedQuery<folderButtonGroupQuery>(
    SidebarFolderButtonGroupQuery,
    props.queryRef
  )

  const sortedFolders = [...(data.folders.edges || [])].sort((a, b) => {
    if (!a?.node?.title || !b?.node?.title) return 0

    if (a.node.title < b.node.title)
      return props.sorting === SORTING.DESC ? -1 : 1
    if (b.node.title < a.node.title)
      return props.sorting === SORTING.DESC ? 1 : -1
    return 0
  })

  const sortedNotes = [...(data.notes.edges || [])].sort((a, b) => {
    if (!a?.node?.title || !b?.node?.title) return 0

    if (a.node.title < b.node.title)
      return props.sorting === SORTING.DESC ? -1 : 1
    if (b.node.title < a.node.title)
      return props.sorting === SORTING.DESC ? 1 : -1
    return 0
  })

  return (
    <>
      <GroupContainer>
        {sortedFolders.map((folder) => {
          if (!folder?.node) return null

          return (
            <SidebarFolderButtonGroup
              key={folder.node.id}
              folderRef={folder.node}
              sorting={props.sorting}
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
      </GroupContainer>
    </>
  )
}

type TProps = {
  sorting: SORTING
  folderRef: folderButtonGroup_folder$key
}

const SidebarFolderButtonGroup = (props: TProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [queryRef, loadQuery] = useQueryLoader<folderButtonGroupQuery>(
    SidebarFolderButtonGroupQuery
  )

  const data = useFragment(
    graphql`
      fragment folderButtonGroup_folder on Folder {
        id
        title
      }
    `,
    props.folderRef
  )

  const handlePress = () => {
    // Load query here as well in case the user navigated using the keyboard
    loadQuery({
      folderId: data.id,
    })

    setIsOpen(!isOpen)
  }

  const handleHoverStart = () => {
    loadQuery({
      folderId: data.id,
    })
  }

  return (
    <>
      <Sidebar.Button
        onPress={handlePress}
        onHoverStart={handleHoverStart}
        isFolder
        isOpen={isOpen}
      >
        {data.title}
      </Sidebar.Button>

      <Collapsible isOpen={isOpen}>
        <Suspense
          fallback={
            <GroupContainer>
              <Sidebar.Button isDisabled>
                <Loader />
              </Sidebar.Button>
            </GroupContainer>
          }
        >
          {queryRef && <Group queryRef={queryRef} sorting={props.sorting} />}
        </Suspense>
      </Collapsible>
    </>
  )
}

export default SidebarFolderButtonGroup
