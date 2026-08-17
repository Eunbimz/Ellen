FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# -H 0.0.0.0 is required: Next's dev server binds to localhost by default,
# which is unreachable from outside the container.
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]