import type { GuestEntity, GuestStatus } from '@/lib/crm/types'
import { guestStatusLabel } from '@/lib/crm/guest-ui'

export async function downloadGuestsExcel(guests: GuestEntity[], filename: string) {
	const ExcelJS = (await import('exceljs')).default
	const wb = new ExcelJS.Workbook()
	const ws = wb.addWorksheet('Гости')
	ws.columns = [
		{ header: 'ФИО', key: 'fullName', width: 28 },
		{ header: 'Статус', key: 'status', width: 18 },
		{ header: 'Пара', key: 'partner', width: 24 },
		{ header: 'Стол', key: 'table', width: 10 },
		{ header: 'Теги', key: 'tags', width: 32 },
		{ header: 'Создан', key: 'createdAt', width: 14 },
	]
	for (const g of guests) {
		ws.addRow({
			fullName: g.fullName,
			status: guestStatusLabel(g.status as GuestStatus),
			partner: g.partnerFullName ?? '',
			table: g.table ? String(g.table.number) : '',
			tags: g.tags.map((t) => t.name).join(', '),
			createdAt: new Date(g.createdAt).toLocaleDateString('ru-RU'),
		})
	}
	ws.getRow(1).font = { bold: true }
	const buf = await wb.xlsx.writeBuffer()
	const blob = new Blob([buf], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	})
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
}
