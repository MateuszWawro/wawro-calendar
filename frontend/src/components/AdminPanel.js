// src/components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Shield, 
  Trash2, 
  Edit2, 
  X, 
  Key, 
  RefreshCw,
  BarChart3,
  Mail,
  User,
  Palette,
  Save,
  AlertTriangle
} from 'lucide-react';

function AdminPanel({ apiUrl, user, onInviteCodeUpdate }) {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    color: '',
    role: 'member'
  });
  const [newPassword, setNewPassword] = useState('');

  const COLORS = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
  ];

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
      fetchStats();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiUrl}/admin/users`);
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Błąd podczas pobierania użytkowników');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${apiUrl}/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleEditUser = (userToEdit) => {
    setEditingUser(userToEdit);
    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      color: userToEdit.color,
      role: userToEdit.role
    });
    setShowEditModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`${apiUrl}/admin/users/${editingUser.id}`, formData);
      setShowEditModal(false);
      fetchUsers();
      alert('Użytkownik zaktualizowany pomyślnie');
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.error || 'Błąd podczas aktualizacji użytkownika');
    }
  };

  const handleChangePassword = (userToEdit) => {
    setEditingUser(userToEdit);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      alert('Hasło musi mieć minimum 6 znaków');
      return;
    }

    try {
      await axios.put(`${apiUrl}/admin/users/${editingUser.id}/password`, {
        newPassword
      });
      setShowPasswordModal(false);
      setNewPassword('');
      alert('Hasło zostało zmienione pomyślnie');
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.error || 'Błąd podczas zmiany hasła');
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    if (userToDelete.id === user.id) {
      alert('Nie możesz usunąć samego siebie');
      return;
    }

    if (!window.confirm(`Czy na pewno chcesz usunąć użytkownika ${userToDelete.name}? Ta operacja jest nieodwracalna!`)) {
      return;
    }

    try {
      await axios.delete(`${apiUrl}/admin/users/${userToDelete.id}`);
      fetchUsers();
      alert('Użytkownik został usunięty');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.error || 'Błąd podczas usuwania użytkownika');
    }
  };

  const handleRegenerateInviteCode = async () => {
    if (!window.confirm('Czy na pewno chcesz wygenerować nowy kod zaproszenia? Stary kod przestanie działać!')) {
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/admin/regenerate-invite`);
      alert(`Nowy kod zaproszenia: ${response.data.inviteCode}`);
      if (onInviteCodeUpdate) {
        onInviteCodeUpdate(response.data.inviteCode);
      }
    } catch (error) {
      console.error('Error regenerating invite code:', error);
      alert('Błąd podczas generowania kodu');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-panel">
        <div className="access-denied">
          <AlertTriangle size={64} />
          <h2>Brak dostępu</h2>
          <p>Tylko administratorzy mają dostęp do tego panelu</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Ładowanie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-title">
          <Shield size={32} />
          <div>
            <h2>Panel Administracyjny</h2>
            <p>Zarządzanie rodziną i użytkownikami</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="admin-stats">
          <h3><BarChart3 size={20} /> Statystyki</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{stats.usersCount}</div>
              <div className="stat-label">Użytkowników</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-value">{stats.eventsCount}</div>
              <div className="stat-label">Wydarzeń</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛒</div>
              <div className="stat-value">{stats.shoppingListsCount}</div>
              <div className="stat-label">List zakupów</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{stats.todosCount}</div>
              <div className="stat-label">Zadań</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-value">{stats.notesCount}</div>
              <div className="stat-label">Notatek</div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Code */}
      <div className="admin-section">
        <h3>Kod Zaproszenia</h3>
        <button onClick={handleRegenerateInviteCode} className="btn-regenerate">
          <RefreshCw size={18} />
          Wygeneruj nowy kod
        </button>
        <p className="invite-note">
          Uwaga: Wygenerowanie nowego kodu unieważni stary kod zaproszenia
        </p>
      </div>

      {/* Users Management */}
      <div className="admin-section">
        <h3><Users size={20} /> Zarządzanie Użytkownikami</h3>
        
        <div className="users-list">
          {users.map(u => (
            <div key={u.id} className="user-card">
              <div className="user-avatar" style={{ backgroundColor: u.color }}>
                {u.name.charAt(0).toUpperCase()}
              </div>
              
              <div className="user-info">
                <div className="user-name">
                  {u.name}
                  {u.role === 'admin' && (
                    <span className="admin-badge">
                      <Shield size={14} />
                      Admin
                    </span>
                  )}
                  {u.id === user.id && (
                    <span className="you-badge">Ty</span>
                  )}
                </div>
                <div className="user-email">{u.email}</div>
                <div className="user-meta">
                  Dołączył: {new Date(u.created_at).toLocaleDateString('pl-PL')}
                </div>
              </div>

              <div className="user-actions">
                <button
                  onClick={() => handleEditUser(u)}
                  className="btn-icon"
                  title="Edytuj użytkownika"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleChangePassword(u)}
                  className="btn-icon"
                  title="Zmień hasło"
                >
                  <Key size={18} />
                </button>
                {u.id !== user.id && (
                  <button
                    onClick={() => handleDeleteUser(u)}
                    className="btn-icon btn-danger"
                    title="Usuń użytkownika"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edytuj użytkownika</h3>
              <button onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="modal-form">
              <div className="form-group">
                <label>
                  <User size={18} />
                  Imię
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <Mail size={18} />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <Palette size={18} />
                  Kolor
                </label>
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
                  <Shield size={18} />
                  Rola
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="member">Członek</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">
                  Anuluj
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={18} />
                  Zapisz zmiany
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Zmień hasło użytkownika</h3>
              <button onClick={() => setShowPasswordModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="modal-form">
              <p className="password-note">
                Zmiana hasła dla: <strong>{editingUser?.name}</strong>
              </p>

              <div className="form-group">
                <label>
                  <Key size={18} />
                  Nowe hasło (min. 6 znaków)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nowe hasło..."
                  required
                  minLength="6"
                  autoFocus
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="btn-secondary">
                  Anuluj
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={18} />
                  Zmień hasło
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-panel {
          max-width: 1200px;
          margin: 0 auto;
        }

        .access-denied {
          text-align: center;
          padding: 4rem 2rem;
          background: var(--bg-secondary);
          border-radius: 12px;
          color: var(--text-tertiary);
        }

        .access-denied h2 {
          color: var(--text-primary);
          margin: 1rem 0 0.5rem 0;
        }

        .admin-header {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: var(--shadow-md);
        }

        .admin-title {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: var(--accent-primary);
        }

        .admin-title h2 {
          margin: 0;
          color: var(--text-primary);
        }

        .admin-title p {
          margin: 0;
          color: var(--text-tertiary);
          font-size: 0.875rem;
        }

        .admin-stats {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: var(--shadow-md);
        }

        .admin-stats h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 1rem 0;
          color: var(--text-primary);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          background: var(--bg-tertiary);
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
        }

        .stat-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: var(--accent-primary);
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-tertiary);
        }

        .admin-section {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: var(--shadow-md);
        }

        .admin-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 1rem 0;
          color: var(--text-primary);
        }

        .btn-regenerate {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--warning);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-regenerate:hover {
          background: #d97706;
        }

        .invite-note {
          margin-top: 1rem;
          font-size: 0.875rem;
          color: var(--text-tertiary);
        }

        .users-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .user-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-tertiary);
          border-radius: 8px;
          transition: all 0.2s;
        }

        .user-card:hover {
          background: var(--bg-hover);
        }

        .user-avatar {
          width: 60px;
          height: 60px;
          min-width: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .user-info {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.125rem 0.5rem;
          background: var(--accent-primary);
          color: white;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .you-badge {
          padding: 0.125rem 0.5rem;
          background: var(--success);
          color: white;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .user-email {
          font-size: 0.9375rem;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }

        .user-meta {
          font-size: 0.8125rem;
          color: var(--text-tertiary);
        }

        .user-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-icon {
          background: var(--bg-secondary);
          border: none;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-icon:hover {
          background: var(--accent-primary);
          color: white;
        }

        .btn-icon.btn-danger:hover {
          background: var(--danger);
        }

        .password-note {
          padding: 1rem;
          background: var(--bg-tertiary);
          border-radius: 8px;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .user-card {
            flex-wrap: wrap;
          }

          .user-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

export default AdminPanel;