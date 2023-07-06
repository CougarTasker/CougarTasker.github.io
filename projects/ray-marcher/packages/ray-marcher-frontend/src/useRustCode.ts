import { useEffect, useState } from "preact/hooks";
import init from "ray-marcher-rust";

export const RUST_MODULE_LOADING = "RUST_MODULE_LOADING"
export const RUST_MODULE_FAILED = "RUST_MODULE_FAILED"

type ModuleReturn = typeof RUST_MODULE_LOADING | typeof RUST_MODULE_FAILED | Awaited<ReturnType<typeof init>>

let moduleCache = init()

export function useRustCode() {
    const [module, setModule] = useState<ModuleReturn>(RUST_MODULE_LOADING)
    useEffect(() => {
        moduleCache
        .then(setModule)
        .catch(() => setModule(RUST_MODULE_FAILED))
    }, [])
    return module
}