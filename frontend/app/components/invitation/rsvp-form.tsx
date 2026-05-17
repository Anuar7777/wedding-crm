'use client'

import { FormEvent, useState } from 'react'
import { createGuestFromInvitation, type EventType } from '@/lib/guests-api'

type AttendanceOption = 'alone' | 'partner' | 'not-attending'

const statusMap = {
	alone: 'ATTENDING',
	partner: 'ATTENDING_WITH_SPOUSE',
	'not-attending': 'DECLINED',
} as const

type RSVPFormProps = {
	eventType?: EventType
	submitButtonClassName?: string
}

export function RSVPForm({
	eventType = 'BRIDE_FAREWELL',
	submitButtonClassName = 'ui-button ui-button-primary ui-interactive ui-focus w-full py-4 disabled:cursor-not-allowed disabled:opacity-60',
}: RSVPFormProps) {
	const [name, setName] = useState('')
	const [partnerFullName, setPartnerFullName] = useState('')
	const [attendance, setAttendance] = useState<AttendanceOption | ''>('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [successMessage, setSuccessMessage] = useState('')
	const [errorMessage, setErrorMessage] = useState('')

	const isPartnerRequired = attendance === 'partner'
	const isFormValid =
		name.trim().length > 0 &&
		attendance.length > 0 &&
		(!isPartnerRequired || partnerFullName.trim().length > 0)

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setSuccessMessage('')
		setErrorMessage('')

		if (!attendance) {
			setErrorMessage('Қатысу түрін таңдаңыз.')
			return
		}

		const status = statusMap[attendance]
		if (status === 'ATTENDING_WITH_SPOUSE' && !partnerFullName.trim()) {
			setErrorMessage('Жұбыңыздың аты-жөнін енгізіңіз.')
			return
		}

		try {
			setIsSubmitting(true)
			await createGuestFromInvitation({
				fullName: name.trim(),
				type: eventType,
				status,
				partnerFullName: status === 'ATTENDING_WITH_SPOUSE' ? partnerFullName.trim() : undefined,
			})
			setSuccessMessage('Рахмет! Жауабыңыз сәтті жіберілді.')
			setName('')
			setPartnerFullName('')
			setAttendance('')
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Форманы жіберу мүмкін болмады.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
			<div className="flex flex-col gap-1.25">
				<input
					type="text"
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder="Аты-жөніңіз"
					className="ui-input ui-focus w-full px-6 py-4 text-sm sm:text-base"
					required
					disabled={isSubmitting}
				/>

				{isPartnerRequired ? (
					<input
						type="text"
						value={partnerFullName}
						onChange={(event) => setPartnerFullName(event.target.value)}
						placeholder="Жұбыңыздың аты-жөні"
						className="ui-input ui-focus w-full px-6 py-4 text-sm sm:text-base"
						required
						disabled={isSubmitting}
					/>
				) : null}
			</div>

			<div className="space-y-3">
				<RadioOption
					value="alone"
					checked={attendance === 'alone'}
					onChange={setAttendance}
					disabled={isSubmitting}
					label="Жалғыз келемін"
				/>
				<RadioOption
					value="partner"
					checked={attendance === 'partner'}
					onChange={setAttendance}
					disabled={isSubmitting}
					label="Жұбыммен келемін"
				/>
				<RadioOption
					value="not-attending"
					checked={attendance === 'not-attending'}
					onChange={setAttendance}
					disabled={isSubmitting}
					label="Өкінішке орай, келе алмаймын"
				/>
			</div>

			{errorMessage ? (
				<p className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
					{errorMessage}
				</p>
			) : null}
			{successMessage ? (
				<p className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
					{successMessage}
				</p>
			) : null}

			<button
				type="submit"
				className={submitButtonClassName}
				disabled={!isFormValid || isSubmitting}
			>
				{isSubmitting ? 'Жіберілуде...' : 'Растау'}
			</button>
		</form>
	)
}

type RadioOptionProps = {
	value: AttendanceOption
	checked: boolean
	disabled: boolean
	label: string
	onChange: (value: AttendanceOption) => void
}

function RadioOption({ value, checked, disabled, label, onChange }: RadioOptionProps) {
	return (
		<label className="ui-card ui-interactive flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4">
			<input
				type="radio"
				name="attendance"
				value={value}
				checked={checked}
				onChange={() => onChange(value)}
				className="h-5 w-5 accent-accent"
				disabled={disabled}
			/>
			<span className="text-sm sm:text-base">{label}</span>
		</label>
	)
}
