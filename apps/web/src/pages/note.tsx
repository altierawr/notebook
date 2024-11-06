import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Note } from "../utils/types";

const NotePage = () => {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["note"],
    queryFn: async () => {
      const res = await fetch(`http://localhost:4000/notes/${id}`);
      const note = await res.json();
      return note as {
        note: Note;
      };
    },
  });

  return (
    <div className="pt-4 mx-auto h-full flex flex-col max-w-[680px]">
      <h1>{data?.note.title}</h1>
      <p>{data?.note.content}</p>
    </div>
  );
};

export default NotePage;
