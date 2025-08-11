/** @jsxRuntime automatic */
/** @jsxImportSource react */
import {createRoot} from "react-dom/client"
import {Tldraw} from "@tldraw/tldraw"
import {useAutomergeStore} from "automerge-tldraw"
import {LooseTldrawShape} from "../shapes/tldraw-shape.ts"

function View(props) {
	const store = useAutomergeStore({handle: api.handle, userId: "shh"})
	return <Tldraw inferDarkMode autoFocus store={store} />
}

const render = function render(api) {
	const div = document.createElement("div")
	const root = createRoot(div)
	root.render(<View />)
	api.onCleanup(() => root.unmount())
	return div
}

export const TldrawView = {
	id: "@opencanvas/tldraw",
	displayName: "OpenCanvas TLDraw",
	category: "editor",
	render,
	schema: LooseTldrawShape,
	styles: [import("tldraw/tldraw.css?inline"), ":host > div {height: 100%}"],
}
