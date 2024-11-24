import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TNote } from "../../utils/types";
import NoteBlock from "./note-block";
import React, { ChangeEvent, useState } from "react";
import { IconPlus, IconSearch } from "@tabler/icons-react";

const NotesList = () => {
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<number | undefined>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notes", searchQuery],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:4000/notes?query=${searchQuery}`,
      );
      const notes = await res.json();
      return notes as {
        notes: TNote[];
      };
    },
  });

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    if (typeof searchTimeout === "number") {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(async () => {
      setSearchQuery(e.target.value);
    }, 500);
    setSearchTimeout(timeout);
  };

  const handleNoteCreateClick = async () => {
    const res = await fetch("http://localhost:4000/notes", {
      method: "POST",
    });
    if (res.status === 201) {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    } else {
      console.error("Note creation failed");
    }
  };

  return (
    <>
      <div className="w-[280px] h-full p-2 pb-0 border-r border-gray-6 flex flex-col gap-4">
        <div className="w-full rounded min-h-7 h-7 p-2 flex items-center gap-2 bg-gray-3 border border-gray-7">
          <IconSearch size={16} stroke={1.5} className="text-gray-11" />
          <input
            type="text"
            placeholder="Search notes..."
            className="bg-transparent outline-none flex-1 text-[14px]"
            value={searchText}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex flex-col gap-2 flex-1 h-full overflow-hidden">
          <div className="flex justify-between w-full text-gray-11 items-center">
            <h2 className="uppercase text-[12px] tracking-[1px]">My Notes</h2>
            <div className="cursor-pointer" onClick={handleNoteCreateClick}>
              <IconPlus size={20} stroke={1.5} />
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto no-scrollbar">
            {isLoading && <p>Loading...</p>}
            {!isLoading &&
              data?.notes.map((note) => (
                <React.Fragment key={note.id}>
                  <NoteBlock note={note} />
                </React.Fragment>
              ))}
            <div className="w-full min-h-2 h-2" />
          </div>
        </div>
      </div>
    </>
  );
};

export default NotesList;
