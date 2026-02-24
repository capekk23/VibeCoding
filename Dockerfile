# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Setup the backend and serve the application
FROM node:20-alpine
WORKDIR /app

# Copy root package files and install backend dependencies
COPY package*.json ./
RUN npm install --production

# Copy built frontend from Stage 1 to the backend's public directory
COPY --from=frontend-builder /app/public ./public

# Copy backend source code
COPY backend/ ./backend/

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
