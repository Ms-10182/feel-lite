FROM node

WORKDIR /server

COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY ./src ./src
COPY ./public ./public

EXPOSE 80

CMD [ "node","src/index.js" ]