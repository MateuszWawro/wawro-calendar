import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';

export default function TodosScreen() {
  const [todos, setTodos] = useState([]);
  const [members, setMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ task: '', userId: null, dueDate: '' });

  useEffect(() => {
    fetchMembers();
    fetchTodos();
  }, []);

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

  const fetchTodos = async () => {
    try {
      const response = await api.get('/todos');
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handleAddTodo = async () => {
    if (!formData.task.trim()) {
      Alert.alert('Błąd', 'Podaj treść zadania');
      return;
    }

    try {
      await api.post('/todos', formData);
      setFormData({ task: '', userId: formData.userId, dueDate: '' });
      setShowAddModal(false);
      fetchTodos();
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się dodać zadania');
    }
  };

  const handleToggleTodo = async (todoId, currentCompleted) => {
    try {
      await api.patch(`/todos/${todoId}`, { completed: !currentCompleted });
      fetchTodos();
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    Alert.alert('Usuń zadanie', 'Czy na pewno chcesz usunąć to zadanie?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/todos/${todoId}`);
            fetchTodos();
          } catch (error) {
            Alert.alert('Błąd', 'Nie udało się usunąć zadania');
          }
        },
      },
    ]);
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  const renderTodo = ({ item: todo }) => {
    const member = members.find(m => m.id === todo.user_id);

    return (
      <View style={[styles.todoItem, todo.completed && styles.todoCompleted]}>
        <TouchableOpacity
          style={[styles.checkbox, todo.completed && styles.checkboxChecked]}
          onPress={() => handleToggleTodo(todo.id, todo.completed)}
        >
          {todo.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
        </TouchableOpacity>

        <View style={styles.todoContent}>
          <Text style={[styles.todoText, todo.completed && styles.todoTextCompleted]}>
            {todo.task}
          </Text>
          <View style={styles.todoMeta}>
            <View style={[styles.memberDot, { backgroundColor: member?.color || '#667eea' }]} />
            <Text style={styles.todoMetaText}>{member?.name}</Text>
            {todo.due_date && (
              <Text style={styles.todoMetaText}> • {new Date(todo.due_date).toLocaleDateString('pl-PL')}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity onPress={() => handleDeleteTodo(todo.id)}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={[...activeTodos, ...completedTodos]}
        renderItem={renderTodo}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          activeTodos.length > 0 && (
            <Text style={styles.sectionTitle}>Do zrobienia ({activeTodos.length})</Text>
          )
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={64} color="#cbd5e0" />
            <Text style={styles.emptyText}>Brak zadań</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nowe zadanie</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#2d3748" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Treść zadania"
              value={formData.task}
              onChangeText={(text) => setFormData({ ...formData, task: text })}
              multiline
              autoFocus
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
                  <Text>{member.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={handleAddTodo}>
              <Text style={styles.modalButtonText}>Dodaj zadanie</Text>
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
  listContent: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 10,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  todoCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#cbd5e0',
    borderRadius: 6,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#48bb78',
    borderColor: '#48bb78',
  },
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    color: '#2d3748',
    marginBottom: 4,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#a0aec0',
  },
  todoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  todoMetaText: {
    fontSize: 12,
    color: '#718096',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#718096',
    marginTop: 15,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
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