FROM node:22.19

WORKDIR /mates_frontend

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5173


CMD [ "npm" , "run" , "dev" ]