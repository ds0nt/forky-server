FROM node:latest

WORKDIR /forky
ADD . /forky

EXPOSE 8080
CMD node index.js
