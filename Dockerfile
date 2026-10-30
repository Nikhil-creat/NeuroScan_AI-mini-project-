# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
# Docker deployment serves the API under /api through nginx
ARG VITE_API_URL=same-origin
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- runtime stage (non-root nginx) ----
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK CMD wget -qO- http://localhost:8080/ >/dev/null || exit 1
