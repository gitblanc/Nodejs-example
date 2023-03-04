# linux container
FROM node:12 
# app directory
WORKDIR /app 
# environment variable
ENV NODE_ENV production 
# copy package logs files into the working directory
COPY package*.json ./
# docker will make npm install
RUN npm install
# copy all the sources files (from current paste into working directory)
COPY . .
# installs the library pm2
RUN npm install -g pm2
# expose the port 3000
EXPOSE 3000
# executes the library
CMD ["pm2-runtime", "index.js"]
