// src/components/Auth.js
import React, { useState } from 'react';
import axios from 'axios';
import { Users, Mail, Lock, User, Home } from 'lucide-react';

const COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

function Auth({ onLogin, apiUrl }) {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'join'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    familyName: '',
    inviteCode: '',
    color: COLORS[0]
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${apiUrl}/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      onLogin(response.data.token, response.data.user, response.data.family);
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd logowania');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${apiUrl}/auth/register`, {
        familyName: formData.familyName,
        email: formData.email,
        password: formData.password,
        name: formData.name,
        color: formData.color
      });

      onLogin(response.data.token, response.data.user, response.data.family);
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd rejestracji');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${apiUrl}/auth/join`, {
        inviteCode: formData.inviteCode,
        email: formData.email,
        password: formData.password,
        name: formData.name,
        color: formData.color
      });

      onLogin(response.data.token, response.data.user, response.data.family);
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd dołączania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <Users size={48} className="auth-logo" />
          <h1>Family Hub</h1>
          <p>Organizer dla całej rodziny</p>
        </div>

        <div className="auth-tabs">
          <button
            className={mode === 'login' ? 'active' : ''}
            onClick={() => {
              setMode('login');
              setError('');
            }}
          >
            Logowanie
          </button>
          <button
            className={mode === 'register' ? 'active' : ''}
            onClick={() => {
              setMode('register');
              setError('');
            }}
          >
            Nowa Rodzina
          </button>
          <button
            className={mode === 'join' ? 'active' : ''}
            onClick={() => {
              setMode('join');
              setError('');
            }}
          >
            Dołącz
          </button>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>
                <Mail size={20} />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="twoj@email.pl"
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={20} />
                Hasło
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Logowanie...' : 'Zaloguj się'}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>
                <Home size={20} />
                Nazwa rodziny
              </label>
              <input
                type="text"
                name="familyName"
                value={formData.familyName}
                onChange={handleChange}
                required
                placeholder="Rodzina Kowalskich"
              />
            </div>

            <div className="form-group">
              <label>
                <User size={20} />
                Twoje imię
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Jan"
              />
            </div>

            <div className="form-group">
              <label>Wybierz kolor</label>
              <div className="color-picker">
                {COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>
                <Mail size={20} />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="twoj@email.pl"
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={20} />
                Hasło
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                placeholder="min. 6 znaków"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Tworzenie...' : 'Utwórz rodzinę'}
            </button>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} className="auth-form">
            <div className="form-group">
              <label>
                <Home size={20} />
                Kod zaproszenia
              </label>
              <input
                type="text"
                name="inviteCode"
                value={formData.inviteCode}
                onChange={handleChange}
                required
                placeholder="ABC123"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="form-group">
              <label>
                <User size={20} />
                Twoje imię
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Jan"
              />
            </div>

            <div className="form-group">
              <label>Wybierz kolor</label>
              <div className="color-picker">
                {COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>
                <Mail size={20} />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="twoj@email.pl"
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={20} />
                Hasło
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                placeholder="min. 6 znaków"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Dołączanie...' : 'Dołącz do rodziny'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Auth;