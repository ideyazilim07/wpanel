# WPanel Desktop - Docker Image
FROM node:18-alpine

# Install dependencies for Puppeteer and WhatsApp Web.js
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    bash \
    git

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create data directory for SQLite
RUN mkdir -p /app/data

# Expose ports
EXPOSE 3000 3002

# Start the application
CMD ["npm", "start"]
