import clsx from "clsx"
import { Suspense } from "react"
import { PreloadedQuery } from "react-relay"
import { Outlet, useLoaderData } from "react-router-dom"
import Sidebar from "@/components/sidebar"
import { sidebarQuery } from "@/components/sidebar/__generated__/sidebarQuery.graphql"
import useDarkMode from "@/hooks/use-dark-mode"

const Component = () => {
  const isDark = useDarkMode()
  const queryRef = useLoaderData() as PreloadedQuery<sidebarQuery>

  return (
    <div className={clsx(isDark && "dark")}>
      <div className="flex bg-gray-0 min-h-[100dvh] w-full">
        <Sidebar queryRef={queryRef} />
        <Suspense fallback={<p>Loading...</p>}>
          <div className="flex-1 relative">
            {/* Todo: Add actual navbar */}
            <div className="w-full h-9 absolute top-0 left-0" />
            <div className="w-full h-full pt-9">
              <div className="w-full h-full pt-5">
                <Outlet />
              </div>
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  )
}

const ErrorBoundary = () => {
  return <></>
}

export { Component, ErrorBoundary }
