FROM node:10
WORKDIR /usr/src/app
RUN npm install webpack -g
COPY package*.json ./

RUN npm install
COPY . /usr/src/app/
EXPOSE 8080
CMD [ "npm", "start" ]