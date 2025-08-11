import {createMemo, For, onCleanup} from "solid-js"
import bemby from "@chee/bemby"
import {
	parseDocumentURL,
	type AutomergeURLOrDocumentURL,
} from ":/core/sync/url.ts"
import type {FileEntryDoc} from ":/docs/file-entry-doc.ts"
import {useDocument} from "solid-automerge"
import {usePerfectView} from ":/ui/components/view/usePerfectView.tsx"
import {Shadows} from ":/ui/components/view/shadow.tsx"
import {Dynamic} from "solid-js/web"
import defaultRepo from ":/core/sync/automerge.ts"

export default function AutomergeDocViewerFooter(props: {
	url: AutomergeURLOrDocumentURL
}) {
	const docinfo = createMemo(() => parseDocumentURL(props.url))
	const [entry, entryHandle] = useDocument<FileEntryDoc>(() => docinfo().url, {
		repo: defaultRepo,
	})
	const view = usePerfectView(() => props.url)
	const [content, contentHandle] = useDocument(() => entry()?.url, {
		repo: defaultRepo,
	})
	const indicators = () => []
	const sinks = () => self.lb.getSinks(content())
	return (
		<footer
			class={bemby("view-status-bar", {
				active: props.url == self.lb.dock.activePanelID,
			})}>
			<span class="view-status-bar__editor-name">
				{view()?.displayName ?? view()?.id}
			</span>{" "}
			{/* <For each={Array.from(indicators())}>
				{indicator => {
					return (
						<Shadows>
							{shadowProps => (
								<Dynamic
									component={indicator.render}
									doc={content}
									onChange={n => {
										contentHandle()?.on("change", n)
										onCleanup(() => {
											contentHandle()?.off("change", n)
										})
									}}
									isActive={() => !!props.isActive}
									onCleanup={onCleanup}
									onMount={onMount}
									registerKeybinding={() => {}}
									shadow={shadowProps.shadow()}
								/>
							)}
						</Shadows>
					)
				}}
			</For> */}
			<For each={sinks()}>
				{sink => {
					return (
						<button
							onClick={() => {
								if ("schema" in sink) {
									sink.publish({
										handle: contentHandle()!,
										doc: content(),
									})
								}
							}}>
							{sink.icon || "⚙️"} {sink.displayName || sink.id}
						</button>
					)
				}}
			</For>
		</footer>
	)
}
