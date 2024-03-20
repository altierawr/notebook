import { PropsWithChildren } from "react"
import SidebarButton from "./button"

type TProps = {
  text: string
}

const SidebarNoteButton = ({ text }: PropsWithChildren<TProps>) => {
  return <SidebarButton>{text}</SidebarButton>
}

export default SidebarNoteButton
