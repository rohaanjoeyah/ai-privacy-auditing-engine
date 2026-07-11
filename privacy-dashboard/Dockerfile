# STAGE 1: Build the React Application
FROM node:20-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the frontend source code and build it
COPY . .
RUN npm run build

# STAGE 2: Serve with Nginx
FROM nginx:alpine

# Copy the compiled Vite dist folder to the Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Expose standard web port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]