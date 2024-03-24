import { Loader } from "design"
import { Suspense } from "react"
import { PreloadedQuery, graphql, usePreloadedQuery } from "react-relay"
import { useLoaderData } from "react-router-dom"
import NoteEditor from "@/components/note-editor"
import { notePageQuery } from "./__generated__/notePageQuery.graphql"

const Component = () => {
  const queryRef = useLoaderData() as PreloadedQuery<notePageQuery>

  const data = usePreloadedQuery<notePageQuery>(
    graphql`
      query notePageQuery($id: ID!) {
        node(id: $id) {
          id
          ...noteEditor_note
        }
      }
    `,
    queryRef
  )

  return (
    <div className="h-full w-full flex justify-center px-8">
      <Suspense fallback={<Loader />}>
        {data.node && <NoteEditor key={data.node.id} fragmentRef={data.node} />}
      </Suspense>
    </div>
  )
}

const ErrorBoundary = () => {
  return <></>
}

export { Component, ErrorBoundary }
