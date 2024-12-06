import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Navbar, Nav, Button, Form, Table, Alert } from 'react-bootstrap';

function App() {
  const [logs, setLogs] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Vérifier si l'utilisateur est authentifié
  const checkAuthentication = () => {
    axios
      .get('http://localhost:5000/auth/status', { withCredentials: true })
      .then((response) => {
        setIsAuthenticated(true);
        fetchLogs();
      })
      .catch((error) => {
        setIsAuthenticated(false);
        console.error('Erreur d\'authentification', error);
      });
  };

  // Récupérer les logs
  const fetchLogs = () => {
    axios
      .get('http://localhost:5000/logs', { withCredentials: true })
      .then((response) => setLogs(response.data.logs))
      .catch((error) => {
        console.error('Erreur lors de la récupération des logs', error);
        if (error.response && error.response.status === 401) {
          setIsAuthenticated(false);
        }
      });
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  // Connexion
  const handleLogin = () => {
    setLoginError('');
    axios
      .post(
        'http://localhost:5000/auth/login',
        { username, password },
        { withCredentials: true }
      )
      .then((response) => {
        setIsAuthenticated(true);
        fetchLogs();
      })
      .catch((error) => {
        console.error('Erreur de connexion', error);
        setLoginError('Nom d’utilisateur ou mot de passe incorrect');
      });
  };

  // Déconnexion
  const handleLogout = () => {
    axios
      .post('http://localhost:5000/logout', {}, { withCredentials: true })
      .then((response) => {
        setIsAuthenticated(false);
        setLogs([]);
      })
      .catch((error) => console.error('Erreur lors de la déconnexion', error));
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand href="#">Honeypot Dashboard</Navbar.Brand>
          {isAuthenticated && (
            <Nav className="ml-auto">
              <Button variant="outline-light" onClick={handleLogout}>
                Déconnexion
              </Button>
            </Nav>
          )}
        </Container>
      </Navbar>

      {/* Contenu principal */}
      <Container>
        {!isAuthenticated ? (
          <div className="login-form">
            <h2 className="text-center mb-4">Connexion</h2>
            {loginError && <Alert variant="danger">{loginError}</Alert>}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nom d'utilisateur</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Entrez votre nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" onClick={handleLogin}>
                Se connecter
              </Button>
            </Form>
          </div>
        ) : (
          <div>
            <h2 className="mb-4">Logs des attaques</h2>
            <Table striped bordered hover responsive>
              <thead className="table-dark">
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
            </Table>
          </div>
        )}
      </Container>
    </div>
  );
}

export default App;
