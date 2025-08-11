import registerBaseSources from "./base-sources.ts"
import registerBaseViews from "./base-views.ts"
import automergeDocEditor from ":/plugins/base/views/editors/automerge-doc-editor.tsx"
import pluginEditor from "@littlebook/plugin-editor"

export default async function activateBasePlugin() {
	const api = self.littlebook
	pluginEditor()
	registerBaseSources()
	registerBaseViews()
	// await import("@littlebook/pvh-tldraw").then(activate => activate.default())
	await import("@littlebook/opencanvas").then(activate => activate.default())
	// await import("@littlebook/codemirror").then(activate => activate.default())
	// await import("@littlebook/prosemirror").then(activate => activate.default())
	api.registerView(automergeDocEditor)
}
