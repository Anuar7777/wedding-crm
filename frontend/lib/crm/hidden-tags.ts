/** Matches backend `DUPLICATE_GUEST_TAG_NAME` — hidden only on CRM «Теги» page. */
const HIDDEN_DUPLICATE_TAG_NAME = 'Дубликаты'

function isHiddenDuplicateTagName(name: string): boolean {
	return name === HIDDEN_DUPLICATE_TAG_NAME
}

export function visibleTags<T extends { name: string }>(tags: T[]): T[] {
	return tags.filter((t) => !isHiddenDuplicateTagName(t.name))
}
