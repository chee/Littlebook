import {Show, For} from "solid-js"
import {ContextMenu} from "@kobalte/core"
import Icon from "../components/icons/icon.tsx"
import type {OpenDocumentOptions} from "./dock-api.ts"
import {renderDocumentURL, type DocumentURL} from ":/core/sync/url.ts"
import type {FileEntry} from ":/domain/entry/file-entry.ts"

export default function OpenWithContextMenu(props: {
	entry: FileEntry
	file: unknown
	currentEditorID?: string
	openDocument: (url: DocumentURL, opts: OpenDocumentOptions) => void
}) {
	const views = () => self.littlebook.getViews(props.file)

	return (
		<Show when={views().length > 1}>
			<ContextMenu.Sub overlap gutter={-10}>
				<ContextMenu.SubTrigger class="popmenu__sub-trigger">
					Open with
					<div class="popmenu__item-right-slot">
						<Icon name="alt-arrow-right-linear" />
					</div>
				</ContextMenu.SubTrigger>

				<ContextMenu.Portal>
					<ContextMenu.SubContent class="popmenu__content popmenu__sub-content">
						<For each={views()}>
							{choice => (
								<ContextMenu.Item
									onSelect={() => {
										const url = renderDocumentURL({
											url: props.entry.url,
											viewer: choice.id,
										})
										props.openDocument(url, {side: "right"})
									}}
									disabled={choice.id == props.currentEditorID}
									class="popmenu__item">
									<Show when={choice.id == props.currentEditorID}>
										<div class="popmenu__item-indicator">
											<Icon name="check-square-bold" />
										</div>
									</Show>
									{choice.displayName ?? choice.id}
								</ContextMenu.Item>
							)}
						</For>
					</ContextMenu.SubContent>
				</ContextMenu.Portal>
			</ContextMenu.Sub>
		</Show>
	)
}
