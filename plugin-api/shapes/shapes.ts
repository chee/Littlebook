// todo either this file doesn't belong here, or more things do. maybe this is
// better the @littlebook/plugin-api or something
// haha what about @littlebook/.well-known/
import * as v from "valibot"
import {automergeURL} from "./util.ts"

export const DOMFileShape = v.instance(File)
export type DOMFileShape = v.InferOutput<typeof DOMFileShape>

export const BlobShape = v.blob()
export type BlobShape = v.InferOutput<typeof BlobShape>

export const TextShape = v.object({text: v.string()})
export type TextShape = v.InferOutput<typeof TextShape>

export const CodeShape = v.object({
	text: v.string(),
	language: v.optional(v.string()),
})

export type CodeShape = v.InferOutput<typeof CodeShape>

export const MarkdownShape = v.object({
	text: v.string(),
	language: v.literal("markdown"),
})

export type MarkdownShape = v.InferOutput<typeof MarkdownShape>

export const JavaScriptEditorShape = v.object({
	text: v.string(),
	language: v.literal("javascript"),
	editorURL: v.optional(automergeURL),
})

export type JavaScriptEditorShape = v.InferOutput<typeof JavaScriptEditorShape>

export const TypeScriptEditorShape = v.object({
	text: v.string(),
	language: v.literal("typescript"),
	editorURL: v.optional(automergeURL),
})

export type TypeScriptEditorShape = v.InferOutput<typeof TypeScriptEditorShape>

export const FolderShape = v.object({
	files: v.array(automergeURL),
})

export type FolderShape = v.InferOutput<typeof FolderShape>
