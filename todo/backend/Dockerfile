FROM node:16-alpine

WORKDIR /backend

COPY package.json package-lock.json ./
RUN npm install

CMD ["npm", "start"]
