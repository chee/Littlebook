import WebSocket from "ws"
import {Repo, WebSocketClientAdapter} from "@automerge/vanillajs"
import * as Automerge from "@automerge/automerge"
import * as AutomergeVanilla from "@automerge/vanillajs"

// @ts-expect-error this is on purpose
globalThis.WebSocket = WebSocket

globalThis.Automerge = Automerge
globalThis.AutomergeVanilla = AutomergeVanilla

const repo = new Repo({
	network: [
		new WebSocketClientAdapter("wss://galaxy.observer/"),
		new WebSocketClientAdapter("ws://localhost:11128"),
	],
})

import repl from "node:repl"
const session = repl.start({
	useGlobal: true,
	useColors: true,
	prompt: "[littlebook] $ ",
})
session.context.repo = repo
session.on("exit", () => process.exit(0))
