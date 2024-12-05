import os
from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)

# Database URL, updated to use psycopg3
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql+psycopg://user:password@db:5432/honeypot_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy with Flask
db = SQLAlchemy(app)

# Define the MaliciousConnection model
class MaliciousConnection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(120), nullable=False)
    attack_type = db.Column(db.String(120), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<MaliciousConnection {self.ip_address} at {self.timestamp}>'

# Function to log malicious connections
def log_malicious_connection(ip, attack_type):
    malicious_connection = MaliciousConnection(
        ip_address=ip,
        attack_type=attack_type
    )
    db.session.add(malicious_connection)
    db.session.commit()

@app.route('/')
def home():
    return "Welcome to the Honeypot!"

@app.route('/malicious-attack', methods=['POST'])
def malicious_attack():
    ip = request.remote_addr  # Get the IP address of the client
    attack_type = request.form.get('attack_type', 'unknown')  # Get the attack type
    log_malicious_connection(ip, attack_type)  # Log the malicious connection
    return f"Attack logged: {attack_type} from {ip}"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
