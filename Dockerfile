# from base image node
FROM node:14.15.1-alpine3.10
WORKDIR /usr/src/app

# Installation des dépendances et build.
COPY . .
RUN yarn install && yarn run prod:webpack

# On expose le port 4000 en sortie
EXPOSE 4000

# La commande de lancement
CMD [ "node", "./dist/main.js" ]