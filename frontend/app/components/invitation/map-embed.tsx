type MapEmbedProps = {
	longitude: number
	latitude: number
	title: string
}

export function MapEmbed({ longitude, latitude, title }: MapEmbedProps) {
	const mapSrc = `https://yandex.ru/map-widget/v1/?ll=${longitude}%2C${latitude}&z=16&pt=${longitude},${latitude},pm2rdm`

	return (
		<div className="ui-card h-[280px] w-full overflow-hidden rounded-2xl border-2 shadow-lg sm:h-[360px] lg:h-[420px]">
			<iframe
				src={mapSrc}
				width="100%"
				height="100%"
				style={{ border: 0 }}
				allowFullScreen
				loading="lazy"
				title={title}
			/>
		</div>
	)
}
