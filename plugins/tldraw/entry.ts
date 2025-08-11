import {DEFAULT_STORE} from "automerge-tldraw/dist/default_store.js"

export default async function activateTldraw() {
	await import("./src/views/view.tsx").then(mod => {
		window.littlebook.registerView(mod.TldrawView)
	})

	window.littlebook.registerSource({
		id: "github.com/pvh/tldraw-automerge/default",
		category: "new",
		displayName: "pvh tldraw",
		new() {
			return {
				name: "new tldraw canvas",
				content: {...DEFAULT_STORE},
			}
		},
	})
}
