/** Matches backend `DUPLICATE_GUEST_TAG_NAME` — hidden only on CRM «Теги» page. */
export const HIDDEN_DUPLICATE_TAG_NAME = 'Дубликаты'

export function isHiddenDuplicateTagName(name: string): boolean {
	return name === HIDDEN_DUPLICATE_TAG_NAME
}

export function visibleTags<T extends { name: string }>(tags: T[]): T[] {
	return tags.filter((t) => !isHiddenDuplicateTagName(t.name))
}
