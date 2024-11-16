import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { TNote } from "../utils/types";
import NoteEditor from "../components/editor";

const NotePage = () => {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["note", id ? parseInt(id) : undefined],
    queryFn: async () => {
      const res = await fetch(`http://localhost:4000/notes/${id}`);
      const note = await res.json();
      return note as {
        note: TNote;
      };
    },
  });

  return (
    <div className="pt-4 mx-auto h-full flex flex-col">
      {isLoading && <p>Loading...</p>}
      {!isLoading && data?.note && (
        <NoteEditor key={data.note.id} note={data.note} />
      )}
    </div>
  );
};

export default NotePage;
