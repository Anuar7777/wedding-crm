export type GuestAttendanceStatus = 'ATTENDING' | 'ATTENDING_WITH_SPOUSE' | 'DECLINED'
export type EventType = 'BRIDE_FAREWELL' | 'WEDDING'

export type CreateGuestPayload = {
	fullName: string
	type: EventType
	status: GuestAttendanceStatus
	partnerFullName?: string
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

function getGuestsApiUrl(): string {
	if (!apiBaseUrl?.trim()) {
		throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured.')
	}

	return `${apiBaseUrl.replace(/\/$/, '')}/api/guests`
}

export async function createGuestFromInvitation(payload: CreateGuestPayload): Promise<void> {
	const response = await fetch(getGuestsApiUrl(), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	})

	if (response.ok) {
		return
	}

	let message = 'Failed to submit invitation response.'
	try {
		const body = (await response.json()) as { message?: string | string[] }
		if (Array.isArray(body.message)) {
			message = body.message.join(', ')
		} else if (body.message) {
			message = body.message
		}
	} catch {
		// Keep fallback message when backend does not return JSON.
	}

	throw new Error(message)
}
