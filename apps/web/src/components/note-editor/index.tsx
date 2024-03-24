import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin"
import { EditorState } from "lexical"
import { ChangeEvent, useCallback, useEffect, useState } from "react"
import { FieldError, Input, TextField } from "react-aria-components"
import { graphql, useFragment, useMutation } from "react-relay"
import usePrevious from "@/hooks/use-previous"
import { noteEditor_note$key } from "./__generated__/noteEditor_note.graphql"
import styles from "./index.module.css"

const UpdateNoteMutation = graphql`
  mutation noteEditor_updateNoteMutation(
    $id: ID!
    $title: String!
    $content: String!
  ) {
    updateNote(id: $id, input: { title: $title, content: $content }) {
      id
      title
      content
    }
  }
`

type TProps = {
  fragmentRef: noteEditor_note$key
}

const NoteEditor = (props: TProps) => {
  const data = useFragment(
    graphql`
      fragment noteEditor_note on Note {
        id
        title
        content
      }
    `,
    props.fragmentRef
  )
  const [title, setTitle] = useState(data.title)
  const [editorState, setEditorState] = useState<EditorState | undefined>()
  const prevEditorState = usePrevious(editorState)
  const prevTitle = usePrevious(title)
  const [commitMutation] = useMutation(UpdateNoteMutation)

  const updateNote = useCallback(() => {
    // Only send data to server if data actually changed
    if (
      JSON.stringify(prevEditorState?.toJSON()) ===
        JSON.stringify(editorState?.toJSON()) &&
      prevTitle === title
    ) {
      return
    }

    commitMutation({
      variables: {
        id: data.id,
        title,
        content: editorState
          ? JSON.stringify(editorState.toJSON())
          : data.content,
      },
    })
  }, [
    editorState,
    prevEditorState,
    commitMutation,
    data.id,
    title,
    prevTitle,
    data.content,
  ])

  useEffect(() => {
    const timeout = setTimeout(updateNote, 500)

    return () => {
      clearTimeout(timeout)
    }
  }, [editorState, commitMutation, updateNote, data.id, title])

  const initialConfig = {
    namespace: "NoteEditor",
    theme: {},
    onError: (err: Error) => {
      // Todo: handle errors
      console.error(err)
    },
    editorState: data.content || undefined,
  }

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleChange = (editorState: EditorState) => {
    setEditorState(editorState)
  }

  return (
    <div className="h-full w-full max-w-[720px] flex flex-col">
      <TextField>
        <Input
          value={title}
          onChange={handleTitleChange}
          className="bg-transparent text-gray-12 text-4xl font-bold outline-none mb-5"
        />
        <FieldError />
      </TextField>

      <div className={styles.editor}>
        <LexicalComposer initialConfig={initialConfig}>
          <PlainTextPlugin
            contentEditable={<ContentEditable />}
            placeholder={<></>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <OnChangePlugin onChange={handleChange} />
        </LexicalComposer>
      </div>
    </div>
  )
}

export default NoteEditor
