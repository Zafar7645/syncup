# Build from the monorepo root: docker build -f apps/frontend/Dockerfile .
FROM node:22-alpine AS build
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci

COPY libs ./libs
COPY apps/frontend ./apps/frontend
RUN npm run build --workspace=frontend

FROM nginx:1.27-alpine AS runtime
COPY apps/frontend/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /repo/apps/frontend/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80
