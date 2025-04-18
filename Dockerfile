# ./Dockerfile
FROM node:22 AS build

WORKDIR /app
COPY client ./client
WORKDIR /app/client
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/client/dist /usr/share/nginx/html
COPY nginx/conf/nginx.conf /etc/nginx/nginx.conf
