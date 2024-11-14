import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TNote } from "../../utils/types";
import NoteBlock from "./note-block";
import React from "react";
import { IconPlus } from "@tabler/icons-react";

const NotesList = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const res = await fetch("http://localhost:4000/notes");
      const notes = await res.json();
      return notes as {
        notes: TNote[];
      };
    },
  });

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
    <div className="w-[280px] h-full p-2 border-r border-gray-6 flex flex-col gap-4">
      <div></div>
      <div className="flex justify-between text-gray-11  items-center">
        <h2 className="uppercase text-[12px] tracking-[1px]">My Notes</h2>
        <div className="cursor-pointer" onClick={handleNoteCreateClick}>
          <IconPlus size={20} stroke={1.5} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {data?.notes.map((note) => (
          <React.Fragment key={note.id}>
            <NoteBlock note={note} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default NotesList;
