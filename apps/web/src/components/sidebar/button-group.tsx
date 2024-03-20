import { PropsWithChildren } from "react"

const SidebarButtonGroup = ({ children }: PropsWithChildren) => {
  return <div className="flex w-full flex-col gap-1 px-2">{children}</div>
}

export default SidebarButtonGroup
