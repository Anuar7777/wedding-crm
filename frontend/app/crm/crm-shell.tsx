'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
	Home,
	Users,
	Armchair,
	Tag,
	Mail,
	BarChart3,
	UserCog,
	Settings,
	Sparkles,
	Menu,
} from 'lucide-react'
import { apiJson, clearTokens, getAccessToken } from '@/lib/crm/api'
import type { EventType, MeResponse } from '@/lib/crm/types'
import {
	CrmEventProvider,
	CrmThemeProvider,
	useCrmEvent,
	useCrmTheme,
} from '@/lib/crm/event-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useClientMounted } from '@/lib/use-client-mounted'
import type { LucideIcon } from 'lucide-react'

type NavItem = { href: string; label: string; icon: LucideIcon }

const baseNav: NavItem[] = [
	{ href: '/crm/home', label: 'Главная', icon: Home },
	{ href: '/crm/guests', label: 'Гости', icon: Users },
	{ href: '/crm/tables', label: 'Столы', icon: Armchair },
	{ href: '/crm/tags', label: 'Теги', icon: Tag },
	{ href: '/crm/invitations', label: 'Приглашения', icon: Mail },
	{ href: '/crm/reports', label: 'Отчёты', icon: BarChart3 },
]

function EventSwitcher() {
	const { effectiveEventType, setSelectedEventType, canSwitchEvent } = useCrmEvent()
	const tabs: { id: EventType; label: string }[] = [
		{ id: 'BRIDE_FAREWELL', label: 'Қыз ұзату' },
		{ id: 'WEDDING', label: 'Той' },
	]
	const currentLabel = effectiveEventType === 'WEDDING' ? 'Той' : 'Қыз ұзату'

	if (!canSwitchEvent) {
		return (
			<div className="rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm font-medium text-foreground shadow-sm">
				Событие: {currentLabel}
			</div>
		)
	}

	return (
		<div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/80 p-1 shadow-sm">
			{tabs.map((t) => (
				<button
					key={t.id}
					type="button"
					onClick={() => setSelectedEventType(t.id)}
					className={cn(
						'cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-[transform,colors,box-shadow] duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100',
						effectiveEventType === t.id
							? 'bg-secondary text-foreground shadow-sm'
							: 'text-muted-foreground hover:bg-muted'
					)}
				>
					{t.label}
				</button>
			))}
		</div>
	)
}

function CrmSidebarContent({
	pathname,
	navItems,
	me,
	effectiveEventType,
}: {
	pathname: string
	navItems: NavItem[]
	me: MeResponse | null
	effectiveEventType: EventType
}) {
	return (
		<>
			<Link href="/crm/home" className="mb-8 flex items-center gap-2 px-2">
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
					<Sparkles className="h-5 w-5" />
				</div>
				<div>
					<p className="font-serif text-lg font-semibold leading-tight">Event CRM</p>
					<p className="text-xs text-muted-foreground">Қыз ұзату • Той</p>
				</div>
			</Link>
			<nav className="flex flex-1 flex-col gap-1">
				{navItems.map((item) => {
					const Icon = item.icon
					const hilite = pathname === item.href
					return (
						<Link
							key={`${item.href}-${item.label}`}
							href={item.href}
							className={cn(
								'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
								hilite ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
							)}
						>
							<Icon className="h-4 w-4 shrink-0" />
							{item.label}
						</Link>
					)
				})}
				<Separator className="my-2" />
				<Link
					href="/crm/settings"
					className={cn(
						'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
						pathname === '/crm/settings' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
					)}
				>
					<Settings className="h-4 w-4" />
					Настройки
				</Link>
			</nav>
			<div className="mt-auto rounded-lg border border-border bg-background/80 p-3 text-xs">
				<p className="font-medium">{me?.role === 'SUPERADMIN' ? 'Суперадмин' : 'Администратор'}</p>
				<p className="truncate text-muted-foreground">{me?.email}</p>
				<p className="mt-1 text-muted-foreground">
					Событие: {effectiveEventType === 'WEDDING' ? 'Той' : 'Қыз ұзату'}
				</p>
			</div>
		</>
	)
}

