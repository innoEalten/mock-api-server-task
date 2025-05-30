# Dockerfile
# Stage 1: Build the application
FROM node:23-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Consider npm ci for cleaner installs if package-lock.json is committed and reliable
RUN npm install

COPY . .

RUN npm run build

# Stage 2: Production environment
FROM node:23-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Copy only necessary artifacts from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
# If you have a package-lock.json, copy it too for consistency, though node_modules are already copied
# COPY --from=builder /usr/src/app/package-lock.json ./

EXPOSE 3000

# CMD ["node", "dist/main.js"] # Ensure your main file is dist/main.js or dist/main
# CMD ["node", "dist/main"] # Assuming NestJS default main file path
CMD node dist/main.js # Use shell form and specify .js 