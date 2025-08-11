import * as z from "zod"

export const LooseTldrawShape = z.object({
	store: z.record(z.string(), z.any()),
	schema: z.record(z.string(), z.any()),
})

export type LooseTldrawShape = z.infer<typeof LooseTldrawShape>
