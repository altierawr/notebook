import { Link, useLocation, useNavigate } from "react-router-dom";
import { TNote } from "../../utils/types";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import clsx from "clsx";
import { IconHeart, IconTrash } from "@tabler/icons-react";
import { MouseEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";

const handleError = (error: Error) => {
  console.error(error);
};

type TProps = {
  note: TNote;
};

const NoteBlock = ({ note }: TProps) => {
  const location = useLocation();
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const isSelected = location.pathname === `/notes/${note.id}`;

  const handleClick = () => {
    navigate(`/notes/${note.id}`)
  }

  const updateNote = async (body: object) => {
    const res = await fetch(`http://localhost:4000/notes/${note.id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    if (res.status !== 200) {
      const json = await res.json();
      console.error("Note update failed:", json);
    } else {
      queryClient.invalidateQueries({
        queryKey: ["note", note.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["notes"],
      });
    }
  }

  const handleFavoriteClick = async (e: MouseEvent) => {
    e.stopPropagation()
    updateNote({
      isFavorite: !note.isFavorite
    })
  }

  const handleTrashClick = (e: MouseEvent) => {
    e.stopPropagation()
    updateNote({
      isTrashed: !note.isTrashed
    })
  }

  return (
      <div
        className={clsx(
          "w-full bg-gray-3 rounded p-2 group hover:bg-gray-5 transition",
          isSelected && "bg-gray-5",
        )}
        onClick={handleClick}
      >
        <div className="w-full flex justify-between gap-2 items-center">
          <h2
            className={clsx(
              "group-hover:text-gray-12 select-none text-gray-11 text-[14px] font-medium text-nowrap overflow-x-hidden text-ellipsis",
              isSelected && "text-gray-12",
            )}
          >
            {note.title || "Untitled"}
          </h2>

          <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100">
            <div className={clsx("text-gray-11 hover:text-gray-12", note.isFavorite && "!text-red-11")} onClick={handleFavoriteClick}>
              <IconHeart size={20} stroke={2} fill={note.isFavorite ? "currentColor": "transparent"} />
            </div>
            <div className="text-gray-11 hover:text-gray-12" onClick={handleTrashClick}>
              <IconTrash size={20} stroke={2} />
            </div>
          </div>
        </div>
        <div
          className={clsx(
            "group-hover:text-gray-12 text-gray-11 text-[12px] font-light transition",
            isSelected && "text-gray-12",
          )}
        >
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
                className={clsx(
                  "rounded bg-gray-5 group-hover:bg-gray-6 text-[12px] p-1 transition",
                  isSelected && "bg-gray-6",
                )}
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
