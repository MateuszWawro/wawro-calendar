import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';

export default function LoginScreen({ navigation }) {
  const [mode, setMode] = useState('login'); // 'login' lub 'register'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      await signIn(response.data.token, response.data.user);
    } catch (error) {
      Alert.alert(
        'Błąd logowania',
        error.response?.data?.error || 'Wystąpił błąd podczas logowania'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header z ikoną */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="people" size={60} color="#6B4C4C" />
          </View>
          <Text style={styles.title}>Wawrusowy Kalendarz Aktywności</Text>
        </View>

        {/* Przełącznik zaloguj/dołącz */}
        <View style={styles.switchContainer}>
          <TouchableOpacity
            style={[styles.switchButton, mode === 'login' && styles.switchButtonActive]}
            onPress={() => setMode('login')}
          >
            <Ionicons 
              name="log-in-outline" 
              size={20} 
              color={mode === 'login' ? '#fff' : '#6B4C4C'} 
            />
            <Text style={[styles.switchText, mode === 'login' && styles.switchTextActive]}>
              zaloguj
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switchButton, mode === 'register' && styles.switchButtonActive]}
            onPress={() => setMode('register')}
          >
            <Ionicons 
              name="add-circle-outline" 
              size={20} 
              color={mode === 'register' ? '#fff' : '#6B4C4C'} 
            />
            <Text style={[styles.switchText, mode === 'register' && styles.switchTextActive]}>
              dołącz
            </Text>
          </TouchableOpacity>
        </View>

        {/* Formularz */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.inputGroup}>
            <Ionicons name="mail-outline" size={24} color="#6B4C4C" style={styles.inputIcon} />
            <Text style={styles.label}>Email</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="jenkowalski@gmail.com"
            value={formData.email}
            onChangeText={(text) => updateFormData('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Hasło */}
          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={24} color="#6B4C4C" style={styles.inputIcon} />
            <Text style={styles.label}>Hasło</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={formData.password}
            onChangeText={(text) => updateFormData('password', text)}
            secureTextEntry
          />

          {/* Przycisk zaloguj */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Ładowanie...' : 'zaloguj się'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    color: '#4A4A4A',
    textAlign: 'center',
    fontWeight: '400',
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 4,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  switchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 26,
    gap: 8,
  },
  switchButtonActive: {
    backgroundColor: '#6B4C4C',
  },
  switchText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B4C4C',
  },
  switchTextActive: {
    color: '#fff',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inputIcon: {
    width: 24,
  },
  label: {
    fontSize: 16,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 15,
    color: '#4A4A4A',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#6B4C4C',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#A89898',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});