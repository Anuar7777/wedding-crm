import type { Metadata } from 'next'
import {
	Bad_Script,
	Cormorant_Garamond,
	Geist_Mono,
	Great_Vibes,
	Noto_Sans,
} from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

const notoSans = Noto_Sans({
	variable: '--font-noto-sans',
	subsets: ['cyrillic', 'latin'],
	weight: ['400', '500', '600'],
})

const cormorant = Cormorant_Garamond({
	variable: '--font-cormorant',
	subsets: ['cyrillic', 'latin'],
	weight: ['400', '600', '700'],
})

const badScript = Bad_Script({
	variable: '--font-bad-script',
	subsets: ['cyrillic', 'latin'],
	weight: ['400'],
})

const greatVibes = Great_Vibes({
	variable: '--font-great-vibes',
	subsets: ['latin'],
	weight: ['400'],
})

export const metadata: Metadata = {
	title: 'Wedding CRM',
	description: 'Той & Қыз ұзату тойын басқару жүйесі.',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang="kk-KZ"
			className={`${notoSans.variable} ${geistMono.variable} ${cormorant.variable} ${badScript.variable} ${greatVibes.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
