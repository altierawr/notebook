import { IconHeart, IconNote, IconTrash } from "@tabler/icons-react";
import SidebarLink from "./sidebar-link";

const Sidebar = () => {
  return (
    <div className="h-full w-[250px] border-r border-gray-300 bg-gray-1 pt-[150px] px-2">
      <SidebarLink
        icon={<IconNote stroke={1.5} />}
        text="Notes"
        url="/"
        location="notes"
      />
      <SidebarLink
        icon={<IconHeart stroke={1.5} />}
        text="Favorites"
        url="/favorites"
        location="favorites"
      />
      <SidebarLink
        icon={<IconTrash stroke={1.5} />}
        text="Trash"
        url="/trash"
        location="trash"
      />
    </div>
  );
};

export default Sidebar;
