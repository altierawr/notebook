import { PropsWithChildren } from "react"
import { useNavigate } from "react-router-dom"
import SidebarButton from "./button"

type TProps = {
  id: string
  text: string
}

const SidebarNoteButton = ({ id, text }: PropsWithChildren<TProps>) => {
  const navigate = useNavigate()

  const handlePress = () => {
    navigate(`/notes/${id}`)
  }

  return <SidebarButton onPress={handlePress}>{text}</SidebarButton>
}

export default SidebarNoteButton
