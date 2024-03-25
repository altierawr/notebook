import { PropsWithChildren } from "react"

const SidebarButtonGroup = (props: PropsWithChildren) => {
  return <div className="flex w-full flex-col gap-1 px-2">{props.children}</div>
}

export default SidebarButtonGroup
