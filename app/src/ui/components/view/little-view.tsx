import "./view.css"
import type {AutomergeURL, AutomergeURLOrDocumentURL} from ":/core/sync/url.ts"
import {AutomergeDocumentViewer} from ":/ui/components/view/automerge-doc/viewer"
import StandaloneViewer from ":/ui/components/view/standalone/standalone-viewer.tsx"
import bemby from "@chee/bemby"
import {Match, Show, Switch} from "solid-js"
import {customElement, noShadowDOM} from "solid-element"

import LittlebookViewerFooter from ":/ui/components/view/automerge-doc/footer"

type StandaloneProps = {id: string}
type AutomergeDocumentProps = {
	url: AutomergeURLOrDocumentURL
	viewer?: string
}
type Props = StandaloneProps | AutomergeDocumentProps

export default function LittlebookViewer(props: Props) {
	return (
		<div class={bemby("view")}>
			<little-view {...props} />
			<Show when={"url" in props && props.url}>
				<LittlebookViewerFooter
					url={(props as AutomergeDocumentProps).url}
				/>
			</Show>
		</div>
	)
}

declare module "solid-js" {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace JSX {
		interface IntrinsicElements {
			"little-view": Props
		}
	}
}

customElement(
	"little-view",
	{id: undefined, url: "" as AutomergeURLOrDocumentURL, viewer: undefined},
	(props: Props) => {
		noShadowDOM()
		return (
			<Switch>
				<Match when={"id" in props && props.id}>
					<StandaloneViewer id={(props as StandaloneProps).id} />
				</Match>
				<Match when={"url" in props && props.url}>
					<AutomergeDocumentViewer
						url={(props as AutomergeDocumentProps).url}
					/>
				</Match>
			</Switch>
		)
	},
)
