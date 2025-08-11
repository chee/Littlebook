import type {Sink} from ":/types/sink"
import type {Source} from ":/types/source.ts"
import {View} from ":/types/view.ts"
import debug from "debug"
const log = debug("littlebook:littlebook")
import {createStore} from "solid-js/store"
import * as wellKnownShapes from "./shapes/shapes.ts"
import type {StandardSchemaV1} from "@standard-schema/spec"
import * as Comlink from "comlink"
import type {PluginWorker} from ":/workers/worker.ts"
import type {AutomergeURL} from ":/core/sync/url.ts"
import type {DockAPI} from ":/ui/dock/dock-api.ts"
type ViewStore = Record<string, View>
type SourceStore = Record<string, Source>
type SinkStore = Record<string, Sink>
type ShapeStore = Record<string, StandardSchemaV1>

export function* getViews(views: ViewStore, content: unknown): Generator<View> {
	for (const view of Object.values(views)) {
		const isAutomerge = "schema" in view
		if (isAutomerge) {
			const result = view.schema["~standard"].validate(content)
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

export function* getSources(sources: SourceStore): Generator<Source> {
	for (const source of Object.values(sources)) {
		yield source
	}
}

export function* getSinks(
	sinks: SinkStore,
	file: unknown,
): Generator<Sink<unknown>> {
	for (const sink of Object.values(sinks)) {
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

export function createLittlebookAPI(opts: {dockAPI: DockAPI}) {
	const workerProgram = new Worker(
		new URL("./workers/worker.ts", import.meta.url),
		{type: "module"},
	)

	const worker = Comlink.wrap(workerProgram) as Comlink.Remote<PluginWorker>

	const [plugins, updatePlugins] = createStore<Record<string, string>>({})
	const [views, updateViews] = createStore<ViewStore>({})
	const [sources, updateSources] = createStore<SourceStore>({})
	const [sinks, updateSinks] = createStore<SinkStore>({})
	const [shapes, updateShapes] = createStore<ShapeStore>({...wellKnownShapes})

	return {
		registerView<Shape = unknown>(view: View<Shape>) {
			log("registering view", view.id)
			updateViews(view.id, view)
		},
		registerSource<Shape = unknown>(source: Source<Shape>) {
			log("registering source", source.id)
			updateSources(source.id, source)
		},
		registerSink<Shape = unknown>(sink: Sink<Shape>) {
			log("registering sink", sink.id)
			updateSinks(sink.id, sink)
		},
		registerShape(specifier: string, shape: StandardSchemaV1) {
			log("registering shape", specifier)
			updateShapes(specifier, shape)
		},
		registerPlugin(url: AutomergeURL) {
			log("registering plugin", url)

			worker.compile(url).then(output => {
				const ex = document.querySelector(`script[data-plugin="${url}"]`)
				if (ex) ex.remove()
				const s = document.createElement("script")
				s.setAttribute("type", "module")
				s.dataset.plugin = url
				s.textContent = output.outputFiles?.[0].text ?? ""
				document.head.appendChild(s)
			})
			updatePlugins(url, url)
		},
		getViews(content: unknown): View[] {
			return Array.from(getViews(views, content))
		},
		getSources(): Source[] {
			return Array.from(getSources(sources))
		},
		getSinks(file: unknown): Sink[] {
			return Array.from(getSinks(sinks, file))
		},
		views,
		sources,
		sinks,
		shapes,
		plugins,
		dock: opts.dockAPI,
	}
}
