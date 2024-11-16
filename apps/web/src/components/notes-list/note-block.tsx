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
  return (
    <Link to={`/notes/${note.id}`}>
      <div className="w-full bg-gray-3 rounded p-2 group hover:bg-gray-5 cursor-pointer transition">
        <h2 className="group-hover:text-gray-12 text-gray-11 text-[14px] font-medium">
          {note.title || "Untitled"}
        </h2>
        <div className="group-hover:text-gray-12 text-gray-11 text-[12px] font-light transition">
          {note.content === "" && "Empty note"}
          {note.content !== "" && (
            <LexicalComposer
              initialConfig={{
                namespace: "NoteEditor",
                onError: handleError,
                editorState: note.content !== "" ? note.content : undefined,
                editable: false,
              }}
              key={note.content}
            >
              <div className="w-full relative">
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable
                      readOnly
                      tabIndex={-1}
                      className="outline-none max-h-[70px] overflow-hidden pointer-events-none select-none"
                    />
                  }
                  placeholder={
                    <div className="absolute top-0 left-0">Empty note</div>
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />
              </div>
            </LexicalComposer>
          )}
        </div>
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
