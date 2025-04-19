FROM node:22 AS frontend
WORKDIR /app/client
COPY client ./ 
RUN npm install && npm run build

FROM node:22 AS backend
WORKDIR /app/server
COPY server ./
RUN npm install

FROM nginx:alpine

COPY --from=frontend /app/client/dist /usr/share/nginx/html

COPY nginx/conf/nginx.conf /etc/nginx/nginx.conf

COPY --from=backend /app/server /app/server

RUN apk add --no-cache nodejs npm && npm install pm2 -g

WORKDIR /app/server

EXPOSE 80

CMD pm2 start server.js --name backend && nginx -g "daemon off;"

