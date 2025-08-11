export type ContentShape = {[key: string]: ContentValue}

export type ContentValue =
	| ContentScalar
	| Array<ContentValue>
	| {[key: string]: ContentValue}

// todo i guess i'm disallowing the use of Counter or ImmutableString by doing
// this
// i've vaguely decided that automerge-specific types shouldn't be part of
// @littlebook's public API, though i guess the repo is haha
// todo yeah so we're going to be explicit that these are AUTOMERGE contents
// because there will be other file types now (opfs, filesystem, whatever)
// so it will be OK to surface Counter and ImmutableString
export type ContentScalar = string | number | boolean | null | Date | Uint8Array
