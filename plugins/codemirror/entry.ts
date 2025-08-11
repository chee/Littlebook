import type {ViewID} from ":/types/view.ts"
import codemirrorEditor from "./codemirror-editor.ts"
import minimal from "./minimal.ts"

export default function CodeMirrorPlugin() {
	window.lb.registerView(codemirrorEditor)
	window.lb.registerView(minimal)
	window.lb.registerView({
		id: "@littlebook/text.language" as ViewID,
		category: "indicator",
		displayName: "Language Indicator",
		// todo these well known shapes need to have shared types
		schema: window.littlebook.shapes.CodeShape,
		render(api) {
			const span = document.createElement("span")
			span.textContent = api.doc().language || "plain"
			api.onChange(() => (span.textContent = api.doc().language || "plain"))
			return span
		},
	})
}
