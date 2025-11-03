// src/components/Notes.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, X, StickyNote } from 'lucide-react';

function Notes({ apiUrl, user }) {
  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/notes`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleOpenModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content || ''
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        content: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingNote) {
        await axios.put(`${apiUrl}/notes/${editingNote.id}`, formData);
      } else {
        await axios.post(`${apiUrl}/notes`, formData);
      }

      setShowModal(false);
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Błąd podczas zapisywania notatki');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę notatkę?')) {
      try {
        await axios.delete(`${apiUrl}/notes/${noteId}`);
        fetchNotes();
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Przed chwilą';
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours} godz. temu`;
    if (diffDays < 7) return `${diffDays} dni temu`;
    
    return date.toLocaleDateString('pl-PL', { 
      day: 'numeric', 
      month: 'long',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getNoteColor = (index) => {
    const colors = [
      '#fef3c7', // yellow
      '#dbeafe', // blue
      '#fce7f3', // pink
      '#d1fae5', // green
      '#e0e7ff', // indigo
      '#fed7aa', // orange
      '#f3e8ff', // purple
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="notes-container">
      <div className="page-header">
        <h2>Notatki Rodzinne</h2>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus size={20} />
          Nowa notatka
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <StickyNote size={64} className="empty-icon" />
          <h3>Brak notatek</h3>
          <p>Dodaj pierwszą notatkę rodzinną</p>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            <Plus size={20} />
            Dodaj notatkę
          </button>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note, index) => (
            <div 
              key={note.id} 
              className="note-card"
              style={{ backgroundColor: getNoteColor(index) }}
            >
              <div className="note-header">
                <h3 className="note-title">{note.title}</h3>
                <div className="note-actions">
                  <button
                    onClick={() => handleOpenModal(note)}
                    className="btn-icon-tiny"
                    title="Edytuj"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="btn-icon-tiny btn-danger"
                    title="Usuń"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="note-content">
                {note.content ? (
                  <p>{note.content}</p>
                ) : (
                  <p className="note-empty">Brak treści</p>
                )}
              </div>

              <div className="note-footer">
                <div 
                  className="note-author"
                  style={{ backgroundColor: note.user_color }}
                >
                  {note.user_name?.charAt(0).toUpperCase()}
                </div>
                <span className="note-meta">
                  {note.user_name} • {formatDate(note.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingNote ? 'Edytuj notatkę' : 'Nowa notatka'}</h3>
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
                  placeholder="Tytuł notatki..."
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Treść</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Treść notatki..."
                  rows="10"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Anuluj
                </button>
                <button type="submit" className="btn-primary">
                  {editingNote ? 'Zapisz zmiany' : 'Dodaj notatkę'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .notes-container {
          max-width: 1400px;
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

        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .note-card {
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
          min-height: 220px;
          position: relative;
        }

        .note-card:hover {
          transform: translateY(-4px) rotate(-1deg);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
        }

        .note-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 20px;
          width: 40px;
          height: 20px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 0 0 20px 20px;
        }

        .note-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 0.5rem;
        }

        .note-title {
          font-size: 1.125rem;
          color: #2d3748;
          margin: 0;
          flex: 1;
          line-height: 1.4;
          word-break: break-word;
        }

        .note-actions {
          display: flex;
          gap: 0.25rem;
          flex-shrink: 0;
        }

        .btn-icon-tiny {
          background: rgba(255, 255, 255, 0.7);
          border: none;
          padding: 0.375rem;
          cursor: pointer;
          color: #4a5568;
          transition: all 0.2s;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-icon-tiny:hover {
          background: white;
          color: #2d3748;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .btn-icon-tiny.btn-danger:hover {
          color: #e53e3e;
        }

        .note-content {
          flex: 1;
          margin-bottom: 1rem;
        }

        .note-content p {
          font-size: 0.9375rem;
          color: #4a5568;
          line-height: 1.6;
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .note-empty {
          color: #a0aec0 !important;
          font-style: italic;
        }

        .note-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .note-author {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .note-meta {
          font-size: 0.75rem;
          color: #718096;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .modal-large {
          max-width: 600px;
        }

        @media (max-width: 640px) {
          .notes-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (min-width: 641px) and (max-width: 1024px) {
          .notes-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1025px) {
          .notes-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1400px) {
          .notes-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

export default Notes;