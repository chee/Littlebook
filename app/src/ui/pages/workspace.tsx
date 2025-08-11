import "./workspace.css"
import Resizable, {
	type ContextValue as ResizableContext,
} from "@corvu/resizable"
import {
	createSignal,
	getOwner,
	onCleanup,
	onMount,
	runWithOwner,
} from "solid-js"
import type {SerializedDockview} from "dockview-core"
import {asDocumentURL, isValidDocumentURL} from ":/core/sync/url.ts"
import Sidebar from ":/ui/components/sidebar/sidebar"
import bemby from "@chee/bemby"

import {createMediaQuery} from "@solid-primitives/media"
import type {StandaloneViewID} from ":/types/view"
import {makePersisted} from "@solid-primitives/storage"
import {useHotkeys} from ":/ui/lib/useHotkeys.ts"
const isMobile = createMediaQuery("(max-width: 600px)")

import {DropdownMenu} from "@kobalte/core/dropdown-menu"
import DocumentDockTab from ":/ui/dock/components/document-tab"
import Icon from ":/ui/components/icons/icon.tsx"
import StandaloneViewTab from ":/ui/dock/components/standalone-tab"
import {createDockContext} from ":/ui/dock/dock.tsx"
import {createLittlebookAPI} from ":/littlebook.ts"
import LittlebookViewer from ":/ui/components/view/little-view"
import activateBasePlugin from ":/plugins/base/base-plugin.ts"

const [dock, dockAPI] = createDockContext({
	components: {
		document(props) {
			return <LittlebookViewer url={props.id} />
		},
		standalone(props) {
			return <LittlebookViewer id={props.id.split(":")[1]} />
		},
	},
	tabComponents: {
		document(props) {
			return <DocumentDockTab url={props.id} />
		},
		standalone(props) {
			return (
				<StandaloneViewTab id={props.id as string as StandaloneViewID} />
			)
		},
	},
	watermarkComponent: () => <div class="dock-watermark" />,
	rightHeaderActionComponent(props) {
		return (
			<div class="dock-header-actions ui">
				<DropdownMenu>
					<DropdownMenu.Trigger
						class="popmenu__trigger popmenu__trigger--dock-header  dock-header-actions__button"
						aria-label="more actions">
						<Icon name="menu-dots-bold" inline />
					</DropdownMenu.Trigger>
					<DropdownMenu.Portal>
						<DropdownMenu.Content class="popmenu__content">
							<DropdownMenu.Item
								class="popmenu__item"
								onSelect={() =>
									props.dockAPI.closeGroup(props.groupID)
								}>
								Close Group
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu>
			</div>
		)
	},
})

window.littlebook = createLittlebookAPI({dockAPI})
window.lb = window.littlebook

activateBasePlugin()

declare global {
	interface Window {
		littlebook: ReturnType<typeof createLittlebookAPI>
		lb: ReturnType<typeof createLittlebookAPI>
		log: ReturnType<typeof import("debug")>
	}
}

