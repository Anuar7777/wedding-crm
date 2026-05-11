import { DUPLICATE_LEVENSHTEIN_THRESHOLD } from './guests.constants'

export function normalizePersonName(s: string | null | undefined): string {
	if (!s?.trim()) return ''
	return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function levenshtein(a: string, b: string): number {
	const m = a.length
	const n = b.length
	if (m === 0) return n
	if (n === 0) return m
	const row = new Array<number>(n + 1)
	for (let j = 0; j <= n; j++) row[j] = j
	for (let i = 1; i <= m; i++) {
		let prev = row[0]
		row[0] = i
		for (let j = 1; j <= n; j++) {
			const tmp = row[j]
			const cost = a[i - 1] === b[j - 1] ? 0 : 1
			row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost)
			prev = tmp
		}
	}
	return row[n]
}

export function namesSimilar(
	a: string,
	b: string,
	threshold = DUPLICATE_LEVENSHTEIN_THRESHOLD
): boolean {
	const na = normalizePersonName(a)
	const nb = normalizePersonName(b)
	if (!na || !nb) return false
	if (na === nb) return true
	return levenshtein(na, nb) <= threshold
}
