# Base image
FROM node:20-alpine

# Working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Prisma generate
RUN npx prisma generate

# Build NestJS
RUN npm run build

# Expose port
EXPOSE 3001

# Start app
CMD ["npm", "run", "start:prod"]