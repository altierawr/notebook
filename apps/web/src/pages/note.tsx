import { PreloadedQuery, graphql, usePreloadedQuery } from "react-relay"
import { useLoaderData } from "react-router-dom"
import { notePageQuery } from "./__generated__/notePageQuery.graphql"

const Component = () => {
  const queryRef = useLoaderData() as PreloadedQuery<notePageQuery>

  const data = usePreloadedQuery<notePageQuery>(
    graphql`
      query notePageQuery($id: ID!) {
        node(id: $id) {
          ... on Note {
            id
            content
          }
        }
      }
    `,
    queryRef
  )

  return (
    <>
      <p className="text-gray-12">Note {data.node?.id}</p>
    </>
  )
}

const ErrorBoundary = () => {
  return <></>
}

export { Component, ErrorBoundary }
