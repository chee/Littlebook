import rich from "./rich.ts"

export default function CodeMirrorPlugin() {
	window.littlebook.registerView(rich)
}
