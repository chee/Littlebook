import {Registry} from "./registry.ts"
import type {Publisher} from ":/types/sink.ts"
import type {Repo} from "@automerge/vanillajs"

export class SinkRegistry extends Registry<"sink", Publisher<unknown>> {
	constructor({repo}: {repo: Repo}) {
		super({repo, doctype: "sink"})
	}

	*sinks(file: unknown): Generator<Publisher<unknown>> {
		for (const sink of Object.values(this.records)) {
			if (file instanceof Blob) {
				// todo do something with .patterns and .mimes
				continue
			} else if ("schema" in sink) {
				const result = sink.schema["~standard"].validate(file)
				if (result instanceof Promise) {
					console.warn("schemas cannot be async")
					continue
				}
				if (result.issues) {
					continue
				} else {
					yield sink
				}
			}
		}
	}
}
