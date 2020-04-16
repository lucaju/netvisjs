FROM node:13.12.0

WORKDIR /app

RUN npm install pm2 -g

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["pm2", "start", "./server/index.js", "--no-daemon"]