# Stage 1: Build
FROM node:14 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Stage 2: Production-ready image
FROM node:14-alpine

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app .

# Expose port 3000
EXPOSE 3001

# Command to run the application
CMD ["node", "index.js"]
