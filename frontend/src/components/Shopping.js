// src/components/Shopping.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Check, ShoppingBag, Edit2, X } from 'lucide-react';

function Shopping({ apiUrl, user }) {
  const [lists, setLists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [listName, setListName] = useState('');
  const [itemText, setItemText] = useState('');
  const [listItems, setListItems] = useState({});

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await axios.get(`${apiUrl}/shopping`);
      setLists(response.data);
      // Fetch items for each list
      response.data.forEach(list => {
        fetchListItems(list.id);
      });
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const fetchListItems = async (listId) => {
    try {
      const response = await axios.get(`${apiUrl}/shopping/${listId}/items`);
      setListItems(prev => ({
        ...prev,
        [listId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!listName.trim()) return;

    try {
      await axios.post(`${apiUrl}/shopping`, { name: listName });
      setListName('');
      setShowModal(false);
      fetchLists();
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Błąd podczas tworzenia listy');
    }
  };

  const handleDeleteList = async (listId) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę listę zakupów?')) {
      try {
        await axios.delete(`${apiUrl}/shopping/${listId}`);
        fetchLists();
      } catch (error) {
        console.error('Error deleting list:', error);
      }
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemText.trim() || !selectedList) return;

    try {
      await axios.post(`${apiUrl}/shopping/${selectedList}/items`, { text: itemText });
      setItemText('');
      setShowItemModal(false);
      fetchListItems(selectedList);
      fetchLists();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Błąd podczas dodawania produktu');
    }
  };

  const handleToggleItem = async (itemId, currentChecked) => {
    try {
      await axios.patch(`${apiUrl}/shopping/items/${itemId}`, { checked: !currentChecked });
      // Refresh items for all lists
      Object.keys(listItems).forEach(listId => {
        fetchListItems(parseInt(listId));
      });
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const handleDeleteItem = async (listId, itemId) => {
    try {
      await axios.delete(`${apiUrl}/shopping/items/${itemId}`);
      fetchListItems(listId);
      fetchLists();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const openAddItemModal = (listId) => {
    setSelectedList(listId);
    setItemText('');
    setShowItemModal(true);
  };

  return (
    <div className="shopping-container">
      <div className="page-header">
        <h2>Listy Zakupów</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={20} />
          Nowa lista
        </button>
      </div>

      {lists.length === 0 ? (
        <div className="empty-state">
          <ShoppingBag size={64} className="empty-icon" />
          <h3>Brak list zakupów</h3>
          <p>Utwórz swoją pierwszą listę zakupów</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={20} />
            Utwórz listę
          </button>
        </div>
      ) : (
        <div className="shopping-lists">
          {lists.map(list => {
            const items = listItems[list.id] || [];
            const uncheckedCount = items.filter(item => !item.checked).length;
            const progress = items.length > 0 
              ? ((list.checked_count / list.item_count) * 100).toFixed(0)
              : 0;

            return (
              <div key={list.id} className="shopping-list-card">
                <div className="list-header">
                  <div className="list-title">
                    <ShoppingBag size={24} />
                    <div>
                      <h3>{list.name}</h3>
                      <p className="list-stats">
                        {uncheckedCount > 0 
                          ? `${uncheckedCount} ${uncheckedCount === 1 ? 'produkt' : 'produkty/ów'} do kupienia`
                          : 'Wszystko kupione! ✓'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="list-actions">
                    <button 
                      onClick={() => openAddItemModal(list.id)}
                      className="btn-icon"
                      title="Dodaj produkt"
                    >
                      <Plus size={20} />
                    </button>
                    <button 
                      onClick={() => handleDeleteList(list.id)}
                      className="btn-icon btn-danger"
                      title="Usuń listę"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%` }}
                    ></div>
                    <span className="progress-text">{progress}%</span>
                  </div>
                )}

                <div className="shopping-items">
                  {items.length === 0 ? (
                    <p className="empty-list">Lista jest pusta. Dodaj pierwszy produkt!</p>
                  ) : (
                    items.map(item => (
                      <div 
                        key={item.id} 
                        className={`shopping-item ${item.checked ? 'checked' : ''}`}
                      >
                        <button
                          onClick={() => handleToggleItem(item.id, item.checked)}
                          className="checkbox"
                        >
                          {item.checked && <Check size={16} />}
                        </button>
                        <span className="item-text">{item.text}</span>
                        {item.added_by_name && (
                          <span className="item-meta">
                            dodane przez {item.added_by_name}
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteItem(list.id, item.id)}
                          className="btn-icon-small btn-danger"
                          title="Usuń"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for creating new list */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nowa lista zakupów</h3>
              <button onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateList} className="modal-form">
              <div className="form-group">
                <label>Nazwa listy</label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="np. Biedronka, Lidl, Apteka..."
                  required
                  autoFocus
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Anuluj
                </button>
                <button type="submit" className="btn-primary">
                  Utwórz listę
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for adding item to list */}
      {showItemModal && (
        <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Dodaj produkt</h3>
              <button onClick={() => setShowItemModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="modal-form">
              <div className="form-group">
                <label>Nazwa produktu</label>
                <input
                  type="text"
                  value={itemText}
                  onChange={(e) => setItemText(e.target.value)}
                  placeholder="np. Mleko, Chleb, Jajka..."
                  required
                  autoFocus
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowItemModal(false)} className="btn-secondary">
                  Anuluj
                </button>
                <button type="submit" className="btn-primary">
                  Dodaj produkt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .shopping-container {
          max-width: 1200px;
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

        .shopping-lists {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .shopping-list-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .shopping-list-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .list-title {
          display: flex;
          gap: 0.75rem;
          flex: 1;
        }

        .list-title h3 {
          font-size: 1.25rem;
          color: #2d3748;
          margin: 0 0 0.25rem 0;
        }

        .list-stats {
          font-size: 0.875rem;
          color: #718096;
          margin: 0;
        }

        .list-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-icon {
          background: #f7fafc;
          border: none;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          color: #4a5568;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-icon:hover {
          background: #edf2f7;
          color: #2d3748;
        }

        .btn-icon.btn-danger {
          color: #e53e3e;
        }

        .btn-icon.btn-danger:hover {
          background: #fff5f5;
        }

        .progress-bar {
          position: relative;
          height: 8px;
          background: #edf2f7;
          border-radius: 4px;
          margin-bottom: 1rem;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #48bb78, #38a169);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          position: absolute;
          top: -20px;
          right: 0;
          font-size: 0.75rem;
          color: #718096;
          font-weight: 600;
        }

        .shopping-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .empty-list {
          text-align: center;
          color: #a0aec0;
          font-size: 0.875rem;
          padding: 1rem;
        }

        .shopping-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #f7fafc;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .shopping-item:hover {
          background: #edf2f7;
        }

        .shopping-item.checked {
          opacity: 0.6;
        }

        .checkbox {
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

        .shopping-item.checked .checkbox {
          background: #48bb78;
          border-color: #48bb78;
          color: white;
        }

        .item-text {
          flex: 1;
          color: #2d3748;
        }

        .shopping-item.checked .item-text {
          text-decoration: line-through;
          color: #a0aec0;
        }

        .item-meta {
          font-size: 0.75rem;
          color: #a0aec0;
        }

        .btn-icon-small {
          background: transparent;
          border: none;
          padding: 0.25rem;
          cursor: pointer;
          color: #cbd5e0;
          transition: color 0.2s;
        }

        .btn-icon-small:hover {
          color: #e53e3e;
        }

        @media (max-width: 768px) {
          .shopping-lists {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Shopping;