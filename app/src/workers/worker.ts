import * as Comlink from "comlink"
import type {Remote} from "comlink"
import {
	Repo,
	WebSocketClientAdapter,
	IndexedDBStorageAdapter,
	type AutomergeUrl,
} from "@automerge/vanillajs/slim"
import bundle from "./esbuild/bundle.ts"
import {type LittlebookPluginShape} from "./shapes.ts"
import {next as Automerge} from "@automerge/automerge/slim"

// todo pass through networks from main thread
const repo = new Repo({
	network: [
		new WebSocketClientAdapter(`wss://galaxy.observer`),
		new WebSocketClientAdapter("ws://localhost:11128"),
	],
	storage: new IndexedDBStorageAdapter("littlebook"),
	enableRemoteHeadsGossiping: true,
})

const pluginWorker = {
	async compile(url: AutomergeUrl) {
		if (!Automerge.isWasmInitialized()) {
			await import("@automerge/automerge/automerge.wasm.base64").then(
				mod => {
					return Automerge.initializeBase64Wasm(mod.automergeWasmBase64)
				},
			)
		}
		const handle = await repo.find<LittlebookPluginShape>(url)
		return bundle(handle)
	},
}

export type PluginWorker = Remote<typeof pluginWorker>

Comlink.expose(pluginWorker)
