'use client'

import {
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const SEATING_PIE_COLORS = ['#22c55e', '#eab308']
const STATUS_PIE_COLORS = ['#22c55e', '#3b82f6', '#ef4444']
const TAG_PIE_COLORS = ['#c4a574', '#7e9ab8', '#a890c8', '#e8b86d', '#8ab8a0']

type PiePoint = { name: string; value: number }

export function ReportsCharts({
	seatingPieData,
	statusPieData,
	lineData,
	tagPie,
	totalRecords,
	occPct,
	totalOcc,
	totalCap,
}: {
	seatingPieData: PiePoint[]
	statusPieData: PiePoint[]
	lineData: { date: string; confirmations: number }[]
	tagPie: PiePoint[]
	totalRecords?: number
	occPct: number
	totalOcc: number
	totalCap: number
}) {
	return (
		<div className="space-y-8">
			<div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="font-serif text-lg">Рассажка</CardTitle>
						<p className="text-xs text-muted-foreground">
							Ожидаемые гости (места): подтвердившие с ответом «да»; сумма сегментов = ожидаемое
							число гостей.
						</p>
					</CardHeader>
					<CardContent className="h-72">
						{seatingPieData.length === 0 ? (
							<p className="flex h-full items-center justify-center text-sm text-muted-foreground">
								Нет подтверждённых гостей для рассадки
							</p>
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={seatingPieData}
										dataKey="value"
										nameKey="name"
										innerRadius={50}
										outerRadius={80}
										paddingAngle={2}
									>
										{seatingPieData.map((entry, i) => (
											<Cell
												key={entry.name}
												fill={SEATING_PIE_COLORS[i % SEATING_PIE_COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="font-serif text-lg">Ответы в списке</CardTitle>
						<p className="text-xs text-muted-foreground">
							Записи в CRM по статусу (всего {totalRecords ?? '—'}).
						</p>
					</CardHeader>
					<CardContent className="h-72">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={statusPieData}
									dataKey="value"
									nameKey="name"
									innerRadius={50}
									outerRadius={80}
									paddingAngle={2}
								>
									{statusPieData.map((entry, i) => (
										<Cell key={entry.name} fill={STATUS_PIE_COLORS[i % STATUS_PIE_COLORS.length]} />
									))}
								</Pie>
								<Tooltip />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card className="lg:col-span-2 xl:col-span-1">
					<CardHeader>
						<CardTitle className="font-serif text-lg">Подтверждения по дням</CardTitle>
					</CardHeader>
					<CardContent className="h-72">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={lineData}>
								<XAxis dataKey="date" tick={{ fontSize: 10 }} />
								<YAxis allowDecimals={false} />
								<Tooltip />
								<Line
									type="monotone"
									dataKey="confirmations"
									name="Новые подтверждения"
									stroke="#22c55e"
									strokeWidth={2}
									dot={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="font-serif text-lg">По тегам</CardTitle>
					</CardHeader>
					<CardContent className="h-72">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie data={tagPie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
									{tagPie.map((entry, i) => (
										<Cell key={entry.name} fill={TAG_PIE_COLORS[i % TAG_PIE_COLORS.length]} />
									))}
								</Pie>
								<Tooltip />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="font-serif text-lg">Занятость столов</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<p className="text-3xl font-bold">{occPct}%</p>
						<p className="text-sm text-muted-foreground">
							{totalOcc} / {totalCap} мест
						</p>
						<div className="h-3 w-full overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-primary transition-all"
								style={{ width: `${occPct}%` }}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
