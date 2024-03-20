import { IconChevronRight } from "@tabler/icons-react"
import clsx from "clsx"
import { BaseButton } from "design"
import { PropsWithChildren } from "react"
import { colors } from "@/utils/colors"

type TProps = {
  isDisabled?: boolean
  isFolder?: boolean
  isOpen?: boolean
  onPress?: () => void
  onHoverStart?: () => void
  onHoverEnd?: () => void
}

const SidebarButton = ({
  children,
  isDisabled,
  isFolder,
  isOpen,
  onPress,
  onHoverStart,
  onHoverEnd,
}: PropsWithChildren<TProps>) => {
  return (
    <BaseButton
      color={colors.brand}
      isDisabled={isDisabled}
      onPress={onPress}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      className={clsx(
        "text-gray-12 flex w-full items-center gap-1 rounded-lg border border-transparent bg-transparent p-1 pl-2 pr-6",
        !isDisabled && "hover:bg-gray-3 active:bg-gray-4",
        isOpen && "bg-gray-2 !border-gray-6 !border !border-solid"
      )}
    >
      {isFolder && (
        <div
          className={clsx(
            "w-5",
            "grid",
            "place-items-center",
            isOpen && "rotate-90"
          )}
        >
          <IconChevronRight size={12} />
        </div>
      )}
      <span
        className={clsx(
          "truncate text-left text-[14px] font-normal",
          !isFolder && "pl-6"
        )}
      >
        {children}
      </span>
    </BaseButton>
  )
}

export default SidebarButton
