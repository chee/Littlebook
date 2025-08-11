import {createOpenCanvas04} from "./src/sources/createOpenCanvas.ts"
// import readonlyView from "./src/views/readonly/readonly-view.tsx"

export default async function activateOpenCanvas() {
	await import("./src/views/excalidraw/excalidraw-view.tsx").then(mod => {
		window.littlebook.registerView(mod.default)
	})
	await import("./src/views/tldraw/tldraw-view.tsx").then(mod => {
		window.littlebook.registerView(mod.TldrawView)
	})

	// window.littlebook.registerView(readonlyView)
	window.littlebook.registerSource(createOpenCanvas04)
}
