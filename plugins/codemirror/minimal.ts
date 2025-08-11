import {automergeSyncPlugin} from "@automerge/automerge-codemirror"
import {EditorView} from "@codemirror/view"
import type {AutomergeDocumentEditorAPI, ViewID} from ":/types/view"
import {minimalSetup} from "codemirror"
import type {CodeShape} from ":/shapes/shapes.ts"
// import {CodeSchema, FileEditor, type FileEditorAPI} from "+types+"

function render(props: AutomergeDocumentEditorAPI<CodeShape>) {
	const editor = new EditorView({
		doc: props.handle.doc()?.text,
		extensions: [
			minimalSetup,
			EditorView.lineWrapping,
			automergeSyncPlugin({
				handle: props.handle,
				path: ["text"],
			}),
		],
		parent: document.createElement("div"),
	}).dom
	return editor
}

export default {
	id: "text-editor" as ViewID,
	displayName: "Text Editor",
	category: "editor",
	render,
	styles: [
		".cm-editor, .cm-scroller, .cm-content {height: 100%; display: flex; flex-direction: column; overflow: auto;}",
	],
	schema: window.littlebook.shapes.CodeShape,
}
