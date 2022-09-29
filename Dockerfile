FROM node:14

WORKDIR /usr/src/app
COPY package.json .
RUN npm install
RUN npm run build
COPY . .

CMD [ "npm", "start" ]