// todo switch workspace
export default function Workspace() {
	// todo a non-dockview workspace too? tldraw based maybe?
	const owner = getOwner()
	// todo <this is obviously in the wrong place, should be elsewhere. but where?
	// todo can go anywhere now because lb api is on window lol
	function onhash() {
		const hash = location.hash.slice(1)
		if (isValidDocumentURL(hash)) {
			if (window.littlebook.dock.activePanelID !== asDocumentURL(hash)) {
				runWithOwner(owner, () => {
					dockAPI.openDocument(hash)
				})
			}
		} else if (hash.startsWith("standalone:")) {
			if (!dockAPI.panelIDs.includes(hash as StandaloneViewID)) {
				runWithOwner(owner, () => {
					dockAPI.openStandaloneView(hash as StandaloneViewID)
				})
			}
		}
	}
	const loadhash = location.hash.slice(1)
	window.addEventListener("hashchange", onhash)
	onCleanup(() => {
		window.removeEventListener("hashchange", onhash)
	})
	dockAPI.onLayoutChange(() => {
		const layout: SerializedDockview = dockAPI.serializeLayout()
		localStorage.setItem("littlebook:dock", JSON.stringify(layout))
		const hash = dockAPI?.activePanelID
		if (hash) {
			location.hash = hash
		} else {
			location.hash = ""
		}
	})
	const mySerializedLayout = localStorage.getItem("littlebook:dock")
	if (mySerializedLayout) {
		try {
			const layout = JSON.parse(mySerializedLayout)
			dockAPI.loadLayout(layout)
		} catch {
			console.error("failed to load layout")
		}
	}
	if (isValidDocumentURL(loadhash)) {
		if (dockAPI.activePanelID !== loadhash) {
			dockAPI.openDocument(loadhash)
		}
	}
	// todo ok/>
	const [firstLoad, setFirstLoad] = createSignal(true)

	onMount(() => {
		if (isMobile()) {
			resizableContext()?.collapse(0)
		} else {
			const preferred = preferredSidebarSize()
			resizableContext()?.setSizes([preferred, 1 - preferred])
		}
		setTimeout(() => {
			setFirstLoad(false)
		})
	})

	const defaultSizes = [0.2, 0.8]
	const [sizes, setSizes] = makePersisted(
		// eslint-disable-next-line solid/reactivity
		createSignal<number[]>(defaultSizes),
		{
			name: "littlebook:layout",
		},
	)
	const [preferredSidebarSize, setPreferredSidebarSize] = makePersisted(
		// eslint-disable-next-line solid/reactivity
		createSignal(defaultSizes[0]),
	)

	const [sidebarElement, setSidebarElement] = createSignal<HTMLElement>()

	const [manuallyDragging, setManuallyResizing] = createSignal(false)

	const [resizableContext, setResizableContext] =
		createSignal<ResizableContext>()
	const sidebarIsCollapsed = () => resizableContext()?.sizes()[0] === 0

	const currentSidebarSize = () => {
		return resizableContext()?.sizes()[0]
	}

	function onSizesChange(sizes: number[]) {
		setSizes(sizes)
	}

	function onHandleDragStart() {
		setManuallyResizing(true)
	}

	function onHandleDragEnd() {
		setManuallyResizing(false)
		const current = currentSidebarSize()
		if (typeof current == "number" && current > 0) {
			const el = sidebarElement()
			if (el) {
				const rect = el.getBoundingClientRect()
				const width = rect.width
				if (width < 160) {
					collapseSidebar()
				} else {
					setPreferredSidebarSize(current)
				}
			}
		}
	}

	const expandSidebar = () => {
		const context = resizableContext()
		const preferred = preferredSidebarSize()
		if (preferred <= 0) {
			setPreferredSidebarSize(0.2)
		}

		context?.setSizes([preferred, 1 - preferred])
	}

	const collapseSidebar = () => {
		const context = resizableContext()
		setPreferredSidebarSize(currentSidebarSize() || 0.2)

		context?.collapse(0)
		context?.setSizes([0, 1])
	}

	const toggleSidebar = () => {
		if (sidebarIsCollapsed()) {
			expandSidebar()
		} else {
			collapseSidebar()
		}
	}

	useHotkeys("command+backslash", toggleSidebar)
	useHotkeys(
		"cmd+w",
		() => {
			if (dockAPI.activePanelID) dockAPI.closePanel(dockAPI.activePanelID)
		},
		{
			preventDefault() {
				return true
			},
		},
	)

	return (
		<Resizable
			sizes={sizes() ?? defaultSizes}
			onSizesChange={onSizesChange}
			class={bemby("workspace", {
				mobile: isMobile(),
				desktop: !isMobile(),
				"showing-sidebar": !sidebarIsCollapsed(),
				"not-showing-sidebar": sidebarIsCollapsed(),
				"first-load": firstLoad(),
				"manually-resizing": manuallyDragging(),
			})}>
			{() => {
				setResizableContext(Resizable.useContext())
				return (
					<>
						<Resizable.Panel
							as="aside"
							class="workspace__panel workspace__panel--sidebar"
							ref={element => setSidebarElement(element)}
							collapsible>
							<Sidebar />
						</Resizable.Panel>
						<Resizable.Handle
							class="workspace__handle"
							onHandleDragStart={onHandleDragStart}
							onHandleDragEnd={onHandleDragEnd}
							onDblClick={() => {
								if (sidebarIsCollapsed()) expandSidebar()
								else collapseSidebar()
							}}
						/>
						<Resizable.Panel class="workspace__panel workspace__panel--main">
							{dock}
						</Resizable.Panel>
						{/* <Resizable.Panel
							as="aside"
							class="workspace__panel workspace__panel--contextbar"
							ref={element => setSidebarElement(element)}
							collapsible>
							<ContextBar />
						</Resizable.Panel> */}
					</>
				)
			}}
		</Resizable>
	)
}

function ContextBar() {
	return "placeholder"
}
