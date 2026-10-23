FROM node:20-alpine

WORKDIR /app

# Copy root context to include core modules
COPY package*.json ./
COPY core ./core
COPY demo-repo ./demo-repo
COPY apps/server ./apps/server

# Install dependencies at /app so core/ and apps/server/ resolve modules cleanly
RUN npm install --omit=dev falkordb express cors dotenv express-session express-rate-limit && cd apps/server && npm install --omit=dev

WORKDIR /app/apps/server

EXPOSE 3000

CMD ["node", "index.js"]
