import { useEffect, useState } from "react"

const isDarkMode = () => {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  )
}

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(isDarkMode())

  useEffect(() => {
    const onChange = () => {
      setIsDark(isDarkMode())
    }

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", onChange)

    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", onChange)
    }
  }, [])

  return isDark
}

export default useDarkMode
