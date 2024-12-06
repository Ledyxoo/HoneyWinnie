import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Récupérer les logs depuis le backend
    axios.get('http://localhost:5000/logs')
      .then(response => setLogs(response.data))
      .catch(error => console.error('Erreur lors de la récupération des logs', error));
  }, []);

  return (
    <div>
      <h1>Tableau de bord des attaques</h1>
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
              <td>{log.timestamp}</td>
              <td>{log.ip_source}</td>
              <td>{log.attack_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default App;
