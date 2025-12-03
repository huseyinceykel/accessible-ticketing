FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate

CMD ["npm", "run", "start:dev"]
