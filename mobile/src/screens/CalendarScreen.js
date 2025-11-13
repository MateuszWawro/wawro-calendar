import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';

const MONTHS = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

const WEEKDAYS = ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb'];

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventTime: '',
    userId: null,
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/family/members');
      setMembers(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, userId: response.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const year = currentDate.getFullYear();
      const response = await api.get('/events', {
        params: { month, year },
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
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

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayPress = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setShowAddModal(true);
  };

  const handleAddEvent = async () => {
    if (!formData.title) {
      Alert.alert('Błąd', 'Podaj tytuł wydarzenia');
      return;
    }

    try {
      await api.post('/events', {
        ...formData,
        eventDate: selectedDate,
      });
      setShowAddModal(false);
      setFormData({ title: '', description: '', eventTime: '', userId: formData.userId });
      fetchEvents();
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się dodać wydarzenia');
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth();
    const days = [];
    const today = new Date();

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.event_date === dateStr);
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      days.push(
        <TouchableOpacity
          key={day}
          style={[styles.day, isToday && styles.today]}
          onPress={() => handleDayPress(day)}
        >
          <Text style={[styles.dayNumber, isToday && styles.todayText]}>{day}</Text>
          <View style={styles.eventsContainer}>
            {dayEvents.slice(0, 2).map((event, idx) => {
              const member = members.find(m => m.id === event.user_id);
              return (
                <View
                  key={idx}
                  style={[
                    styles.eventDot,
                    { backgroundColor: member?.color || '#667eea' }
                  ]}
                />
              );
            })}
            {dayEvents.length > 2 && (
              <Text style={styles.moreEvents}>+{dayEvents.length - 2}</Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePreviousMonth}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity onPress={handleNextMonth}>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Weekdays */}
        <View style={styles.weekdays}>
          {WEEKDAYS.map(day => (
            <Text key={day} style={styles.weekday}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendar}>
          {renderCalendar()}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Członkowie rodziny:</Text>
          {members.map(member => (
            <View key={member.id} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: member.color }]} />
              <Text style={styles.legendText}>{member.name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Event Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nowe wydarzenie</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#2d3748" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Tytuł wydarzenia"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Opis (opcjonalnie)"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Godzina (HH:MM)"
              value={formData.eventTime}
              onChangeText={(text) => setFormData({ ...formData, eventTime: text })}
            />

            <Text style={styles.modalLabel}>Dla kogo:</Text>
            <View style={styles.memberPicker}>
              {members.map(member => (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.memberOption,
                    formData.userId === member.id && styles.memberOptionSelected
                  ]}
                  onPress={() => setFormData({ ...formData, userId: member.id })}
                >
                  <View style={[styles.memberColor, { backgroundColor: member.color }]} />
                  <Text style={styles.memberName}>{member.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={handleAddEvent}>
              <Text style={styles.modalButtonText}>Dodaj wydarzenie</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  weekdays: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    padding: 2,
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  day: {
    width: '14.28%',
    aspectRatio: 1,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    padding: 2,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  today: {
    backgroundColor: '#ebf4ff',
    borderColor: '#667eea',
    borderWidth: 2,
  },
  dayNumber: {
    fontSize: 11,
    fontWeight: '500',
    color: '#2d3748',
  },
  todayText: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  eventsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 2,
    marginBottom: 2,
  },
  moreEvents: {
    fontSize: 8,
    color: '#718096',
  },
  legend: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#4a5568',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 10,
  },
  memberPicker: {
    marginBottom: 20,
  },
  memberOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 10,
  },
  memberOptionSelected: {
    borderColor: '#667eea',
    backgroundColor: '#ebf4ff',
  },
  memberColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
  },
  memberName: {
    fontSize: 16,
    color: '#2d3748',
  },
  modalButton: {
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});