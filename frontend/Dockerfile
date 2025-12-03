FROM node:20-slim

WORKDIR /app

# DNS sorunlarını önle
ENV NODE_OPTIONS=--dns-result-order=ipv4first

# PUPPETEER indirimi engelle
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package*.json ./

# NPM ayarları
ENV NEXT_TELEMETRY_DISABLED=1
ENV npm_config_update_notifier=false
ENV npm_config_fetch_retries=5
ENV npm_config_fetch_retry_maxtimeout=60000

RUN npm install

COPY . .

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
