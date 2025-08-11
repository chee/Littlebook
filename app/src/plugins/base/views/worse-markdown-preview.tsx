import {createResource, createSignal, type JSX} from "solid-js"
import type {AutomergeDocumentReadonlyView, ViewID} from ":/types/view"
import {MarkdownShape} from ":/shapes/shapes"
import rehypeReact from "rehype-react"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import gfm from "remark-gfm"
import {unified, type Processor} from "unified"
import {Fragment, jsx, jsxs} from "solid-js/h/jsx-runtime"
import remarkFrontmatter from "remark-frontmatter"
import {matter} from "vfile-matter"
import type {Node} from "unist"
import type {VFile} from "vfile"
import type {Root as MdastRoot} from "mdast"
import type {Root as HastRoot} from "hast"
import rehypeRaw from "rehype-raw"

/**
 * Parse YAML frontmatter and expose it at `file.data.matter`.
 *
 * @returns
 *   Transform.
 */
function extractFrontmatter() {
	return function (_tree: Node, file: VFile) {
		matter(file)
	}
}

const markdown: Processor<MdastRoot, HastRoot, HastRoot> = unified()
	.use(gfm)
	.use(remarkParse)
	.use(remarkFrontmatter)
	.use(extractFrontmatter)
	.use(remarkRehype, {allowDangerousHtml: true})
	.use(rehypeRaw)
	.use(rehypeReact, {
		Fragment,
		jsx,
		jsxs,
		elementAttributeNameCase: "html",
		stylePropertyNameCase: "css",
	})

export default {
	category: "readonly",
	displayName: "html preview",
	id: "@littlebook/mdpreview" as ViewID,
	schema: MarkdownShape,
	styles: [import("./worse.css?inline")],
	render(props) {
		// eslint-disable-next-line solid/reactivity
		const [text, updateText] = createSignal(props.doc().text)
		// eslint-disable-next-line solid/reactivity
		props.onChange(() => updateText(props.doc().text))

		const [html] = createResource(text, async text => {
			const md = await markdown.process(text)
			// @ts-expect-error shhhhh
			const title = md.data?.matter?.title
			if (title) {
				return (
					<>
						<h1>{title}</h1>
						{md.result}
					</>
				)
			}
			return md.result as JSX.Element
		})

		return (
			<markdown-preview>
				<div class="markdown-body">
					<div class="markdown-content">{html.latest}</div>
				</div>
			</markdown-preview>
		) as HTMLElement
	},
} satisfies AutomergeDocumentReadonlyView<MarkdownShape>

declare module "solid-js" {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace JSX {
		interface IntrinsicElements {
			"markdown-preview": JSX.IntrinsicElements["div"]
		}
	}
}
