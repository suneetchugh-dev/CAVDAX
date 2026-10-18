FROM node:20-alpine

WORKDIR /app

COPY apps/client/package*.json ./
RUN npm install

COPY apps/client ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
