import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { TNote } from "../../utils/types";
import { ChangeEvent, useState } from "react";
import OnChangePlugin from "./plugins/on-change";
import { $getRoot, EditorState, SerializedEditorState } from "lexical";
import { useQueryClient } from "@tanstack/react-query";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

const handleError = (error: Error) => {
  console.error(error);
};

const getCleanRawEditorContent = (state: EditorState) => {
  return state.read(() =>
    $getRoot()
      .getTextContent()
      .split("\n")
      .filter((t) => t.trim().length > 0)
      .join("\n"),
  );
};

type TProps = {
  note: TNote;
};

const NoteEditor = ({ note }: TProps) => {
  const [noteTitle, setNoteTitle] = useState(note.title);
  const [editorState, setEditorState] = useState<EditorState | undefined>();
  const [noteSaveTimeout, setNoteSaveTimeout] = useState<number | undefined>();
  const queryClient = useQueryClient();

  const saveNote = (title: string, content?: EditorState) => {
    if (typeof noteSaveTimeout === "number") {
      clearTimeout(noteSaveTimeout);
    }

    const timeout = setTimeout(async () => {
      const res = await fetch(`http://localhost:4000/notes/${note.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title,
          content: content ? JSON.stringify(content.toJSON()) : undefined,
          rawContent: content ? getCleanRawEditorContent(content) : undefined,
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
    setEditorState(state);
    saveNote(noteTitle, state);
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
