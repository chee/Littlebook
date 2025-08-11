// todo this is, like, a viewmodel or something?
import {createMemo} from "solid-js"
import {useDocument} from "solid-automerge"
import type {FileEntryDoc, FileEntryURL} from ":/docs/file-entry-doc.ts"
import {useUserDocContext} from ":/domain/user/user.ts"
import {
	parseDocumentURL,
	type AutomergeURLOrDocumentURL,
} from ":/core/sync/url.ts"
import type {View} from ":/types/view"
import defaultRepo from ":/core/sync/automerge.ts"

// todo usePerfectIcon that starts with entry, then editor,
// then defaults to a document icon
export function usePerfectView<Schema = unknown>(
	url: () => AutomergeURLOrDocumentURL,
	viewer?: () => string | undefined,
) {
	const docinfo = createMemo(() => parseDocumentURL(url()))
	// const user = useUserDocContext()
	const [entry] = useDocument<FileEntryDoc>(() => docinfo().url, {
		repo: defaultRepo,
	})
	const [file] = useDocument<Schema>(() => entry()?.url, {repo: defaultRepo})

	const views = () => file() && self.lb.getViews(file()!)
	const view = (): View<Schema> | undefined => {
		const url = docinfo().url as FileEntryURL
		// const associations = user()?.associations
		// const association = associations?.[url]
		const firstView = () => views()?.[0]
		const chosenID = viewer?.() ?? docinfo().viewer
		const chosen = () => chosenID && self.lb.views[chosenID]
		// const associated = () => association && self.lb.views[association]

		return (chosen() || firstView()) as View<Schema>
	}
	return view
}
