import { Outlet } from "react-router-dom";
import NotesList from "../components/notes-list";
import Sidebar from "../components/sidebar";

const Root = () => {
  return (
    <div className="w-full flex h-[100dvh]">
      <Sidebar />
      <NotesList />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default Root;
