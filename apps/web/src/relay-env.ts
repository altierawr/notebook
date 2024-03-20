import { createClient } from "graphql-ws"
import {
  Environment,
  Network,
  RecordSource,
  Store,
  FetchFunction,
  ROOT_TYPE,
  SubscribeFunction,
  Observable,
} from "relay-runtime"

const HTTP_ENDPOINT = "http://localhost:8081/query"
const WEBSOCKET_ENDPOINT = "ws://localhost:8081/query"

const fetchFn: FetchFunction = async (request, variables) => {
  const resp = await fetch(HTTP_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      // <-- Additional headers like 'Authorization' would go here
    },
    body: JSON.stringify({
      query: request.text, // <-- The GraphQL document composed by Relay
      variables,
    }),
  })

  return await resp.json()
}

let subscribeFn: SubscribeFunction

if (typeof window !== "undefined") {
  const subscriptionsClient = createClient({
    url: WEBSOCKET_ENDPOINT,
  })

  subscribeFn = (request, variables) => {
    // https://github.com/enisdenjo/graphql-ws/issues/316#issuecomment-1047605774
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Observable.create<any>((sink) => {
      if (!request.text) {
        return sink.error(new Error("Operation text cannot be empty"))
      }

      return subscriptionsClient.subscribe(
        {
          operationName: request.name,
          query: request.text,
          variables,
        },
        sink
      )
    })
  }
}

function createRelayEnvironment() {
  return new Environment({
    network: Network.create(fetchFn, subscribeFn),
    store: new Store(new RecordSource()),
    missingFieldHandlers: [
      {
        handle(_, record, argValues) {
          // Make sure relay reuses cached data by using id's of objects
          if (record != null && record.getType() === ROOT_TYPE) {
            return argValues.id
          }

          return undefined
        },
        kind: "linked",
      },
    ],
  })
}

export const RelayEnvironment = createRelayEnvironment()
