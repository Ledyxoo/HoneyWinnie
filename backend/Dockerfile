# Utiliser une image Python comme base
FROM python:latest

# Installer les dépendances
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copier le code
COPY . .

# Lancer l’application Flask
CMD ["python", "app.py"]
