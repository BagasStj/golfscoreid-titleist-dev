# ============================================
# TT Invitational Indonesia - Docker Image
# Multi-stage build for React + Vite + Convex Online
# ============================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./

RUN npm ci --legacy-peer-deps || npm ci || npm install

# ============================================
# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ============================================
# VITE_CONVEX_URL di-pass dari Jenkins sebagai build-arg
# Nilai ini akan terbaked ke dalam JS bundle saat build
# ============================================
ARG VITE_CONVEX_URL=https://your-deployment.convex.cloud
ENV VITE_CONVEX_URL=$VITE_CONVEX_URL

ARG VITE_APP_ENV=production
ENV VITE_APP_ENV=$VITE_APP_ENV

ARG BUILD_ID=local
ENV BUILD_ID=$BUILD_ID

RUN echo "BUILD_ID=${BUILD_ID}" > /app/build-info.txt && \
    echo "BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> /app/build-info.txt && \
    echo "VITE_APP_ENV=${VITE_APP_ENV}" >> /app/build-info.txt && \
    echo "VITE_CONVEX_URL=${VITE_CONVEX_URL}" >> /app/build-info.txt

RUN npm run build

# ============================================
# Stage 3: Production Runner with Nginx
FROM nginx:alpine AS runner

ARG BUILD_ID=local

# Hapus default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy build info
COPY --from=builder /app/build-info.txt /usr/share/nginx/html/build-info.txt
RUN echo "FINAL_BUILD_ID=${BUILD_ID}" >> /usr/share/nginx/html/build-info.txt && \
    echo "FINAL_BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> /usr/share/nginx/html/build-info.txt

# Nginx config untuk serve React SPA
RUN echo 'server {' > /etc/nginx/conf.d/app.conf && \
    echo '    listen 3000;' >> /etc/nginx/conf.d/app.conf && \
    echo '    server_name _;' >> /etc/nginx/conf.d/app.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/app.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/app.conf && \
    echo '' >> /etc/nginx/conf.d/app.conf && \
    echo '    gzip on;' >> /etc/nginx/conf.d/app.conf && \
    echo '    gzip_vary on;' >> /etc/nginx/conf.d/app.conf && \
    echo '    gzip_min_length 1024;' >> /etc/nginx/conf.d/app.conf && \
    echo '    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json image/svg+xml;' >> /etc/nginx/conf.d/app.conf && \
    echo '' >> /etc/nginx/conf.d/app.conf && \
    echo '    # SPA fallback' >> /etc/nginx/conf.d/app.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/app.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/app.conf && \
    echo '    }' >> /etc/nginx/conf.d/app.conf && \
    echo '' >> /etc/nginx/conf.d/app.conf && \
    echo '    # Cache static assets 1 tahun' >> /etc/nginx/conf.d/app.conf && \
    echo '    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {' >> /etc/nginx/conf.d/app.conf && \
    echo '        expires 1y;' >> /etc/nginx/conf.d/app.conf && \
    echo '        add_header Cache-Control "public, immutable";' >> /etc/nginx/conf.d/app.conf && \
    echo '    }' >> /etc/nginx/conf.d/app.conf && \
    echo '}' >> /etc/nginx/conf.d/app.conf

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
