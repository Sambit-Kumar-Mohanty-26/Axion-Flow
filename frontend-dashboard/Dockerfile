FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
ENV VITE_API_URL=http://localhost:10000/api
CMD ["npm", "run", "dev", "--", "--host"]