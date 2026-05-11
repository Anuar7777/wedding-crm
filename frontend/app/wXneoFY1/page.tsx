import { redirect } from 'next/navigation'

/** Legacy public URL for қыз ұзату invitation — CRM QR may still point here. */
export default function LegacyUzatuInviteRedirect() {
	redirect('/invitation')
}
