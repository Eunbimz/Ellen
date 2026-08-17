FROM node:20-alpine

WORKDIR /app

# Install deps first so this layer is cached unless package.json changes
COPY package*.json ./
RUN npm install

# Actual source gets bind-mounted in docker-compose for live reload,
# but copy it too so `docker build` alone still produces a working image.
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]