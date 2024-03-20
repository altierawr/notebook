import { Collapsible, Loader } from "design"
import { PropsWithChildren, Suspense, useState } from "react"
import {
  PreloadedQuery,
  graphql,
  useFragment,
  usePreloadedQuery,
  useQueryLoader,
} from "react-relay"
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

const GroupContainer = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex pl-2">
      <div className="grid w-5 place-items-center">
        <div className="border-r-gray-6 h-full border-r" />
      </div>

      <SidebarButtonGroup>{children}</SidebarButtonGroup>
    </div>
  )
}

type TGroupProps = {
  queryRef: PreloadedQuery<folderButtonGroupQuery>
}

const Group = ({ queryRef }: TGroupProps) => {
  const data = usePreloadedQuery<folderButtonGroupQuery>(
    SidebarFolderButtonGroupQuery,
    queryRef
  )

  return (
    <>
      <GroupContainer>
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
      </GroupContainer>
    </>
  )
}

type TProps = {
  folderRef: folderButtonGroup_folder$key
}

const SidebarFolderButtonGroup = ({ folderRef }: TProps) => {
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
    folderRef
  )

  const handlePress = () => {
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
          {queryRef && <Group queryRef={queryRef} />}
        </Suspense>
      </Collapsible>
    </>
  )
}

export default SidebarFolderButtonGroup
