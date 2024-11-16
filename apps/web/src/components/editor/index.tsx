import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { TNote } from "../../utils/types";
import { ChangeEvent, useState } from "react";
import OnChangePlugin from "./plugins/on-change";
import { EditorState, SerializedEditorState } from "lexical";
import { useQueryClient } from "@tanstack/react-query";

const handleError = (error: Error) => {
  console.error(error);
};

type TProps = {
  note: TNote;
};

const NoteEditor = ({ note }: TProps) => {
  const [noteTitle, setNoteTitle] = useState(note.title);
  const [editorState, setEditorState] = useState<
    SerializedEditorState | undefined
  >(note.content !== "" ? JSON.parse(note.content) : undefined);
  const [noteSaveTimeout, setNoteSaveTimeout] = useState<number | undefined>();
  const queryClient = useQueryClient();

  const saveNote = (title: string, content?: SerializedEditorState) => {
    if (typeof noteSaveTimeout === "number") {
      clearTimeout(noteSaveTimeout);
    }

    const timeout = setTimeout(async () => {
      const res = await fetch(`http://localhost:4000/notes/${note.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title,
          content: JSON.stringify(content),
        }),
      });

      if (res.status !== 200) {
        const json = await res.json();
        console.error("Note update failed:", json);
      } else {
        console.log("Updated note", note.id);
        queryClient.invalidateQueries({
          queryKey: ["note", note.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["notes"],
        });
      }
    }, 500);
    setNoteSaveTimeout(timeout);
  };

  const onEditorStateChange = (state: EditorState) => {
    setEditorState(state.toJSON());
    saveNote(noteTitle, state.toJSON());
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNoteTitle(e.target.value);
    saveNote(e.target.value, editorState);
  };

  return (
    <>
      <input
        type="text"
        className="w-full font-medium caret-gray-11 text-[36px] p-3 outline-none"
        placeholder="Enter note title..."
        value={noteTitle}
        onChange={handleTitleChange}
      />
      <LexicalComposer
        initialConfig={{
          namespace: "NoteEditor",
          onError: handleError,
          editorState: note.content !== "" ? note.content : undefined,
        }}
      >
        <div className="max-w-[680px] relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[150px] p-3 outline-none" />
            }
            placeholder={
              <div className="absolute top-3 left-3 text-gray-11">
                Start writing your note...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <OnChangePlugin onChange={onEditorStateChange} />
        </div>
      </LexicalComposer>
    </>
  );
};

export default NoteEditor;
