# Use an official and lightweight Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker's caching
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of your application source code into the container
COPY . .

# Let Docker know that the container listens on this port
# IMPORTANT: Change 8080 to whatever port your app uses
EXPOSE 8080

# The command to run your application, updated to use app.js
CMD [ "node", "app.js" ]