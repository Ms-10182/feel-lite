FROM node

WORKDIR /server

COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY ./src ./
COPY ./public ./

EXPOSE 8080

ENTRYPOINT [ "npm","run","dev" ]