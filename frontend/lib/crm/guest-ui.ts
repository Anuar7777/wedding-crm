import type { GuestStatus } from '@/lib/crm/types'

const labels: Record<GuestStatus, string> = {
	ATTENDING: 'Подтвердил',
	ATTENDING_WITH_SPOUSE: 'С парой',
	DECLINED: 'Отказался',
}

export function guestStatusLabel(status: GuestStatus): string {
	return labels[status] ?? status
}

export function guestStatusBadgeVariant(
	status: GuestStatus
): 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'muted' {
	switch (status) {
		case 'ATTENDING':
		case 'ATTENDING_WITH_SPOUSE':
			return 'success'
		case 'DECLINED':
			return 'destructive'
		default:
			return 'secondary'
	}
}
