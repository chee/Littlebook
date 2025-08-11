import {useHotkeys} from ":/ui/lib/useHotkeys.ts"
import type {DocHandle} from "@automerge/automerge-repo"
import type {AutomergeDocumentReadonlyView} from ":/types/view"
import {
	createEffect,
	getOwner,
	onCleanup,
	onMount,
	runWithOwner,
	type Accessor,
} from "solid-js"
import {Dynamic} from "solid-js/web"

export default function ReadonlyFileview<T>(props: {
	view: AutomergeDocumentReadonlyView<T>
	fileHandle: DocHandle<T>
	shadow: Accessor<ShadowRoot>
}) {
	const subs = new Set<() => void>()
	function change() {
		for (const sub of subs) {
			sub()
		}
	}

	createEffect(() => {
		props.fileHandle.on("change", change)
		onCleanup(() => {
			subs.clear()
			props.fileHandle.off("change", change)
		})
	})

	const owner = getOwner()

	return (
		<Dynamic
			component={props.view.render}
			doc={() => props.fileHandle.doc()}
			registerKeybinding={(key, action) =>
				onCleanup(useHotkeys(key, action))
			}
			onChange={fn => subs.add(fn)}
			onMount={onMount}
			onCleanup={fn => runWithOwner(owner, () => onCleanup(fn))}
			shadow={props.shadow()}
		/>
	) as ReturnType<typeof props.view.render>
}
