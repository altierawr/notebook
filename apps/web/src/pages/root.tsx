import { Outlet, useLocation } from "react-router-dom";
import NotesList from "../components/notes-list";
import Sidebar from "../components/sidebar";
import { useEffect, useState } from "react";
import { useLocationStore } from "../store";

const Root = () => {
  const location = useLocation();
  const setLocation = useLocationStore((state) => state.setLocation);
  const [hasSetInitialLocation, setHasSetInitialLocation] = useState(false);

  useEffect(() => {
    if (hasSetInitialLocation) {
      return;
    }

    setHasSetInitialLocation(true);

    switch (location.pathname) {
      case "/favorites":
        setLocation("favorites");
        break;
      case "/trash":
        setLocation("trash");
        break;
      default:
        setLocation("notes");
    }
  }, [hasSetInitialLocation, location.pathname, setLocation]);

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
