import brideFarewellJson from './configs/bride-farewell.json'
import weddingJson from './configs/wedding.json'
import { enrichInvitationEventConfig, parseInvitationEventConfig } from './load-config'

export { invitationImages, resolveHeroImage } from './assets'
export type { HeroImageKey } from './assets'
export type { FadeInMotionProps, InvitationEventConfig, InvitationEventConfigJson } from './types'
export { buildEventMetadata } from './build-metadata'
export { parseInvitationEventConfig, enrichInvitationEventConfig } from './load-config'

export const brideFarewellConfig = enrichInvitationEventConfig(
	parseInvitationEventConfig(brideFarewellJson)
)
export const weddingConfig = enrichInvitationEventConfig(parseInvitationEventConfig(weddingJson))
