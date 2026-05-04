import type { Metadata } from 'next'
import { Bad_Script, Cormorant_Garamond, Geist_Mono, Noto_Sans } from 'next/font/google'
import './globals.css'

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

export const metadata: Metadata = {
	title: 'Wedding CRM Frontend',
	description: 'Invitation and CRM frontend.',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang="kk-KZ"
			className={`${notoSans.variable} ${geistMono.variable} ${cormorant.variable} ${badScript.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	)
}