function CrmInner({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const { me, effectiveEventType } = useCrmEvent()
	const [navOpen, setNavOpen] = React.useState(false)
	const mobileNavId = React.useId()

	const navItems = React.useMemo(() => {
		const items = [...baseNav]
		if (me?.role === 'SUPERADMIN') {
			items.push({ href: '/crm/users', label: 'Пользователи', icon: UserCog })
		}
		return items
	}, [me?.role])

	React.useEffect(() => {
		const id = requestAnimationFrame(() => setNavOpen(false))
		return () => cancelAnimationFrame(id)
	}, [pathname])

	return (
		<div className="flex min-h-screen">
			<aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/90 p-4 backdrop-blur md:flex">
				<CrmSidebarContent
					pathname={pathname}
					navItems={navItems}
					me={me}
					effectiveEventType={effectiveEventType}
				/>
			</aside>

			<Sheet open={navOpen} onOpenChange={setNavOpen}>
				<SheetContent
					side="left"
					className="flex w-full flex-col overflow-y-auto sm:max-w-sm"
					id={mobileNavId}
				>
					<SheetHeader className="text-left">
						<SheetTitle>Меню</SheetTitle>
					</SheetHeader>
					<div className="flex min-h-0 flex-1 flex-col pt-2">
						<CrmSidebarContent
							pathname={pathname}
							navItems={navItems}
							me={me}
							effectiveEventType={effectiveEventType}
						/>
					</div>
				</SheetContent>
			</Sheet>

			<div className="flex min-h-screen flex-1 flex-col">
				<header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:px-6">
					<div className="flex min-w-0 flex-1 items-center gap-3 md:min-w-0 md:flex-initial">
						<Button
							variant="outline"
							size="icon"
							className="shrink-0 md:hidden"
							type="button"
							aria-label="Открыть меню"
							aria-expanded={navOpen}
							aria-controls={mobileNavId}
							onClick={() => setNavOpen(true)}
						>
							<Menu className="h-4 w-4" />
						</Button>
						<div className="min-w-0 flex-1 md:flex-initial">
							<EventSwitcher />
						</div>
					</div>
					<Button asChild className="shrink-0">
						<Link href="/crm/guests?create=1">
							<span className="sm:hidden">+</span>
							<span className="hidden sm:inline">+ Добавить гостя</span>
						</Link>
					</Button>
				</header>
				<main className="flex-1 p-4 md:p-6">{children}</main>
			</div>
		</div>
	)
}

function CrmAuthedLayout({ children }: { children: React.ReactNode }) {
	const { theme } = useCrmTheme()
	const router = useRouter()
	const ready = useClientMounted()

	const authed = !!getAccessToken()

	const meQuery = useQuery({
		queryKey: ['crm', 'me'],
		queryFn: () => apiJson<MeResponse>('/api/auth/me'),
		enabled: ready && authed,
		retry: false,
	})

	React.useEffect(() => {
		if (!ready) return
		if (!authed) {
			router.replace('/crm/login')
			return
		}
		if (meQuery.isError) {
			clearTokens()
			router.replace('/crm/login')
		}
	}, [ready, authed, meQuery.isError, router])

	React.useEffect(() => {
		if (!ready || !authed) return
		document.documentElement.dataset.crmTheme = theme
		return () => {
			delete document.documentElement.dataset.crmTheme
		}
	}, [ready, authed, theme])

	if (!ready || !authed || meQuery.isLoading || !meQuery.data) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
				Загрузка…
			</div>
		)
	}

	return (
		<div
			className="crm-root min-h-screen bg-background text-foreground"
			data-theme={theme === 'dark' ? 'dark' : 'light'}
		>
			<div className="linen-surface min-h-screen">
				<CrmEventProvider me={meQuery.data}>
					<CrmInner>{children}</CrmInner>
				</CrmEventProvider>
			</div>
		</div>
	)
}

export function CrmShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const isLogin = pathname === '/crm/login'

	return (
		<CrmThemeProvider>
			{isLogin ? (
				<div className="min-h-screen bg-background">{children}</div>
			) : (
				<CrmAuthedLayout>{children}</CrmAuthedLayout>
			)}
		</CrmThemeProvider>
	)
}
