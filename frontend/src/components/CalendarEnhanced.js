// frontend/src/components/CalendarEnhanced.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronLeft, ChevronRight, Plus, X, Edit2, 
  Filter, Download, Upload, Link as LinkIcon,
  Eye, EyeOff, Search, Calendar as CalIcon
} from 'lucide-react';
import './CalendarEnhanced.css'; // Import zewnętrznego pliku CSS

function CalendarEnhanced({ apiUrl, members }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  // Filtry
  const [filters, setFilters] = useState({
    members: members.map(m => m.id),
    searchTerm: ''
  });

  const [compactMode, setCompactMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    userId: members[0]?.id || null
  });

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  // Funkcja pomocnicza do pobierania tokena
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchEvents = async () => {
    try {
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const year = currentDate.getFullYear();
      const response = await axios.get(`${apiUrl}/events`, {
        params: { month, year },
        headers: getAuthHeader()
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Filtrowane wydarzenia
  const filteredEvents = events.filter(event => {
    if (!filters.members.includes(event.user_id)) {
      return false;
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return (
        event.title.toLowerCase().includes(searchLower) ||
        (event.description && event.description.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  const toggleMemberFilter = (memberId) => {
    setFilters(prev => ({
      ...prev,
      members: prev.members.includes(memberId)
        ? prev.members.filter(id => id !== memberId)
        : [...prev.members, memberId]
    }));
  };

  const selectAllMembers = () => {
    setFilters(prev => ({
      ...prev,
      members: members.map(m => m.id)
    }));
  };

  const deselectAllMembers = () => {
    setFilters(prev => ({
      ...prev,
      members: []
    }));
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const handleAddEvent = (day) => {
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toISOString().split('T')[0];
    
    setFormData({
      title: '',
      description: '',
      eventDate: selectedDate,
      eventTime: '',
      userId: members[0]?.id || null
    });
    setEditingEvent(null);
    setShowModal(true);
  };

  const handleEditEvent = (event) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const createdBy = event.created_by || event.user_id;
    const canEdit = createdBy === currentUser.id || currentUser.role === 'admin';
    
    if (!canEdit) {
      alert('Nie masz uprawnień do edycji tego wydarzenia.');
      return;
    }
    
    setFormData({
      title: event.title,
      description: event.description || '',
      eventDate: event.event_date,
      eventTime: event.event_time || '',
      userId: event.user_id
    });
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingEvent) {
        await axios.put(`${apiUrl}/events/${editingEvent.id}`, formData, {
          headers: getAuthHeader()
        });
      } else {
        await axios.post(`${apiUrl}/events`, formData, {
          headers: getAuthHeader()
        });
      }
      
      setShowModal(false);
      fetchEvents();
      setFormData({
        title: '',
        description: '',
        eventDate: '',
        eventTime: '',
        userId: members[0]?.id || null
      });
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Błąd podczas zapisywania wydarzenia');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Czy na pewno chcesz usunąć to wydarzenie?')) {
      try {
        await axios.delete(`${apiUrl}/events/${eventId}`, {
          headers: getAuthHeader()
        });
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        if (error.response?.status === 403) {
          alert('Nie masz uprawnień do usunięcia tego wydarzenia.');
        } else {
          alert('Błąd podczas usuwania wydarzenia');
        }
      }
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth();
    const days = [];
    const monthNames = [
      'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
      'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];
    const dayNames = ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb'];
    const currentUser = JSON.parse(localStorage.getItem('user'));

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter(e => e.event_date === dateStr);
      const isToday = 
        day === new Date().getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${compactMode ? 'compact' : ''}`}
          onClick={() => handleAddEvent(day)}
        >
          <div className="day-number">{day}</div>
          <div className="day-events">
            {dayEvents.slice(0, compactMode ? 2 : 5).map(event => {
              const member = members.find(m => m.id === event.user_id);
              const createdBy = event.created_by || event.user_id;
              const canEdit = createdBy === currentUser.id || currentUser.role === 'admin';
              
              return (
                <div
                  key={event.id}
                  className="event-item"
                  style={{ borderLeftColor: member?.color || '#3b82f6' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditEvent(event);
                  }}
                  title={`${event.title}${event.description ? `\n${event.description}` : ''}`}
                >
                  {event.event_time && !compactMode && (
                    <span className="event-time">{event.event_time}</span>
                  )}
                  <span className="event-title">{event.title}</span>
                  
                  {canEdit && (
                    <button
                      className="event-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                      title="Usuń wydarzenie"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })}
            {dayEvents.length > (compactMode ? 2 : 5) && (
              <div className="more-events">
                +{dayEvents.length - (compactMode ? 2 : 5)} więcej
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="calendar-container">
        {/* Toolbar */}
        <div className="calendar-toolbar">
          <div className="toolbar-left">
            <button 
              onClick={() => setShowFilterModal(true)} 
              className={`btn-filter ${filters.members.length < members.length ? 'active' : ''}`}
            >
              <Filter size={18} />
              Filtry
              {filters.members.length < members.length && (
                <span className="filter-count">{filters.members.length}/{members.length}</span>
              )}
            </button>
            
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Szukaj wydarzeń..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="search-input"
              />
            </div>
          </div>

          <div className="toolbar-right">
            <button 
              onClick={() => setCompactMode(!compactMode)} 
              className="btn-toolbar" 
              title={compactMode ? "Widok pełny" : "Widok kompaktowy"}
            >
              {compactMode ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
            
            <button 
              onClick={() => setShowIntegrationsModal(true)} 
              className="btn-toolbar" 
              title="Integracje kalendarzy"
            >
              <LinkIcon size={18} />
            </button>
          </div>
        </div>

        {/* Header kalendarza */}
        <div className="calendar-header">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
            <ChevronLeft size={24} />
          </button>
          <h2>{monthNames[month]} {year}</h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="calendar-weekdays">
          {dayNames.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {days}
        </div>

        {/* Legenda */}
        <div className="calendar-legend">
          {members.filter(m => filters.members.includes(m.id)).map(member => (
            <div key={member.id} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: member.color }}></div>
              <span>{member.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderCalendar()}

      {/* Modal dodawania/edycji */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEvent ? 'Edytuj wydarzenie' : 'Nowe wydarzenie'}</h3>
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
                  required
                  placeholder="Wizyta u lekarza"
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
                  <label>Data *</label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Godzina</label>
                  <input
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                  />
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
                  {editingEvent ? 'Zapisz zmiany' : 'Dodaj wydarzenie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal filtrów */}
      {showFilterModal && (
        <FilterModal
          filters={filters}
          setFilters={setFilters}
          members={members}
          onClose={() => setShowFilterModal(false)}
          toggleMemberFilter={toggleMemberFilter}
          selectAllMembers={selectAllMembers}
          deselectAllMembers={deselectAllMembers}
        />
      )}

      {/* Modal integracji */}
      {showIntegrationsModal && (
        <IntegrationsModal
          apiUrl={apiUrl}
          onClose={() => setShowIntegrationsModal(false)}
          getAuthHeader={getAuthHeader}
        />
      )}
    </div>
  );
}

// Komponent Modal Filtrów
function FilterModal({ filters, setFilters, members, onClose, toggleMemberFilter, selectAllMembers, deselectAllMembers }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Filtruj wydarzenia</h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="filter-content">
          <div className="filter-section">
            <div className="filter-section-header">
              <h4>Członkowie rodziny</h4>
              <div className="filter-actions">
                <button onClick={selectAllMembers} className="btn-link">
                  Zaznacz wszystkich
                </button>
                <span>|</span>
                <button onClick={deselectAllMembers} className="btn-link">
                  Odznacz wszystkich
                </button>
              </div>
            </div>

            <div className="members-filter">
              {members.map(member => (
                <label key={member.id} className="member-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.members.includes(member.id)}
                    onChange={() => toggleMemberFilter(member.id)}
                  />
                  <div 
                    className="member-color" 
                    style={{ backgroundColor: member.color }}
                  ></div>
                  <span>{member.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-primary">
            Zastosuj filtry
          </button>
        </div>
      </div>
    </div>
  );
}

// Komponent Modal Integracji
function IntegrationsModal({ apiUrl, onClose, getAuthHeader }) {
  const [feedUrl, setFeedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  // Sprawdź status połączenia przy otwarciu
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await axios.get(`${apiUrl}/calendar/integrations/status`, {
        headers: getAuthHeader()
      });
      setGoogleConnected(response.data.google.connected);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const response = await axios.get(`${apiUrl}/calendar/google/auth`, {
        headers: getAuthHeader()
      });
      // Otwórz w nowym oknie
      const authWindow = window.open(response.data.authUrl, '_blank', 'width=600,height=700');
      
      // Nasłuchuj na zamknięcie okna
      const checkWindow = setInterval(() => {
        if (authWindow && authWindow.closed) {
          clearInterval(checkWindow);
          checkConnectionStatus(); // Odśwież status
          alert('Sprawdź czy autoryzacja przebiegła pomyślnie. Jeśli tak, możesz teraz importować wydarzenia!');
        }
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      alert('Błąd podczas łączenia z Google Calendar');
    }
  };

  const handleGoogleImport = async () => {
    if (!googleConnected) {
      alert('Najpierw połącz się z Google Calendar!');
      return;
    }

    setLoading(true);
    setImportStatus('Importowanie...');
    
    try {
      const response = await axios.post(`${apiUrl}/calendar/google/import`, {}, {
        headers: getAuthHeader()
      });
      setImportStatus(`✅ Zaimportowano ${response.data.imported} wydarzeń (pominięto ${response.data.skipped} duplikatów)`);
      
      // Odśwież kalendarz po 2 sekundach
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error importing:', error);
      setImportStatus(`❌ Błąd: ${error.response?.data?.error || 'Nieznany błąd'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    if (!window.confirm('Czy na pewno chcesz rozłączyć Google Calendar?')) {
      return;
    }

    try {
      await axios.delete(`${apiUrl}/calendar/google/disconnect`, {
        headers: getAuthHeader()
      });
      setGoogleConnected(false);
      alert('Rozłączono z Google Calendar');
    } catch (error) {
      console.error('Error:', error);
      alert('Błąd podczas rozłączania');
    }
  };

  const handleGenerateFeed = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/calendar/generate-feed-token`, {}, {
        headers: getAuthHeader()
      });
      setFeedUrl(response.data.feedUrl);
    } catch (error) {
      console.error('Error:', error);
      alert('Błąd podczas generowania linku');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Skopiowano do schowka!');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Integracje kalendarzy</h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="integrations-content">
          {/* Google Calendar */}
          <div className="integration-card">
            <div className="integration-header">
              <CalIcon size={24} style={{ color: '#4285F4' }} />
              <div>
                <h4>Google Calendar</h4>
                <p>Synchronizuj wydarzenia z Google Calendar</p>
                {googleConnected && (
                  <span className="status-badge connected">✓ Połączono</span>
                )}
              </div>
            </div>
            
            <div className="integration-actions">
              {!googleConnected ? (
                <button onClick={handleGoogleAuth} className="btn-primary">
                  <LinkIcon size={18} />
                  Połącz z Google
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleGoogleImport} 
                    className="btn-primary"
                    disabled={loading}
                  >
                    <Download size={18} />
                    {loading ? 'Importowanie...' : 'Importuj wydarzenia'}
                  </button>
                  <button 
                    onClick={handleGoogleDisconnect} 
                    className="btn-secondary"
                  >
                    Rozłącz
                  </button>
                </>
              )}
            </div>

            {importStatus && (
              <div className={`import-status ${importStatus.includes('✅') ? 'success' : 'error'}`}>
                {importStatus}
              </div>
            )}

            {googleConnected && (
              <div className="help-text">
                💡 Import pobierze wydarzenia z ostatnich 30 dni i kolejnych 90 dni
              </div>
            )}
          </div>

          {/* iCloud / Universal Feed */}
          <div className="integration-card">
            <div className="integration-header">
              <CalIcon size={24} style={{ color: '#000' }} />
              <div>
                <h4>iCloud / Inne kalendarze</h4>
                <p>Subskrybuj kalendarz w dowolnej aplikacji</p>
              </div>
            </div>
            
            {!feedUrl ? (
              <button 
                onClick={handleGenerateFeed} 
                className="btn-primary"
                disabled={loading}
              >
                <Download size={18} />
                {loading ? 'Generowanie...' : 'Wygeneruj link'}
              </button>
            ) : (
              <div className="feed-url-box">
                <input
                  type="text"
                  value={feedUrl}
                  readOnly
                  className="feed-url-input"
                />
                <button 
                  onClick={() => copyToClipboard(feedUrl)}
                  className="btn-copy"
                >
                  Kopiuj
                </button>
              </div>
            )}

            {feedUrl && (
              <div className="feed-instructions">
                <h5>Jak dodać do kalendarza:</h5>
                <ul>
                  <li><strong>iOS/Mac:</strong> Ustawienia → Konta → Dodaj konto → Inne → Subskrybuj kalendarz</li>
                  <li><strong>Google:</strong> Inne kalendarze → Z adresu URL</li>
                  <li><strong>Outlook:</strong> Kalendarz → Dodaj kalendarz → Z Internetu</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarEnhanced;