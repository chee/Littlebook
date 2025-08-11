import type {DocHandle} from "@automerge/vanillajs"
import type {StandardSchemaV1} from "@standard-schema/spec"

/* todo
 * what are some other kinds of views that are missing?
 * - sidebar widgets
 * - views over multiple files
 * - views over the whole repo
 */

export type ViewID = string & {__viewID: true}

type ViewStyle = string
type MaybePromise<T> = T | Promise<T>
type MaybeModule<T> = T | {default: T}

export type ViewStylesType = MaybePromise<MaybeModule<ViewStyle>>

interface ViewBase<API> {
	id: ViewID
	icon?: string
	displayName?: string
	category: string
	styles?: ViewStylesType | ViewStylesType[]
	render(api: API): HTMLElement
}

interface FileViewBase<Shape, API> extends ViewBase<API> {
	schema: StandardSchemaV1<Shape>
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StandaloneViewAPI extends ViewAPIBase {}
export type StandaloneViewID = ViewID & {standalone: true}

export function normalizeStandaloneViewID(
	id: StandaloneViewID,
): StandaloneViewID {
	if (id.startsWith("standalone:")) {
		return id.slice(11) as StandaloneViewID
	} else {
		return id
	}
}

export interface StandaloneView extends ViewBase<StandaloneViewAPI> {
	id: StandaloneViewID
	category: "standalone"
}

export interface IndicatorView<Shape = unknown>
	extends FileViewBase<Shape, IndicatorViewAPI<Shape>> {
	category: "indicator"
}

export interface AutomergeDocumentEditorView<Shape = unknown>
	extends FileViewBase<Shape, AutomergeDocumentEditorAPI<Shape>> {
	category: "editor"
	kind: "automerge"
}

export interface BlobEditorView extends ViewBase<BlobEditorAPI> {
	category: "editor"
	kind: "blob"
	patterns: string[]
	mimes: string[]
}

export interface AutomergeDocumentReadonlyView<Shape = unknown>
	extends FileViewBase<Shape, AutomergeDocumentReadonlyAPI<Shape>> {
	category: "readonly"
}

interface ViewAPIBase {
	// todo this should be a plugin concern, not a view concern.
	// and maybe it's just registerTask and it requires an icon and display name and a schema
	// that i guess would be registerFileTask. there's also other tasks. registerStartupTask registerScheduledTask
	// nah, these are all just tasks with categories. maybe a sink is also a task? or... idk, a sink is maybe different.
	//

	// and then we need sinks. sinks are maybe just functions

	registerKeybinding(
		keybinding: string,
		action: (event: KeyboardEvent) => void,
	): void

	onCleanup(cleanup: () => void): void
	onMount(mount: () => void): void
	shadow: ShadowRoot
}

export interface AutomergeDocumentReadonlyAPI<Shape> extends ViewAPIBase {
	doc(): Shape
	onChange(fn: () => void): void
}

export interface IndicatorViewAPI<Shape> extends ViewAPIBase {
	doc(): Shape
	onChange(fn: () => void): void
}

export interface AutomergeDocumentEditorAPI<Shape> extends ViewAPIBase {
	handle: DocHandle<Shape>
}

export interface BlobEditorAPI extends ViewAPIBase {
	// todo should this be the arrayBuffer or uint8array?
	blob(): Blob
	onChange(fn: () => void): void
	// todo should this actually take an arraybuffer?
	update(blob: Blob): void
}

export type View<Shape = unknown> =
	| AutomergeDocumentEditorView<Shape>
	| AutomergeDocumentReadonlyView<Shape>
	| IndicatorView<Shape>
	| StandaloneView
	| BlobEditorView

export type FileEditorRenderFunction<Shape> =
	AutomergeDocumentEditorView<Shape>["render"]
export type FileViewerRenderFunction<Shape> =
	AutomergeDocumentReadonlyView<Shape>["render"]
export type StandaloneViewRenderFunction = StandaloneView["render"]
