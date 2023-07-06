import { useRustCode } from "./useRustCode"
export function App() {
  const rustCode = useRustCode()

  if (typeof rustCode === "string") {
    return null
  }

  return (
    <>
      <h1>Ray marcher connectivity</h1>
      <button onClick={() => rustCode.greet()}>
        Test
      </button>


    </>
  )
}
