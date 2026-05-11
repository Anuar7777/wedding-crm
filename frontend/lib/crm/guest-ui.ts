import type { GuestStatus } from '@/lib/crm/types'

const labels: Record<GuestStatus, string> = {
	PENDING: 'Ожидает',
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
		case 'PENDING':
			return 'warning'
		case 'DECLINED':
			return 'destructive'
		default:
			return 'secondary'
	}
}
