# Build from the monorepo root: docker build -f apps/backend/Dockerfile .
FROM node:22-alpine AS build
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
RUN npm ci

COPY libs ./libs
COPY apps/backend ./apps/backend
RUN npm run build --workspace=backend

# Nest's webpack builder bundles dependencies and the shared libs into a single
# dist/main.js, so the runtime image needs nothing from node_modules.
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /repo/apps/backend/dist/main.js ./main.js
USER node
EXPOSE 3000
CMD ["node", "main.js"]
