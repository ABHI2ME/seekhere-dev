FROM node:24-alpine

WORKDIR /seekhere

COPY package*.json ./
RUN npm install 

COPY backend/ ./backend/

# Copy the entrypoint script
COPY docker-entrypoint.sh ./

# Make the script executable inside the container
RUN chmod +x ./docker-entrypoint.sh

RUN npx prisma generate --schema=./backend/prisma/schema.prisma

EXPOSE 5000

# Set the entrypoint script to run on container start
ENTRYPOINT ["./docker-entrypoint.sh"]

CMD ["node" , "--trace-warnings" , "./backend/server.js"]













