FROM node:20-alpine

WORKDIR /app

# Copy server package.json to /app and install production dependencies
COPY apps/server/package*.json ./
RUN npm install --omit=dev

# Copy core modules and server source
COPY core ./core
COPY demo-repo ./demo-repo
COPY apps/server ./apps/server

WORKDIR /app/apps/server

EXPOSE 3000

CMD ["node", "index.js"]
