import { Spacer } from "design"
import { PropsWithChildren } from "react"
import Button from "./button"
import SidebarButtonGroup from "./button-group"
import Header from "./header"
import SidebarNoteButton from "./note-button"

const Sidebar = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="bg-gray-1 border-r-gray-6 h-[100dvh] w-[280px] border-r border-solid">
        <Header />
        <Spacer size="5" />
        <SidebarButtonGroup>{children}</SidebarButtonGroup>
      </div>
    </>
  )
}

Sidebar.Button = Button
Sidebar.NoteButton = SidebarNoteButton

export default Sidebar
