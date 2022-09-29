FROM node:14

WORKDIR /usr/src/app
COPY package.json .
RUN npm install & npm build
COPY . .

CMD [ "npm", "start" ]