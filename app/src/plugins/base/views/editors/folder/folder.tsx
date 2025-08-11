import {FolderShape} from ":/shapes/shapes"
import type {AutomergeDocumentEditorView, ViewID} from ":/types/view"
import DocumentTree from ":/plugins/base/views/editors/folder/tree.tsx"
import {makeDocumentProjection} from "solid-automerge"
import type {DocHandle} from "@automerge/vanillajs"
import {createEffect, createSignal, Show} from "solid-js"
import {dropTargetForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import usePerfectRepo from ":/lib/sync/useRepo.ts"
import {
	asAutomergeURL,
	isValidAutomergeURL,
	type AutomergeURL,
} from ":/core/sync/url.ts"
import reparent from ":/domain/reparent.ts"
import {IconPicker} from ":/ui/components/emoji-picker/emoji-picker.tsx"

function getExpandedKey(handle: DocHandle<FolderShape>): string {
	return `littlebook:${handle.url}:expanded`
}

function getExpandedFromStorage(
	handle: DocHandle<FolderShape>,
): boolean | undefined {
	const stored = localStorage.getItem(getExpandedKey(handle))
	if (stored) {
		return JSON.parse(stored) as boolean
	}
	return undefined
}

function setExpandedInStorage(
	handle: DocHandle<FolderShape>,
	expanded: boolean,
) {
	localStorage.setItem(getExpandedKey(handle), String(expanded))
}

// todo maybe a FileEntryEditor is another type?
// or editors always get the fileEntryHandle as a prop too

export default {
	id: "app.littlebook.views.folder" as ViewID,
	kind: "automerge",
	category: "editor",
	styles: [import("./tree.css?inline")],
	schema: FolderShape,
	render(api) {
		const folder = makeDocumentProjection<FolderShape>(api.handle)
		const [expanded, setExpanded] = createSignal<boolean | undefined>()

		createEffect(() => {
			const stored = getExpandedFromStorage(api.handle)

			if (stored != null && stored != expanded()) {
				if (expanded() == null) {
					setExpanded(stored)
				} else {
					setExpandedInStorage(api.handle, expanded() as boolean)
				}
			}
		})
		return (
			<div data-url={api.handle.url} class="sidebar-widget">
				{/* todo this needs the entryHandle
				<header
					class="sidebar-widget__header"
					ref={element => {
						dropTargetForElements({
							element,
							onDragEnter() {
								element.dataset.droptarget = "true"
							},
							onDragLeave() {
								delete element.dataset.droptarget
							},
							// todo extract to a dropFileOnFolder functions
							async onDrop(event) {
								delete element.dataset.droptarget
								element.dataset.droptarget = "false"
								const repo = usePerfectRepo()
								const lastParentHandle = await repo.find<FolderShape>(
									event.source.data.parentURL as AutomergeURL,
								)
								if (isValidAutomergeURL(event.source.data.url)) {
									const url = asAutomergeURL(event.source.data.url)
									reparent(url, lastParentHandle, api.handle)
								}
							},
						})
					}}>

					<div class="sidebar-widget__header-icon">
						<IconPicker
							handle={api.handle}
							fallback="🏡"
							modifiers="area-title page-title"
						/>
					</div>
					<span class="sidebar-widget__header-title">
						<Show
							when={props.handle?.url != user()?.home}
							fallback={area()?.name}>
							<ContextMenu>
								<ContextMenu.Trigger class="popmenu__trigger">
									{area()?.name}
								</ContextMenu.Trigger>
								<ContextMenu.Portal>
									<ContextMenu.Content class="popmenu">
										<ContextMenu.Item
											class="popmenu__item"
											onSelect={() => {
												userHandle()?.change(doc => {
													const index = doc.areas.findIndex(
														url => url == props.handle?.url,
													)
													if (index !== -1) {
														doc.areas.splice(index, 1)
													}
												})
												homeHandle()?.change(doc => {
													doc.files.push(
														createFileEntry({
															icon: area()?.icon,
															name: area()?.name,
															url: props.handle
																.url as FileContentURL,
														}),
													)
												})
											}}>
											Unpin
										</ContextMenu.Item>
										<ContextMenu.Item
											class="popmenu__item"
											onSelect={() => {
												// todo this should all be in the model
												const name = window.prompt(
													"Rename area",
													area()?.name,
												)
												if (name) {
													props.handle.change(doc => {
														doc.name = name
													})
												}
											}}>
											Rename
										</ContextMenu.Item>
										<ContextMenu.Item class="popmenu__item">
											Delete
										</ContextMenu.Item>
									</ContextMenu.Content>
								</ContextMenu.Portal>
							</ContextMenu>
						</Show>
					</span>
					<div class="sidebar-widget__header-actions">
						<button
							class="document-list-item__expander"
							onClick={event => {
								event.stopPropagation()
								setExpanded(ex => !ex)
							}}>
							<Show
								when={expanded()}
								fallback={<Icon name="alt-arrow-right-bold" />}>
								<Icon name="alt-arrow-down-bold" />
							</Show>
						</button>
					</div>
				</header>
				*/}
				<div class="sidebar-widget__content">
					<Show when={expanded() && folder.files} fallback="">
						<div role="tree">
							<DocumentTree
								urls={folder.files}
								depth={0}
								parent={api.handle}
							/>
						</div>
					</Show>
				</div>
			</div>
		) as HTMLElement
	},
} satisfies AutomergeDocumentEditorView<FolderShape>
