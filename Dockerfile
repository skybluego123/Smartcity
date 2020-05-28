FROM node:10
WORKDIR /usr/src/app
RUN npm install webpack -g
COPY package*.json ./

RUN npm install
COPY . /usr/src/app/
EXPOSE 80

CMD [ "npm", "run","serve-release" ]