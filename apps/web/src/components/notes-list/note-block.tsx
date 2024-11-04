import { Note } from "../../utils/types";

type TProps = {
  note: Note;
};

const NoteBlock = ({ note }: TProps) => {
  return (
    <div className="w-full bg-gray-3 rounded p-2 group hover:bg-gray-5 cursor-pointer transition">
      <h2 className="group-hover:text-gray-12 text-gray-11 text-[14px] font-medium">
        {note.title || "Untitled"}
      </h2>
      <p className="group-hover:text-gray-12 text-gray-11 text-[12px] font-light transition">
        {note.content || "Empty note"}
      </p>
      {note.tags.length > 0 && (
        <div className="flex gap-2 mt-2">
          {note.tags.map((tag) => (
            <div
              key={tag}
              className="rounded bg-gray-5 group-hover:bg-gray-6 text-[12px] p-1 transition"
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteBlock;
