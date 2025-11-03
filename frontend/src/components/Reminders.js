// src/components/Reminders.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, X, Bell, Clock } from 'lucide-react';

const REPEAT_TYPES = [
  { value: '', label: 'Jednorazowe' },
  { value: 'daily', label: 'Codziennie' },
  { value: 'weekly', label: 'Co tydzień' },
  { value: 'monthly', label: 'Co miesiąc' },
];

function Reminders({ apiUrl, members }) {
  const [reminders, setReminders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    remindAt: '',
    repeatType: '',
    userId: members[0]?.id || null
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await axios.get(`${apiUrl}/reminders`);
      setReminders(response.data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const handleOpenModal = (reminder = null) => {
    if (reminder) {
      setEditingReminder(reminder);
      setFormData({
        title: reminder.title,
        description: reminder.description || '',
        remindAt: reminder.remind_at?.substring(0, 16) || '',
        repeatType: reminder.repeat_type || '',
        userId: reminder.user_id
      });
    } else {
      setEditingReminder(null);
      // Set default date to tomorrow at 9:00
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      const dateString = tomorrow.toISOString().substring(0, 16);
      
      setFormData({
        title: '',
        description: '',
        remindAt: dateString,
        repeatType: '',
        userId: members[0]?.id || null
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingReminder) {
        await axios.put(`${apiUrl}/reminders/${editingReminder.id}`, formData);
      } else {
        await axios.post(`${apiUrl}/reminders`, formData);
      }

      setShowModal(false);
      fetchReminders();
    } catch (error) {
      console.error('Error saving reminder:', error);
      alert('Błąd podczas zapisywania przypomnienia');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (window.confirm('Czy na pewno chcesz usunąć to przypomnienie?')) {
      try {
        await axios.delete(`${apiUrl}/reminders/${reminderId}`);
        fetchReminders();
      } catch (error) {
        console.error('Error deleting reminder:', error);
      }
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffMs = date - now;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    const timeStr = date.toLocaleTimeString('pl-PL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    if (diffMs < 0) return `Przeszłe - ${date.toLocaleDateString('pl-PL')} ${timeStr}`;
    if (diffHours < 24) return `Dziś o ${timeStr}`;
    if (diffDays === 1) return `Jutro o ${timeStr}`;
    if (diffDays < 7) return `${date.toLocaleDateString('pl-PL', { weekday: 'long' })} o ${timeStr}`;
    
    return `${date.toLocaleDateString('pl-PL')} ${timeStr}`;
  };

  const isPast = (dateTimeString) => {
    return new Date(dateTimeString) < new Date();
  };

  const upcomingReminders = reminders.filter(r => !isPast(r.remind_at));
  const pastReminders = reminders.filter(r => isPast(r.remind_at));

  return (
    <div className="reminders-container">
      <div className="page-header">
        <h2>Przypomnienia</h2>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus size={20} />
          Nowe przypomnienie
        </button>
      </div>

      {reminders.length === 0 ? (
        <div className="empty-state">
          <Bell size={64} className="empty-icon" />
          <h3>Brak przypomnień</h3>
          <p>Dodaj pierwsze przypomnienie dla rodziny</p>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            <Plus size={20} />
            Dodaj przypomnienie
          </button>
        </div>
      ) : (
        <div className="reminders-content">
          {/* Upcoming Reminders */}
          {upcomingReminders.length > 0 && (
            <div className="reminders-section">
              <h3 className="section-title">
                <Clock size={20} />
                Nadchodzące ({upcomingReminders.length})
              </h3>
              <div className="reminders-list">
                {upcomingReminders.map(reminder => {
                  const member = members.find(m => m.id === reminder.user_id);
                  const repeatLabel = REPEAT_TYPES.find(t => t.value === reminder.repeat_type)?.label;

                  return (
                    <div 
                      key={reminder.id} 
                      className="reminder-item"
                      style={{ borderLeftColor: member?.color || '#3b82f6' }}
                    >
                      <div className="reminder-icon">
                        <Bell size={20} />
                      </div>

                      <div className="reminder-content">
                        <h4 className="reminder-title">{reminder.title}</h4>
                        {reminder.description && (
                          <p className="reminder-description">{reminder.description}</p>
                        )}
                        <div className="reminder-meta">
                          <span className="reminder-assignee">
                            Dla: {member?.name || 'Nieprzypisane'}
                          </span>
                          <span className="meta-separator">•</span>
                          <span className="reminder-time">
                            {formatDateTime(reminder.remind_at)}
                          </span>
                          {reminder.repeat_type && (
                            <>
                              <span className="meta-separator">•</span>
                              <span className="reminder-repeat">{repeatLabel}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="reminder-actions">
                        <button
                          onClick={() => handleOpenModal(reminder)}
                          className="btn-icon-small"
                          title="Edytuj"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="btn-icon-small btn-danger"
                          title="Usuń"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Reminders */}
          {pastReminders.length > 0 && (
            <div className="reminders-section">
              <h3 className="section-title">
                Przeszłe ({pastReminders.length})
              </h3>
              <div className="reminders-list">
                {pastReminders.map(reminder => {
                  const member = members.find(m => m.id === reminder.user_id);

                  return (
                    <div 
                      key={reminder.id} 
                      className="reminder-item past"
                      style={{ borderLeftColor: member?.color || '#3b82f6' }}
                    >
                      <div className="reminder-icon">
                        <Bell size={20} />
                      </div>

                      <div className="reminder-content">
                        <h4 className="reminder-title">{reminder.title}</h4>
                        <div className="reminder-meta">
                          <span className="reminder-time">
                            {formatDateTime(reminder.remind_at)}
                          </span>
                        </div>
                      </div>

                      <div className="reminder-actions">
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="btn-icon-small btn-danger"
                          title="Usuń"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingReminder ? 'Edytuj przypomnienie' : 'Nowe przypomnienie'}</h3>
              <button onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Tytuł *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="np. Zapisać dziecko na basen"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Opis</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Dodatkowe informacje..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Data i godzina *</label>
                  <input
                    type="datetime-local"
                    value={formData.remindAt}
                    onChange={(e) => setFormData({ ...formData, remindAt: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Powtarzanie</label>
                  <select
                    value={formData.repeatType}
                    onChange={(e) => setFormData({ ...formData, repeatType: e.target.value })}
                  >
                    {REPEAT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Dla kogo *</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: parseInt(e.target.value) })}
                  required
                >
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Anuluj
                </button>
                <button type="submit" className="btn-primary">
                  {editingReminder ? 'Zapisz zmiany' : 'Dodaj przypomnienie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .reminders-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .page-header h2 {
          font-size: 1.75rem;
          color: #2d3748;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .empty-icon {
          color: #cbd5e0;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #718096;
          margin-bottom: 1.5rem;
        }

        .reminders-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .reminders-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          color: #2d3748;
          margin: 0 0 1rem 0;
          font-weight: 600;
        }

        .reminders-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .reminder-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: #f7fafc;
          border-radius: 8px;
          border-left: 4px solid;
          transition: all 0.2s;
        }

        .reminder-item:hover {
          background: #edf2f7;
          transform: translateX(2px);
        }

        .reminder-item.past {
          opacity: 0.6;
        }

        .reminder-icon {
          width: 40px;
          height: 40px;
          min-width: 40px;
          background: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4299e1;
        }

        .reminder-content {
          flex: 1;
          min-width: 0;
        }

        .reminder-title {
          font-size: 1rem;
          color: #2d3748;
          margin: 0 0 0.25rem 0;
          font-weight: 600;
        }

        .reminder-description {
          font-size: 0.875rem;
          color: #4a5568;
          margin: 0 0 0.5rem 0;
          line-height: 1.5;
        }

        .reminder-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #718096;
        }

        .reminder-assignee {
          font-weight: 500;
        }

        .meta-separator {
          color: #cbd5e0;
        }

        .reminder-time {
          font-weight: 500;
          color: #4299e1;
        }

        .reminder-repeat {
          background: #e0e7ff;
          color: #5a67d8;
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .reminder-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-icon-small {
          background: transparent;
          border: none;
          padding: 0.375rem;
          cursor: pointer;
          color: #a0aec0;
          transition: all 0.2s;
          border-radius: 4px;
        }

        .btn-icon-small:hover {
          background: white;
          color: #4a5568;
        }

        .btn-icon-small.btn-danger:hover {
          color: #e53e3e;
        }

        @media (max-width: 768px) {
          .reminder-item {
            flex-wrap: wrap;
          }

          .reminder-actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Reminders;