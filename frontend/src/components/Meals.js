// src/components/Meals.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, X, UtensilsCrossed, ExternalLink } from 'lucide-react';

const DAYS_OF_WEEK = [
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
  'Niedziela'
];

function Meals({ apiUrl }) {
  const [meals, setMeals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [formData, setFormData] = useState({
    dayOfWeek: DAYS_OF_WEEK[0],
    meal: '',
    recipeUrl: ''
  });

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await axios.get(`${apiUrl}/meals`);
      setMeals(response.data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  const handleOpenModal = (day = null, meal = null) => {
    if (meal) {
      setEditingMeal(meal);
      setFormData({
        dayOfWeek: meal.day_of_week,
        meal: meal.meal,
        recipeUrl: meal.recipe_url || ''
      });
    } else {
      setEditingMeal(null);
      setFormData({
        dayOfWeek: day || DAYS_OF_WEEK[0],
        meal: '',
        recipeUrl: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingMeal) {
        await axios.put(`${apiUrl}/meals/${editingMeal.id}`, formData);
      } else {
        await axios.post(`${apiUrl}/meals`, formData);
      }

      setShowModal(false);
      fetchMeals();
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Błąd podczas zapisywania posiłku');
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten posiłek?')) {
      try {
        await axios.delete(`${apiUrl}/meals/${mealId}`);
        fetchMeals();
      } catch (error) {
        console.error('Error deleting meal:', error);
      }
    }
  };

  const getMealsForDay = (day) => {
    return meals.filter(m => m.day_of_week === day);
  };

  return (
    <div className="meals-container">
      <div className="page-header">
        <h2>Planner Posiłków</h2>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus size={20} />
          Dodaj posiłek
        </button>
      </div>

      <div className="meals-grid">
        {DAYS_OF_WEEK.map(day => {
          const dayMeals = getMealsForDay(day);
          const isToday = new Date().toLocaleDateString('pl-PL', { weekday: 'long' }) === day;

          return (
            <div 
              key={day} 
              className={`day-card ${isToday ? 'today' : ''}`}
            >
              <div className="day-header">
                <h3>
                  {day}
                  {isToday && <span className="today-badge">Dziś</span>}
                </h3>
                <button
                  onClick={() => handleOpenModal(day)}
                  className="btn-icon-small"
                  title="Dodaj posiłek"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="day-meals">
                {dayMeals.length === 0 ? (
                  <div className="no-meals">
                    <UtensilsCrossed size={32} className="no-meals-icon" />
                    <p>Brak zaplanowanych posiłków</p>
                    <button
                      onClick={() => handleOpenModal(day)}
                      className="btn-add-meal"
                    >
                      Dodaj posiłek
                    </button>
                  </div>
                ) : (
                  dayMeals.map(meal => (
                    <div key={meal.id} className="meal-item">
                      <div className="meal-content">
                        <div className="meal-name">{meal.meal}</div>
                        {meal.recipe_url && (
                          <a
                            href={meal.recipe_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="recipe-link"
                          >
                            <ExternalLink size={14} />
                            Przepis
                          </a>
                        )}
                      </div>
                      <div className="meal-actions">
                        <button
                          onClick={() => handleOpenModal(day, meal)}
                          className="btn-icon-tiny"
                          title="Edytuj"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="btn-icon-tiny btn-danger"
                          title="Usuń"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingMeal ? 'Edytuj posiłek' : 'Dodaj posiłek'}</h3>
              <button onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Dzień tygodnia *</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  required
                >
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Posiłek *</label>
                <textarea
                  value={formData.meal}
                  onChange={(e) => setFormData({ ...formData, meal: e.target.value })}
                  placeholder="np. Spaghetti Carbonara, Kurczak z warzywami..."
                  required
                  rows="3"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Link do przepisu (opcjonalnie)</label>
                <input
                  type="url"
                  value={formData.recipeUrl}
                  onChange={(e) => setFormData({ ...formData, recipeUrl: e.target.value })}
                  placeholder="https://..."
                />
                <small className="form-hint">
                  Dodaj link do przepisu z internetu
                </small>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Anuluj
                </button>
                <button type="submit" className="btn-primary">
                  {editingMeal ? 'Zapisz zmiany' : 'Dodaj posiłek'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .meals-container {
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

        .meals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .day-card {
          background: white;
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .day-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .day-card.today {
          border: 2px solid #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }

        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #edf2f7;
        }

        .day-header h3 {
          font-size: 1.125rem;
          color: #2d3748;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .today-badge {
          background: #f59e0b;
          color: white;
          font-size: 0.625rem;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .btn-icon-small {
          background: #f7fafc;
          border: none;
          padding: 0.375rem;
          border-radius: 6px;
          cursor: pointer;
          color: #4a5568;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-icon-small:hover {
          background: #edf2f7;
          color: #2d3748;
        }

        .day-meals {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          min-height: 100px;
        }

        .no-meals {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          text-align: center;
        }

        .no-meals-icon {
          color: #cbd5e0;
          margin-bottom: 0.5rem;
        }

        .no-meals p {
          color: #a0aec0;
          font-size: 0.875rem;
          margin: 0 0 0.75rem 0;
        }

        .btn-add-meal {
          background: transparent;
          border: 2px dashed #cbd5e0;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          color: #718096;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-add-meal:hover {
          border-color: #4299e1;
          color: #4299e1;
          background: #ebf8ff;
        }

        .meal-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 0.75rem;
          background: #f7fafc;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .meal-item:hover {
          background: #edf2f7;
        }

        .meal-content {
          flex: 1;
          min-width: 0;
        }

        .meal-name {
          font-size: 0.9375rem;
          color: #2d3748;
          margin-bottom: 0.25rem;
          line-height: 1.4;
        }

        .recipe-link {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: #4299e1;
          text-decoration: none;
          transition: color 0.2s;
        }

        .recipe-link:hover {
          color: #2b6cb0;
          text-decoration: underline;
        }

        .meal-actions {
          display: flex;
          gap: 0.25rem;
          margin-left: 0.5rem;
        }

        .btn-icon-tiny {
          background: transparent;
          border: none;
          padding: 0.25rem;
          cursor: pointer;
          color: #cbd5e0;
          transition: all 0.2s;
          border-radius: 4px;
        }

        .btn-icon-tiny:hover {
          background: white;
          color: #4a5568;
        }

        .btn-icon-tiny.btn-danger:hover {
          color: #e53e3e;
        }

        .form-hint {
          display: block;
          font-size: 0.75rem;
          color: #a0aec0;
          margin-top: 0.25rem;
        }

        @media (max-width: 768px) {
          .meals-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (min-width: 769px) and (max-width: 1200px) {
          .meals-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1201px) {
          .meals-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

export default Meals;