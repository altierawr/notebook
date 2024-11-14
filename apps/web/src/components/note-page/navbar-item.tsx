import clsx from "clsx";
import { ReactElement } from "react";

type TProps = {
  text?: string;
  icon?: ReactElement;
  isSelected?: boolean;
};

const NotePageNavbarItem = ({ text, icon, isSelected }: TProps) => {
  return (
    <div
      className={clsx(
        "p-2 rounded flex items-center bg-gray-3 text-gray-12 text-[12px]",
        isSelected && "!bg-gray-5 border border-slate-7",
      )}
    >
      {text} {icon}
    </div>
  );
};

export default NotePageNavbarItem;
