import { Link } from "react-router-dom";
import { TNote } from "../../utils/types";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";

const handleError = (error: Error) => {
  console.error(error);
};

type TProps = {
  note: TNote;
};

const NoteBlock = ({ note }: TProps) => {
  console.log("note id", note.id, "content", JSON.parse(note.content));

  return (
    <Link to={`/notes/${note.id}`}>
      <div className="w-full bg-gray-3 rounded p-2 group hover:bg-gray-5 cursor-pointer transition">
        <h2 className="group-hover:text-gray-12 text-gray-11 text-[14px] font-medium">
          {note.title || "Untitled"}
        </h2>
        <p className="group-hover:text-gray-12 text-gray-11 text-[12px] font-light transition">
          {note.content === "" && "Empty note"}
          {note.content !== "" && (
            <LexicalComposer
              initialConfig={{
                namespace: "NoteEditor",
                onError: handleError,
                editorState: note.content !== "" ? note.content : undefined,
              }}
              key={note.content}
            >
              <div className="w-full relative">
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable className="outline-none max-h-[70px] overflow-hidden" />
                  }
                  placeholder={
                    <div className="absolute top-0 left-0">Empty note</div>
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />
              </div>
            </LexicalComposer>
          )}
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
    </Link>
  );
};

export default NoteBlock;
