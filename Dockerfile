# Dockerfile
# base image
FROM node:14
# create & set working directory
# RUN mkdir -p /usr/src/app
WORKDIR /server
# Copy new files or directories into the filesystem of the container
COPY package*.json /server
# install dependencies
RUN npm install
# copy source files
COPY . /server
# sync database
RUN npm run db_sync
# Expose internal system to port
EXPOSE 4000

CMD ["npm", "run", "prod"]