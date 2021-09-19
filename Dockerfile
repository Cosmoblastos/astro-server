# Dockerfile
# base image
FROM node:14-alpine
# create & set working directory
# RUN mkdir -p /usr/src/app
WORKDIR server/
# Copy new files or directories into the filesystem of the container
COPY package*.json server/
# install dependencies
RUN npm install
# copy source files
COPY . server/
# sync database
RUN npm install -g cross-env
RUN npm i bcrypt
# Expose internal system to port
EXPOSE 4939
# Add docker-compose-wait tool -------------------
ENV WAIT_VERSION 2.7.2
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/$WAIT_VERSION/wait /wait
RUN chmod +x /wait
#sync db after mysql service is ready

CMD ["npm", "run", "prod"]