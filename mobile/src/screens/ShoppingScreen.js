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

export default function ShoppingScreen() {
  const [lists, setLists] = useState([]);
  const [showAddListModal, setShowAddListModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [listName, setListName] = useState('');
  const [itemText, setItemText] = useState('');
  const [listItems, setListItems] = useState({});

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await api.get('/shopping');
      setLists(response.data);
      response.data.forEach(list => fetchListItems(list.id));
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const fetchListItems = async (listId) => {
    try {
      const response = await api.get(`/shopping/${listId}/items`);
      setListItems(prev => ({ ...prev, [listId]: response.data }));
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleCreateList = async () => {
    if (!listName.trim()) {
      Alert.alert('Błąd', 'Podaj nazwę listy');
      return;
    }

    try {
      await api.post('/shopping', { name: listName });
      setListName('');
      setShowAddListModal(false);
      fetchLists();
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się utworzyć listy');
    }
  };

  const handleAddItem = async () => {
    if (!itemText.trim() || !selectedList) {
      Alert.alert('Błąd', 'Podaj nazwę produktu');
      return;
    }

    try {
      await api.post(`/shopping/${selectedList}/items`, { text: itemText });
      setItemText('');
      setShowAddItemModal(false);
      fetchListItems(selectedList);
      fetchLists();
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się dodać produktu');
    }
  };

  const handleToggleItem = async (itemId, currentChecked) => {
    try {
      await api.patch(`/shopping/items/${itemId}`, { checked: !currentChecked });
      Object.keys(listItems).forEach(listId => fetchListItems(parseInt(listId)));
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const handleDeleteItem = async (listId, itemId) => {
    try {
      await api.delete(`/shopping/items/${itemId}`);
      fetchListItems(listId);
      fetchLists();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleDeleteList = async (listId) => {
    Alert.alert(
      'Usuń listę',
      'Czy na pewno chcesz usunąć tę listę zakupów?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/shopping/${listId}`);
              fetchLists();
            } catch (error) {
              Alert.alert('Błąd', 'Nie udało się usunąć listy');
            }
          },
        },
      ]
    );
  };

  const renderList = ({ item: list }) => {
    const items = listItems[list.id] || [];
    const uncheckedCount = items.filter(item => !item.checked).length;
    const progress = list.item_count > 0
      ? ((list.checked_count / list.item_count) * 100).toFixed(0)
      : 0;

    return (
      <View style={styles.listCard}>
        <View style={styles.listHeader}>
          <View style={styles.listTitle}>
            <Ionicons name="cart" size={24} color="#667eea" />
            <View style={styles.listInfo}>
              <Text style={styles.listName}>{list.name}</Text>
              <Text style={styles.listStats}>
                {uncheckedCount > 0
                  ? `${uncheckedCount} do kupienia`
                  : 'Wszystko kupione ✓'}
              </Text>
            </View>
          </View>
          <View style={styles.listActions}>
            <TouchableOpacity
              onPress={() => {
                setSelectedList(list.id);
                setShowAddItemModal(true);
              }}
            >
              <Ionicons name="add-circle" size={28} color="#667eea" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteList(list.id)}>
              <Ionicons name="trash" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {items.length > 0 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        )}

        {items.length === 0 ? (
          <Text style={styles.emptyList}>Lista jest pusta</Text>
        ) : (
          <View style={styles.itemsList}>
            {items.map(item => (
              <View key={item.id} style={[styles.item, item.checked && styles.itemChecked]}>
                <TouchableOpacity
                  style={[styles.checkbox, item.checked && styles.checkboxChecked]}
                  onPress={() => handleToggleItem(item.id, item.checked)}
                >
                  {item.checked && <Ionicons name="checkmark" size={16} color="#fff" />}
                </TouchableOpacity>
                <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
                  {item.text}
                </Text>
                <TouchableOpacity onPress={() => handleDeleteItem(list.id, item.id)}>
                  <Ionicons name="close" size={20} color="#cbd5e0" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={lists}
        renderItem={renderList}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color="#cbd5e0" />
            <Text style={styles.emptyText}>Brak list zakupów</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowAddListModal(true)}
            >
              <Text style={styles.emptyButtonText}>Utwórz pierwszą listę</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddListModal(true)}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Add List Modal */}
      <Modal
        visible={showAddListModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddListModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nowa lista zakupów</Text>
              <TouchableOpacity onPress={() => setShowAddListModal(false)}>
                <Ionicons name="close" size={24} color="#2d3748" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Nazwa listy (np. Biedronka, Lidl)"
              value={listName}
              onChangeText={setListName}
              autoFocus
            />

            <TouchableOpacity style={styles.modalButton} onPress={handleCreateList}>
              <Text style={styles.modalButtonText}>Utwórz listę</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        visible={showAddItemModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddItemModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dodaj produkt</Text>
              <TouchableOpacity onPress={() => setShowAddItemModal(false)}>
                <Ionicons name="close" size={24} color="#2d3748" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Nazwa produktu"
              value={itemText}
              onChangeText={setItemText}
              autoFocus
            />

            <TouchableOpacity style={styles.modalButton} onPress={handleAddItem}>
              <Text style={styles.modalButtonText}>Dodaj produkt</Text>
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
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listInfo: {
    marginLeft: 10,
    flex: 1,
  },
  listName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  listStats: {
    fontSize: 14,
    color: '#718096',
    marginTop: 2,
  },
  listActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    position: 'relative',
    height: 8,
    backgroundColor: '#edf2f7',
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#48bb78',
    borderRadius: 4,
  },
  progressText: {
    position: 'absolute',
    right: 5,
    top: -18,
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
  },
  itemsList: {
    marginTop: 5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemChecked: {
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
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#2d3748',
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    color: '#a0aec0',
  },
  emptyList: {
    textAlign: 'center',
    color: '#a0aec0',
    fontSize: 14,
    padding: 20,
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
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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