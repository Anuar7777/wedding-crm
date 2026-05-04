FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN yarn install --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/yarn.lock ./yarn.lock
COPY --from=deps /app/backend/package.json ./backend/package.json
COPY --from=deps /app/frontend/package.json ./frontend/package.json
COPY frontend ./frontend
WORKDIR /app/frontend
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN yarn build

FROM node:22-alpine AS runner
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN yarn install --frozen-lockfile --production
WORKDIR /app/frontend
COPY --from=build /app/frontend/.next ./.next
COPY --from=build /app/frontend/public ./public
COPY --from=build /app/frontend/next.config.ts ./next.config.ts
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["yarn", "start"]
