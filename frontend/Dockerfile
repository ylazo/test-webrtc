FROM node:14-alpine

WORKDIR /app
RUN npm install -g @quasar/cli;

CMD npm install; quasar build; quasar dev -m ssr;