import {ContextMenu} from "@kobalte/core/context-menu"
import {Button} from "@kobalte/core/button"
import {createEffect, Suspense} from "solid-js"
import {
	normalizeStandaloneViewID,
	type StandaloneView,
	type StandaloneViewID,
} from ":/types/view.ts"

// todo StandaloneViewID type
export default function StandaloneViewTab(props: {id: StandaloneViewID}) {
	return "tab"
	const id = () => normalizeStandaloneViewID(props.id)
	const view = () => self.littlebook.views[id()]
	let tabElement!: HTMLDivElement

	createEffect(
		() =>
			self.lb.dock.activePanelID == props.id && tabElement.scrollIntoView(),
	)
	// todo extract shared stuff with dock-tab

	return (
		<Suspense>
			<ContextMenu>
				<ContextMenu.Trigger class="dock-tab__context-menu-trigger">
					<div class="dock-tab" ref={tabElement}>
						<div class="dock-tab__icon">{view()?.icon ?? "🖼️"}</div>

						<div class="dock-tab__name">{view()?.displayName}</div>

						<Button
							class="dock-tab__close"
							aria-label={`close panel ${view()?.displayName}`}
							onmousedown={(event: MouseEvent) => {
								event.stopImmediatePropagation()
								event.stopPropagation()
								event.preventDefault()
							}}
							onclick={() => self.lb.dock.closePanel(props.id)}>
							<svg
								class="x"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round">
								<path d="M18 6L6 18" />
								<path d="M6 6l12 12" />
							</svg>
						</Button>
					</div>
				</ContextMenu.Trigger>
				<ContextMenu.Portal>
					<ContextMenu.Content class="popmenu__content">
						<ContextMenu.Item
							class="popmenu__item"
							onSelect={() => self.lb.dock.closePanel(props.id)}>
							close tab
						</ContextMenu.Item>
						<ContextMenu.Item
							class="popmenu__item"
							onSelect={() => {
								for (const id of self.lb.dock.panelIDs)
									if (id != props.id) self.lb.dock.closePanel(id)
							}}>
							close other tabs
						</ContextMenu.Item>
					</ContextMenu.Content>
				</ContextMenu.Portal>
			</ContextMenu>
		</Suspense>
	) as HTMLElement
}
