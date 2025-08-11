import {
	parseDocumentURL,
	type AutomergeURLOrDocumentURL,
} from ":/core/sync/url.ts"
import type {FileEntryDoc} from ":/docs/file-entry-doc.ts"
import ViewErrorBoundary from ":/ui/components/view/error-boundary/error-boundary.tsx"
import EditorFileview from ":/ui/components/view/automerge-doc/editor.tsx"
import ReadonlyFileview from ":/ui/components/view/automerge-doc/readonly.tsx"
import {Shadows} from ":/ui/components/view/shadow.tsx"
import {usePerfectView} from ":/ui/components/view/usePerfectView.tsx"
import type {
	AutomergeDocumentEditorView,
	AutomergeDocumentReadonlyView,
} from ":/types/view"
import {useDocHandle, useDocument} from "solid-automerge"
import {Switch, Match, createMemo, Show, createRenderEffect} from "solid-js"
import {customElement, noShadowDOM} from "solid-element"
import defaultRepo from ":/core/sync/automerge.ts"

export function AutomergeDocumentViewer(props: {
	url: AutomergeURLOrDocumentURL
	viewer?: string
}) {
	const docinfo = createMemo(() => parseDocumentURL(props.url))
	const [entry, entryHandle] = useDocument<FileEntryDoc>(() => docinfo().url, {
		repo: defaultRepo,
	})
	const view = usePerfectView(
		() => props.url,
		() => props.viewer,
	)
	const contentHandle = useDocHandle(() => entry()?.url, {repo: defaultRepo})

	return (
		<Show when={entry() && view() && contentHandle()}>
			<ViewErrorBoundary
				entry={entry()}
				view={view()}
				content={contentHandle?.latest?.doc()}>
				<Shadows class="view-shadow-root">
					{shadowProps => {
						createRenderEffect(() => {
							if (view()!.styles) {
								shadowProps.setViewStyles(view()!.styles!)
							}
						})

						return (
							<Switch>
								<Match when={view()?.category === "editor"}>
									<EditorFileview
										view={
											view()! as AutomergeDocumentEditorView<unknown>
										}
										fileHandle={contentHandle()!}
										entryHandle={entryHandle()!}
										shadow={shadowProps.shadow}
									/>
								</Match>
								<Match when={view()?.category === "readonly"}>
									<ReadonlyFileview
										view={
											view() as AutomergeDocumentReadonlyView<unknown>
										}
										fileHandle={contentHandle()!}
										shadow={shadowProps.shadow}
									/>
								</Match>
							</Switch>
						) as HTMLElement
					}}
				</Shadows>
			</ViewErrorBoundary>
		</Show>
	)
}

customElement(
	"little-automerge-view",
	{url: "" as AutomergeURLOrDocumentURL, viewer: undefined},
	(props, {element}) => {
		noShadowDOM()
		return <AutomergeDocumentViewer {...props} />
	},
)
