# ---- Build stage ----
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Backend URL is baked into the bundle at build time
ARG VITE_API_BASE_URL=http://localhost:5050/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# ---- Serve stage ----
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback so client-side routes resolve to index.html
RUN printf 'server {\n  listen 3000;\n  root /usr/share/nginx/html;\n  location / {\n    try_files $uri /index.html;\n  }\n  location /assets/ {\n    add_header Cache-Control "public, max-age=31536000, immutable";\n  }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
