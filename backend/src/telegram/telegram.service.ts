import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TelegramService {
	private readonly logger = new Logger(TelegramService.name)
	private readonly botToken: string

	constructor(
		private configService: ConfigService,
		private httpService: HttpService,
		private prisma: PrismaService
	) {
		this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN', '')
	}

	async notifyNewRsvp(guestName: string, status: string, eventType: string) {
		if (!this.botToken) {
			this.logger.warn('Telegram bot token not configured, skipping notification')
			return
		}

		const message =
			`📋 *Новый RSVP*\n\n` +
			`👤 Гость: ${this.escapeMarkdown(guestName)}\n` +
			`📌 Статус: ${status}\n` +
			`🎉 Событие: ${eventType}`

		const users = await this.prisma.user.findMany({
			where: { telegramChatId: { not: null } },
			select: { telegramChatId: true },
		})

		const sendPromises = users.map((user) => this.sendMessage(user.telegramChatId!, message))

		await Promise.allSettled(sendPromises)
	}

	private async sendMessage(chatId: string, text: string) {
		const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`

		try {
			await firstValueFrom(
				this.httpService.post(url, {
					chat_id: chatId,
					text,
					parse_mode: 'Markdown',
				})
			)
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			this.logger.error(`Failed to send Telegram message to ${chatId}: ${errorMessage}`)
		}
	}

	private escapeMarkdown(text: string): string {
		return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&')
	}
}
