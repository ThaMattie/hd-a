FROM node:18

# Create app directory
WORKDIR /usr

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY tsconfig.json ./

# Remove unneeded development dependencies
RUN npm prune --production

# RUN npm install
# If you are building your code for production
RUN npm ci --omit=dev

# Bundle app source
COPY ./src src
CMD [ "node", "index.js"]