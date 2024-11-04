import { ReactElement } from "react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

type TProps = {
  icon: ReactElement;
  text: string;
  url: string;
};

const SidebarLink = ({ icon, text, url }: TProps) => {
  const location = useLocation();

  const isActive = location.pathname === url;

  return (
    <Link to={url}>
      <div
        className={clsx(
          "flex items-center gap-2 p-2 rounded-md text-[14px] text-gray-11 border border-transparent",
          isActive &&
          "text-gray-12 bg-gray-0 !border-gray-7 shadow font-medium",
        )}
      >
        {icon} {text}
      </div>
    </Link>
  );
};

export default SidebarLink;
