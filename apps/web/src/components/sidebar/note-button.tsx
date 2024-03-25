import { PropsWithChildren } from "react"
import { useNavigate } from "react-router-dom"
import SidebarButton from "./button"

type TProps = {
  id: string
  text: string
}

const SidebarNoteButton = (props: PropsWithChildren<TProps>) => {
  const navigate = useNavigate()

  const handlePress = () => {
    navigate(`/notes/${props.id}`)
  }

  return <SidebarButton onPress={handlePress}>{props.text}</SidebarButton>
}

export default SidebarNoteButton
