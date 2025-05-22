import {type Repo} from "@automerge/vanillajs"
import {createContext, useContext} from "solid-js"
import {Registry} from "./registry.ts"
import type {View} from "../types/view.ts"

// deno-lint-ignore no-explicit-any
export class ViewRegistry extends Registry<"view", View<any>> {
	constructor({repo}: {repo: Repo}) {
		super({repo, doctype: "view"})
	}

	/*
	 * a way to add these:
	 * 1. cli: build the bundle
	 * 2. cli: cat bundle.js|base64 -w0|pbcopy
	 * 3. browser: repo.find(url).change(doc => doc.bytes = Uint8Array.fromBase64(`⌘+v`))<RET>
	 */
	*views(file: unknown) {
		for (const view of Object.values(this.records)) {
			if (view.category != "standalone" && !view.schema) {
				console.warn("non-standalone view has no schema", view)
				continue
			}
			if (view.category == "standalone") {
				// yield view
			} else {
				const result = view.schema["~standard"].validate(file)
				if (result instanceof Promise) {
					console.warn("schemas cannot be async")
					continue
				}
				if (result.issues) {
					continue
				} else {
					yield view
				}
			}
		}
	}

	*standalones() {
		for (const view of Object.values(this.records)) {
			if (view.category == "standalone") {
				yield view
			}
		}
	}
}

export const ViewRegistryContext = createContext<ViewRegistry>()

export function useViewRegistry() {
	const value = useContext(ViewRegistryContext)
	if (!value) {
		throw new Error("this needs to be used within a ViewRegistryContext")
	}
	return value
}
