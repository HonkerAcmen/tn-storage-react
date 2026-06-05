# ---------- build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_API_URL=/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_AVATAR_CHUNK_SIZE=524288
ENV NEXT_PUBLIC_AVATAR_CHUNK_SIZE=$NEXT_PUBLIC_AVATAR_CHUNK_SIZE

ARG NEXT_PUBLIC_UPLOAD_TIMEOUT_MS=300000
ENV NEXT_PUBLIC_UPLOAD_TIMEOUT_MS=$NEXT_PUBLIC_UPLOAD_TIMEOUT_MS

RUN pnpm build

# ---------- runtime stage ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
