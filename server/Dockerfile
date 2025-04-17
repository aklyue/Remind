FROM node:22

WORKDIR /app
COPY . .

RUN npm install -g pm2
RUN npm install

EXPOSE 4000

CMD ["pm2-runtime", "server.js"]