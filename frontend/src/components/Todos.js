// src/components/Todos.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Check, CheckSquare, Edit2, X, Calendar } from 'lucide-react';

function Todos({ apiUrl, members }) {
  const [todos, setTodos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({
    task: '',
    userId: members[0]?.id || null,
    dueDate: ''
  });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${apiUrl}/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handleOpenModal = (todo = null) => {
    if (todo) {
      setEditingTodo(todo);
      setFormData({
        task: todo.task,
        userId: todo.user_id,
        dueDate: todo.due_date || ''
      });
    } else {
      setEditingTodo(null);
      setFormData({
        task: '',
        userId: members[0]?.id || null,
        dueDate: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTodo) {
        await axios.put(`${apiUrl}/todos/${editingTodo.id}`, {
          ...formData,
          completed: editingTodo.completed
        });
      } else {
        await axios.post(`${apiUrl}/todos`, formData);
      }

      setShowModal(false);
      fetchTodos();
    } catch (error) {
      console.error('Error saving todo:', error);
      alert('Błąd podczas zapisywania zadania');
    }
  };

  const handleToggleTodo = async (todoId, currentCompleted) => {
    try {
      await axios.patch(`${apiUrl}/todos/${todoId}`, {
        completed: !currentCompleted
      });
      fetchTodos();
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    if (window.confirm('Czy na pewno chcesz usunąć to zadanie?')) {
      try {
        await axios.delete(`${apiUrl}/todos/${todoId}`);
        fetchTodos();
      } catch (error) {
        console.error('Error deleting todo:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Dziś';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Jutro';
    } else {
      return date.toLocaleDateString('pl-PL', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div className="todos-container">
      <div className="page-header">
        <h2>Zadania do Zrobienia</h2>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus size={20} />
          Nowe zadanie
        </button>
      </div>

      {todos.length === 0 ? (
        <div className="empty-state">
          <CheckSquare size={64} className="empty-icon" />
          <h3>Brak zadań</h3>
          <p>Dodaj pierwsze zadanie dla rodziny</p>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            <Plus size={20} />
            Dodaj zadanie
          </button>
        </div>
      ) : (
        <div className="todos-content">
          {/* Active Todos */}
          {activeTodos.length > 0 && (
            <div className="todos-section">
              <h3 className="section-title">
                Do zrobienia ({activeTodos.length})
              </h3>
              <div className="todos-list">
                {activeTodos.map(todo => {
                  const member = members.find(m => m.id === todo.user_id);
                  const overdue = isOverdue(todo.due_date);

                  return (
                    <div 
                      key={todo.id} 
                      className={`todo-item ${overdue ? 'overdue' : ''}`}
                      style={{ borderLeftColor: member?.color || '#3b82f6' }}
                    >
                      <button
                        onClick={() => handleToggleTodo(todo.id, todo.completed)}
                        className="todo-checkbox"
                      >
                        {todo.completed && <Check size={16} />}
                      </button>

                      <div className="todo-content">
                        <div className="todo-text">{todo.task}</div>
                        <div className="todo-meta">
                          <span className="todo-assignee">
                            {member?.name || 'Nieprzypisane'}
                          </span>
                          {todo.due_date && (
                            <>
                              <span className="meta-separator">•</span>
                              <span className={`todo-date ${overdue ? 'overdue-text' : ''}`}>
                                <Calendar size={14} />
                                {formatDate(todo.due_date)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="todo-actions">
                        <button
                          onClick={() => handleOpenModal(todo)}
                          className="btn-icon-small"
                          title="Edytuj"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
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

          {/* Completed Todos */}
          {completedTodos.length > 0 && (
            <div className="todos-section">
              <h3 className="section-title">
                Ukończone ({completedTodos.length})
              </h3>
              <div className="todos-list">
                {completedTodos.map(todo => {
                  const member = members.find(m => m.id === todo.user_id);

                  return (
                    <div 
                      key={todo.id} 
                      className="todo-item completed"
                      style={{ borderLeftColor: member?.color || '#3b82f6' }}
                    >
                      <button
                        onClick={() => handleToggleTodo(todo.id, todo.completed)}
                        className="todo-checkbox checked"
                      >
                        <Check size={16} />
                      </button>

                      <div className="todo-content">
                        <div className="todo-text">{todo.task}</div>
                        <div className="todo-meta">
                          <span className="todo-assignee">
                            {member?.name || 'Nieprzypisane'}
                          </span>
                        </div>
                      </div>

                      <div className="todo-actions">
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
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
              <h3>{editingTodo ? 'Edytuj zadanie' : 'Nowe zadanie'}</h3>
              <button onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Zadanie *</label>
                <textarea
                  value={formData.task}
                  onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                  placeholder="Co trzeba zrobić?"
                  required
                  rows="3"
                  autoFocus
                />
              </div>

              <div className="form-row">
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

                <div className="form-group">
                  <label>Termin</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Anuluj
                </button>
                <button type="submit" className="btn-primary">
                  {editingTodo ? 'Zapisz zmiany' : 'Dodaj zadanie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .todos-container {
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

        .todos-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .todos-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          font-size: 1.125rem;
          color: #2d3748;
          margin: 0 0 1rem 0;
          font-weight: 600;
        }

        .todos-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .todo-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f7fafc;
          border-radius: 8px;
          border-left: 4px solid;
          transition: all 0.2s;
        }

        .todo-item:hover {
          background: #edf2f7;
          transform: translateX(2px);
        }

        .todo-item.completed {
          opacity: 0.6;
        }

        .todo-item.overdue {
          background: #fff5f5;
        }

        .todo-checkbox {
          width: 24px;
          height: 24px;
          min-width: 24px;
          border: 2px solid #cbd5e0;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .todo-checkbox:hover {
          border-color: #4299e1;
        }

        .todo-checkbox.checked {
          background: #48bb78;
          border-color: #48bb78;
          color: white;
        }

        .todo-content {
          flex: 1;
          min-width: 0;
        }

        .todo-text {
          font-size: 1rem;
          color: #2d3748;
          margin-bottom: 0.25rem;
        }

        .todo-item.completed .todo-text {
          text-decoration: line-through;
          color: #a0aec0;
        }

        .todo-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #718096;
        }

        .todo-assignee {
          font-weight: 500;
        }

        .meta-separator {
          color: #cbd5e0;
        }

        .todo-date {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .overdue-text {
          color: #e53e3e;
          font-weight: 600;
        }

        .todo-actions {
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
          .todo-item {
            flex-wrap: wrap;
          }

          .todo-actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Todos;