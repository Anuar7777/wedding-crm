FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN yarn install --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /app
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/yarn.lock ./yarn.lock
COPY --from=deps /app/backend/package.json ./backend/package.json
COPY --from=deps /app/frontend/package.json ./frontend/package.json
COPY backend ./backend
WORKDIR /app/backend
RUN yarn prisma generate && yarn build

FROM node:22-alpine AS runner
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN yarn install --frozen-lockfile --production
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/backend/prisma.config.ts ./backend/prisma.config.ts
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "yarn prisma migrate deploy && yarn prisma db seed && yarn start:prod"]
