// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Auth from './components/Auth';
import Calendar from './components/Calendar';
import Shopping from './components/Shopping';
import Todos from './components/Todos';
import Meals from './components/Meals';
import Notes from './components/Notes';
import Reminders from './components/Reminders';
import { Calendar as CalendarIcon, ShoppingCart, CheckSquare, UtensilsCrossed, StickyNote, Bell, LogOut, Users, Moon, Sun } from 'lucide-react';


// Konfiguracja API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Axios interceptor dla autoryzacji
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios interceptor dla błędów autoryzacji
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token wygasł lub jest nieprawidłowy
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('family');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [family, setFamily] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Sprawdź czy użytkownik jest zalogowany
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const familyData = localStorage.getItem('family');

    if (token && userData) {
      try {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
        if (familyData) {
          setFamily(JSON.parse(familyData));
        }
        fetchMembers();
      } catch (error) {
        console.error('Error parsing stored data:', error);
        handleLogout();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.body.classList.add('dark-mode');
    }
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${API_URL}/family/members`);
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleLogin = (token, userData, familyData) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('family', JSON.stringify(familyData));
      setIsAuthenticated(true);
      setUser(userData);
      setFamily(familyData);
      fetchMembers();
    } catch (error) {
      console.error('Error saving auth data:', error);
      alert('Błąd podczas zapisywania danych logowania');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('family');
    setIsAuthenticated(false);
    setUser(null);
    setFamily(null);
    setMembers([]);
    setActiveTab('calendar');
  };
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} apiUrl={API_URL} />;
  }

  const tabs = [
    { id: 'calendar', name: 'Kalendarz', icon: CalendarIcon },
    { id: 'shopping', name: 'Zakupy', icon: ShoppingCart },
    { id: 'todos', name: 'Zadania', icon: CheckSquare },
    { id: 'meals', name: 'Posiłki', icon: UtensilsCrossed },
    { id: 'notes', name: 'Notatki', icon: StickyNote },
    { id: 'reminders', name: 'Przypomnienia', icon: Bell }
  ];

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <Users className="header-icon" />
            <div>
              <h1>Family Hub</h1>
              <p>{family?.name || 'Organizer Rodzinny'}</p>
            </div>
          </div>
          <div className="header-right">
  <div className="user-info">
    <span className="user-name">{user?.name}</span>
    {family?.inviteCode && (
      <span className="invite-code">Kod: {family.inviteCode}</span>
    )}
  </div>
  
  {/* Dark Mode Toggle */}
  <button 
    onClick={toggleDarkMode} 
    className="theme-toggle-btn"
    title={darkMode ? 'Tryb jasny' : 'Tryb ciemny'}
  >
    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
  </button>
  
  <button onClick={handleLogout} className="logout-btn" title="Wyloguj się">
    <LogOut size={20} />
  </button>
</div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="app-nav">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {activeTab === 'calendar' && <Calendar apiUrl={API_URL} members={members} />}
        {activeTab === 'shopping' && <Shopping apiUrl={API_URL} user={user} />}
        {activeTab === 'todos' && <Todos apiUrl={API_URL} members={members} />}
        {activeTab === 'meals' && <Meals apiUrl={API_URL} />}
        {activeTab === 'notes' && <Notes apiUrl={API_URL} user={user} />}
        {activeTab === 'reminders' && <Reminders apiUrl={API_URL} members={members} />}
      </main>
    </div>
  );
}

export default App;