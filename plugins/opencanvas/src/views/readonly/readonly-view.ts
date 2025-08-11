import {oCIFCore04Schema} from "../../shapes/v0.4.ts"
import {OCIFCore04} from "../../types/v0.4.ts"
import {createRoot} from "react-dom/client"

export default {
	id: "@opencanvas/view",
	displayName: "OpenCanvas Viewer",
	category: "readonly",
	render(props) {
		const div = document.createElement("div")
		const root = createRoot(div)
		props.onCleanup(() => root.unmount())
		return div
	},
	schema: oCIFCore04Schema,
	// todo how to share these types
	// todo maybe i just bring everything into app
	// todo down with monorepos!!!
	// todo and the publish the types on build
	// todo on https://littlebook.app/littlebook.d.ts
	// todo and on npm? or deno or whatever
} satisfies FileViewer<OCIFCore04>
