# Use the node:lts image as the base image
FROM node:current-alpine3.22

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
