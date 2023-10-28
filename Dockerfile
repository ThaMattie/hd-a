# Create temporary build image
FROM node:18-alpine

# Create app directory
WORKDIR /usr

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY tsconfig.json ./

# Bundle app source
COPY ./src src
RUN ls -a

# Install and build
RUN npm install
RUN npm run tsc

# Create production image
FROM node:18-alpine
WORKDIR /usr
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=0 /usr/dist .
RUN npm install pm2 -g

CMD [ "pm2-runtime", "index.js"]