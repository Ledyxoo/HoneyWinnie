# Utiliser une image Node.js
FROM node:16

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers nécessaires
COPY ./honeypot-frontend/ ./
RUN npm install
COPY . .

# Construire l'application
RUN npm run build

# Utiliser une image nginx pour le déploiement
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
