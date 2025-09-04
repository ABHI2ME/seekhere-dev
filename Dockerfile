FROM node:24-alpine

WORKDIR /seekhere

COPY package*.json ./
RUN npm install 

COPY backend/ ./backend/

RUN npx prisma generate --schema=./backend/prisma/schema.prisma

EXPOSE 5000

CMD ["node" , "./backend/server.js"]













