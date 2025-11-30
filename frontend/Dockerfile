FROM node:20-alpine

# Next.js'in Alpine Linux'ta çalışması için gerekli kütüphane
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./

# SWC binary hatasını önlemek için opsiyonel dependencies'i de kuruyoruz
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]