import { Outlet } from "react-router-dom";
import NotesList from "./components/notes-list";
import Sidebar from "./components/sidebar";

const App = () => {
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

export default App;
