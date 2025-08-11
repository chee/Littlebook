import {createDockview} from "dockview-core"
import {type Component, Show, createRoot} from "solid-js"
import "./dockview.css"
import "./dock.css"
import {createDockAPI} from "./dock-api.ts"
import {Dynamic} from "solid-js/web"
import type {DocumentURL} from ":/core/sync/url.ts"

export interface DockComponentProps {
	// the id of the file to open
	id: DocumentURL
	dockAPI: DockAPI
}

export interface DockHeaderActionProps {
	groupID: string
	dockAPI: DockAPI
}

export function createDockContext(dockOptions: {
	components: Record<string, Component<DockComponentProps>>
	tabComponents?: Record<string, Component<DockComponentProps>>
	rightHeaderActionComponent?: Component<DockHeaderActionProps>
	watermarkComponent?: Component
}) {
	const element = (<div style={{display: "contents"}} />) as HTMLDivElement

	const dockview = createDockview(element, {
		createComponent(options) {
			const component = () => dockOptions.components[options.name]
			if (!component()) {
				console.error(`no such panel component ${options.name}`)
			}

			const element = (
				<div style={{display: "contents"}}>
					<Show when={component()}>
						<Dynamic
							component={component()}
							id={options.id as DocumentURL}
							dockAPI={api}
						/>
					</Show>
				</div>
			) as HTMLElement
			return {
				element,
				init() {},
			}
		},
		createTabComponent(options) {
			const component = () => dockOptions.tabComponents?.[options.name]

			if (!component()) {
				console.error(`no such tab component ${options.name}`)
			}

			const element = (
				<div class="ui">
					<Show when={component()}>
						<Dynamic
							component={component()}
							id={options.id as DocumentURL}
							dockAPI={api}
						/>
					</Show>
				</div>
			) as HTMLElement
			return {
				element,
				init() {},
			}
		},
		createRightHeaderActionComponent(options) {
			const component = () => dockOptions.rightHeaderActionComponent
			const element = (
				<div class="ui">
					<Show when={component()}>
						<Dynamic
							component={component()}
							groupID={options.id}
							dockAPI={api}
						/>
					</Show>
				</div>
			) as HTMLElement
			return {
				element,
				init() {},
				dispose() {},
			}
		},
		createWatermarkComponent() {
			const component = () => dockOptions.watermarkComponent ?? "div"

			const element = createRoot(() => (
				<div style={{display: "contents"}}>
					<Show when={component()}>
						<Dynamic component={component()} />
					</Show>
				</div>
			)) as HTMLElement
			return {
				element,
				init() {},
				dispose() {},
			}
		},
	})

	const api = createDockAPI(dockview)
	return [element, api] as const
}

export type DockAPI = ReturnType<typeof createDockAPI>
