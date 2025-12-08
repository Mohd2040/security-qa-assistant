# ========= Base image =========
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# ========= Dependencies (node_modules) =========
FROM base AS deps
# لو تستخدم npm:
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# لو تستخدم yarn بدلاً من npm:
# COPY package.json yarn.lock ./
# RUN yarn install --production

# ========= Build stage =========
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ========= Runner stage =========
FROM base AS runner
WORKDIR /app

ENV PORT=3000
EXPOSE 3000

# ننسخ فقط ما يحتاجه السيرفر
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

CMD ["npm", "start"]
