# Step 1: Build the React app with Node.js 20.18
FROM node:20.18.0 AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code and build it
COPY . .
RUN npm run build

# Step 2: Use the latest stable Nginx to serve the app
FROM nginx:latest

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy React build output to Nginx's web directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
