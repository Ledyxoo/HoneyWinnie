import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [logs, setLogs] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');  // État pour gérer les erreurs de connexion

  // Fonction pour vérifier si l'utilisateur est authentifié
  const checkAuthentication = () => {
    axios
      .get('http://localhost:5000/auth/status', { withCredentials: true })  // Vérifier le statut de l'utilisateur
      .then((response) => {
        setIsAuthenticated(true);  // Utilisateur authentifié
        console.log(response.data.message);  // Afficher le message
        fetchLogs();  // Charger les logs après l'authentification
      })
      .catch((error) => {
        setIsAuthenticated(false);  // L'utilisateur n'est pas authentifié
        console.error('Erreur d\'authentification', error);
      });
  };

  // Fonction pour récupérer les logs
  const fetchLogs = () => {
    axios
      .get('http://localhost:5000/logs', { withCredentials: true }) // Assurez-vous que les cookies sont envoyés
      .then((response) => {
        setLogs(response.data.logs); // Les logs sont dans response.data.logs
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des logs', error);
        if (error.response && error.response.status === 401) {
          setIsAuthenticated(false); // Si l'utilisateur n'est pas authentifié
        }
      });
  };

  // Utiliser useEffect pour charger les logs et vérifier l'authentification
  useEffect(() => {
    checkAuthentication();  // Vérifier si l'utilisateur est authentifié au chargement
  }, []);

  // Fonction pour gérer la connexion
  const handleLogin = () => {
    setLoginError(''); // Réinitialiser les erreurs de connexion
    axios
      .post('http://localhost:5000/auth/login', { username, password }, { withCredentials: true })  // Modifiez l'URL ici
      .then((response) => {
        console.log(response.data.message); // Afficher le message de succès
        setIsAuthenticated(true); // Utilisateur authentifié
        fetchLogs(); // Charger les logs
      })
      .catch((error) => {
        console.error('Erreur de connexion', error);
        setLoginError('Nom d’utilisateur ou mot de passe incorrect'); // Gérer l'erreur de connexion
      });
  };

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    axios
      .post('http://localhost:5000/logout', {}, { withCredentials: true })
      .then((response) => {
        console.log(response.data.message); // Afficher le message de succès
        setIsAuthenticated(false); // Réinitialiser l'état d'authentification
        setLogs([]); // Vider les logs
      })
      .catch((error) => {
        console.error('Erreur lors de la déconnexion', error);
      });
  };

  // Rendu de l'application
  return (
    <div>
      <h1>Honeypot Management Dashboard</h1>
      {!isAuthenticated ? (
        <div>
          <h2>Connexion</h2>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Se connecter</button>
          {loginError && <p style={{ color: 'red' }}>{loginError}</p>}  {/* Afficher l'erreur de connexion */}
        </div>
      ) : (
        <div>
          <button onClick={handleLogout}>Se déconnecter</button>
          <h2>Logs des attaques</h2>
          <table border="1">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>IP Source</th>
                <th>Type d'attaque</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.ip_source}</td>
                  <td>{log.attack_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
