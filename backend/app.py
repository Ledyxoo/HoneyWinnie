from flask import Flask, jsonify, request, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from authentification import auth_bp, db, login_manager, User
from flask_login import login_required, LoginManager, login_user, logout_user, current_user
from datetime import datetime
import os

# Initialiser l'application Flask
app = Flask(__name__)

# Clé secrète pour signer les cookies de session
app.secret_key = os.getenv('SECRET_KEY', 'your_secret_key')

# Configuration du cookie de session
app.config['SESSION_COOKIE_NAME'] = 'session'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = True  # Assure-toi que le cookie est sécurisé (uniquement en HTTPS)
app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # Permet le partage de cookies cross-origin
app.config['REMEMBER_COOKIE_DURATION'] = 60 * 60 * 24 * 7  # Durée du cookie "se souvenir de moi" (7 jours)

# Configurer CORS pour permettre l'accès depuis http://127.0.0.1:3001
CORS(app, resources={r"/auth/*": {"origins": "http://localhost:3001", "supports_credentials": True},
                     r"/logs": {"origins": "http://localhost:3001", "supports_credentials": True},
                     r"/logout": {"origins": "http://localhost:3001", "supports_credentials": True}}, supports_credentials=True)

# Configurer SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql+psycopg://user:password@db:5432/honeypot_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialiser les extensions
db.init_app(app)

# Initialisation du gestionnaire de login
login_manager = LoginManager()
login_manager.init_app(app)

# Enregistrer le blueprint d'authentification
app.register_blueprint(auth_bp, url_prefix='/auth')

# Définir le modèle User et la session
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Modèle pour les connexions malveillantes
class MaliciousConnection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(120), nullable=False)
    attack_type = db.Column(db.String(120), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<MaliciousConnection {self.ip_address} at {self.timestamp}>'

# Route principale
@app.route('/')
def home():
    return "Welcome to the Honeypot!"

# Route pour enregistrer une attaque malveillante
@app.route('/malicious-attack', methods=['POST'])
def malicious_attack():
    ip = request.remote_addr  # Obtenir l'adresse IP du client
    attack_type = request.form.get('attack_type', 'unknown')  # Obtenir le type d'attaque
    log_malicious_connection(ip, attack_type)  # Enregistrer la connexion malveillante
    return f"Attack logged: {attack_type} from {ip}"

# Fonction pour enregistrer une connexion malveillante
def log_malicious_connection(ip, attack_type):
    malicious_connection = MaliciousConnection(
        ip_address=ip,
        attack_type=attack_type
    )
    db.session.add(malicious_connection)
    db.session.commit()

# Nouvelle route pour récupérer les logs en JSON
@app.route('/logs', methods=['GET'])
@login_required  # Cette route est protégée, il faut être authentifié pour y accéder
def get_logs():
    # Récupérer tous les logs d'attaque
    logs = MaliciousConnection.query.all()
    
    # Formatage des logs en dictionnaire
    logs_list = [{
        'timestamp': log.timestamp,
        'ip_source': log.ip_address,
        'attack_type': log.attack_type
    } for log in logs]
    
    # Retourner les logs sous forme de JSON
    return jsonify({'logs': logs_list})

# Route pour se déconnecter
@app.route('/logout', methods=['POST'])
def logout():
    logout_user()  # Déconnecter l'utilisateur
    return jsonify(message="Logout successful")

@app.route('/auth/status', methods=['GET'])
@login_required
def check_status():
    return jsonify(message="User is authenticated", user=current_user.username)

# Fonction pour créer les tables si elles n'existent pas
def create_tables():
    with app.app_context():
        db.create_all()
        # Ajouter un utilisateur administrateur par défaut pour tester l'authentification
        if not User.query.filter_by(username="admin").first():
            admin = User(username="admin")
            admin.set_password("password")
            db.session.add(admin)
            db.session.commit()

# Gérer les requêtes OPTIONS
@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        response = jsonify({"message": "preflight"})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3001')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response

if __name__ == "__main__":
    create_tables()  # Créer les tables avant de démarrer l'application
    app.run(host='0.0.0.0', port=5000)
