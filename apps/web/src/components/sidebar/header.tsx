import {
  IconFolderPlus,
  IconPencilPlus,
  IconSettings,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react"
import { IconButton } from "design"
import { SORTING } from "@/utils/constants"

type TProps = {
  sorting: SORTING
  onSortingButtonPress: () => void
}

const Header = (props: TProps) => {
  return (
    <div className="text-gray-11 flex h-9 w-full items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <IconButton color="slate" variant="ghost">
          <IconPencilPlus size={20} stroke={1.5} />
        </IconButton>
        <IconButton color="slate" variant="ghost">
          <IconFolderPlus size={20} stroke={1.5} />
        </IconButton>
        <IconButton
          color="slate"
          variant="ghost"
          onPress={props.onSortingButtonPress}
        >
          {props.sorting === SORTING.ASC && (
            <IconSortAscending size={20} stroke={1.5} />
          )}
          {props.sorting === SORTING.DESC && (
            <IconSortDescending size={20} stroke={1.5} />
          )}
        </IconButton>
      </div>
      <div>
        <IconButton color="slate" variant="ghost">
          <IconSettings size={20} stroke={1.5} />
        </IconButton>
      </div>
    </div>
  )
}

export default Header
