import {createRenderEffect, onCleanup, onMount, Show, Suspense} from "solid-js"
import {Dynamic} from "solid-js/web"
import {useHotkeys} from ":/ui/lib/useHotkeys.ts"
import ViewErrorBoundary from ":/ui/components/view/error-boundary/error-boundary.tsx"
import {Shadows} from ":/ui/components/view/shadow.tsx"
import type {StandaloneView} from ":/types/view.ts"

export default function StandaloneViewer(props: {
	id: string
	isActive?: boolean
}) {
	const view = () => window.littlebook.views[props.id] as StandaloneView

	let ref!: HTMLDivElement
	return (
		<Suspense>
			<Show
				when={view()}
				fallback={
					<p
						style={{
							padding: "1rem",
							background: "var(--danger-light)",
							height: "100%",
						}}>
						No such Standalone View: <br />
						<br />
						<strong>
							&nbsp;&nbsp;<code>{props.id}</code>
						</strong>
					</p>
				}>
				<ViewErrorBoundary view={view()}>
					<Shadows class="view-shadow-root">
						{shadowProps => {
							createRenderEffect(() => {
								if (view()!.styles) {
									shadowProps.setViewStyles(view()!.styles!)
								}
							})

							return (
								<Dynamic
									component={view()!.render}
									ref={ref}
									onMount={(fn: () => void) => onMount(fn)}
									onCleanup={fn => onCleanup(fn)}
									registerKeybinding={(
										key: string,
										action: (event: KeyboardEvent) => void,
									) => onCleanup(useHotkeys(key, action))}
									shadow={shadowProps.shadow()}
								/>
							) as HTMLElement
						}}
					</Shadows>
				</ViewErrorBoundary>
			</Show>
		</Suspense>
	)
}
