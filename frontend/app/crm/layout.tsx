import { IBM_Plex_Sans } from 'next/font/google'
import { CrmShell } from './crm-shell'

const crmSans = IBM_Plex_Sans({
	subsets: ['latin', 'cyrillic'],
	weight: ['400', '500', '600'],
	variable: '--font-crm-sans',
	display: 'swap',
})

export default function CrmLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className={`${crmSans.variable} min-h-0`}>
			<CrmShell>{children}</CrmShell>
		</div>
	)
}
