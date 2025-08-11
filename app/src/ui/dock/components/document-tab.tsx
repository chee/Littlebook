import {ContextMenu} from "@kobalte/core/context-menu"
import {Button} from "@kobalte/core/button"
import {createEffect, createMemo, getOwner, runWithOwner, Show} from "solid-js"
import OpenWithContextMenu from "../open-with.tsx"
import {
	parseDocumentURL,
	type AutomergeURL,
	type DocumentURL,
} from ":/core/sync/url.ts"
import {usePerfectView} from ":/ui/components/view/usePerfectView.tsx"
import type {FileEntryURL} from ":/docs/file-entry-doc.ts"
import {useFileEntry} from ":/domain/entry/file-entry.ts"
import {save} from "@automerge/automerge"
import {UserDoc} from ":/docs/user-doc.ts"

export default function DocumentDockTab(props: {url: DocumentURL}) {
	const docinfo = createMemo(() => parseDocumentURL(props.url as DocumentURL))
	const entry = useFileEntry(docinfo().url as FileEntryURL)

	const view = usePerfectView(() => props.url)

	let tabElement!: HTMLDivElement

	createEffect(() => {
		if (self.lb.dock.activePanelID == props.url) {
			tabElement.scrollIntoView()
		}
	})

	const content = () => entry()?.content

	const viewID = () => view()?.id

	const owner = getOwner()
	const openDocument = (
		url: DocumentURL,
		opts?: {side?: string; component?: string},
	) => runWithOwner(owner, () => self.lb.dock.openDocument(url, opts))

	return (
		<ContextMenu>
			<ContextMenu.Trigger class="dock-tab__context-menu-trigger">
				<div class="dock-tab" ref={tabElement}>
					<div class="dock-tab__icon">{entry()?.icon || "📄"}</div>

					<div class="dock-tab__name">{entry()?.name}</div>
					<Button
						class="dock-tab__close"
						aria-label={`close panel ${entry()?.name}`}
						onmousedown={(event: MouseEvent) => {
							event.stopImmediatePropagation()
							event.stopPropagation()
							event.preventDefault()
						}}
						onclick={() => {
							self.lb.dock.closePanel(props.url)
						}}>
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
						onSelect={() => self.lb.dock.closePanel(props.url)}>
						Close Tab
					</ContextMenu.Item>
					<ContextMenu.Item
						class="popmenu__item"
						onSelect={() => {
							for (const id of self.lb.dock.panelIDs) {
								if (id != props.url) self.lb.dock.closePanel(id)
							}
						}}>
						Close All Other Tabs
					</ContextMenu.Item>
					<ContextMenu.Separator />
					<ContextMenu.Item
						class="popmenu__item"
						onSelect={() => navigator.clipboard.writeText(props.url)}>
						Copy URL
					</ContextMenu.Item>
					<ContextMenu.Item
						class="popmenu__item"
						// eslint-disable-next-line solid/reactivity
						onSelect={async () => {
							const userHandle = await window.repo.find<UserDoc>(
								localStorage.getItem(
									"littlebook:user-id",
								) as AutomergeURL,
							)

							userHandle.change(user => {
								if (!user.pinned) {
									user.pinned = []
								}
								if (!user.pinned.includes(props.url)) {
									user.pinned.push(props.url)
								}
							})
						}}>
						Pin to Sidebar
					</ContextMenu.Item>

					<Show when={content() && entry()}>
						<OpenWithContextMenu
							entry={entry()!}
							file={content()}
							currentEditorID={viewID()}
							openDocument={(url, opts) => openDocument(url, opts)}
						/>
					</Show>
					<ContextMenu.Item
						class="popmenu__item"
						onSelect={() => {
							const file = new File(
								[save(entry()!.contentHandle!.doc())],
								`${entry()!.name}.automerge`,
							)
							const link = document.createElement("a")
							link.href = URL.createObjectURL(file)
							link.download = `${entry()!.name}.`
							link.click()
						}}>
						Save material
					</ContextMenu.Item>
					<ContextMenu.Item
						class="popmenu__item"
						onSelect={() => {
							const file = new File(
								[save(entry()!.contentHandle!.doc())],
								`${entry()!.name}.automerge`,
							)
							const link = document.createElement("a")
							link.href = URL.createObjectURL(file)
							link.download = `${entry()!.name}.automerge`
							link.click()
						}}>
						Save crdt
					</ContextMenu.Item>
					{/*
						todo bring back file menus in some way
						they are probably not part of a view, they are probably
						registerTask or registerCommand
						a command is an action. a task is a process? maybe?

						<Show when={entry() && file() && fileMenu()?.length}>
							<ContextMenu.Separator class="popmenu__separator" />
							<FileContextMenu
								items={fileMenu()!}
								entry={entry()!}
								file={file as Accessor<Doc<unknown>>}
								fileHandle={fileHandle()!}
							/>
						</Show> */}
				</ContextMenu.Content>
			</ContextMenu.Portal>
		</ContextMenu>
	) as HTMLElement
}
