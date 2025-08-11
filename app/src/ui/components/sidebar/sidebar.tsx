import "./sidebar.css"
import {For, Show} from "solid-js"
import {useUserDocContext} from ":/domain/user/user.ts"
import {useDocument} from "solid-automerge"
import {createFileEntry} from ":/docs/file-entry-doc.ts"
import {AreaDoc} from ":/docs/area-doc.ts"
import NewDocumentMenu from ":/ui/components/new-document-dropdown/new-document-dropdown.tsx"
import PreferencesIcon from ":/ui/icons/preferences.tsx"
import LittlebookViewer from ":/ui/components/view/little-view"

export default function Sidebar() {
	const user = useUserDocContext()
	const homeEntryURL = () => user()?.home
	const [, handle] = useDocument<AreaDoc>(homeEntryURL())

	const standalones = () =>
		Object.values(self.littlebook.views).filter(
			view => view.category === "standalone",
		)

	return (
		<aside class="sidebar sidebar--left ui">
			<header class="sidebar-header">
				<NewDocumentMenu
					create={template => {
						const url = createFileEntry(template)
						self.littlebook.dock.openDocument(url)
						handle()?.change(doc => {
							if (!doc.files.includes(url)) {
								doc.files.push(url)
							}
						})
					}}
				/>
			</header>
			<div class="sidebar-widgets">
				{/* todo pinned is a workspace concern, not a user concern */}
				<For each={user()?.pinned ?? []}>
					{url => (
						<div style={{width: "100%"}}>
							<little-view url={url} />
						</div>
					)}
				</For>

				<Show when={standalones().length}>
					<div class="sidebar-widget sidebar-widget--standalones">
						<header class="sidebar-widget__header">
							<span class="sidebar-widget__header-icon">🧿</span>
							<span class="sidebar-widget__header-title">
								Standalone views
							</span>
						</header>
						<div class="sidebar-widget__content">
							<For each={standalones()}>
								{view => (
									<button
										class="sidebar-widget__link"
										onClick={() => {
											self.littlebook.dock.openStandaloneView(
												view.id,
											)
										}}>
										<span>{view.icon || "💻"}</span>
										<span>{view.displayName ?? view.id}</span>
									</button>
								)}
							</For>
						</div>
					</div>
				</Show>
			</div>
			<footer class="sidebar-footer">
				<PreferencesIcon />
			</footer>
		</aside>
	)
}
