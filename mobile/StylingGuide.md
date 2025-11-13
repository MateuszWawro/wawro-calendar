# Family Hub Mobile - Przewodnik Stylizacji 🎨

Ten dokument zawiera wskazówki dotyczące stylizacji aplikacji zgodnie z draftami ekranów.

## 📐 Kolory Główne

```javascript
const COLORS = {
  // Primary
  primary: '#667eea',
  primaryDark: '#5568d3',
  primaryLight: '#ebf4ff',
  
  // Background
  bgPrimary: '#f5f7fa',
  bgSecondary: '#ffffff',
  bgTertiary: '#f7fafc',
  
  // Text
  textPrimary: '#2d3748',
  textSecondary: '#4a5568',
  textTertiary: '#718096',
  textQuaternary: '#a0aec0',
  
  // Borders
  borderColor: '#e2e8f0',
  borderHover: '#cbd5e0',
  
  // Status
  success: '#48bb78',
  warning: '#f59e0b',
  danger: '#ef4444',
  
  // Member colors
  memberColors: [
    '#ef4444', // red
    '#f59e0b', // orange
    '#10b981', // green
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // deep orange
  ],
};
```

## 🎯 Kluczowe Wzorce Projektowe

### 1. Ultra-Kompaktowy Kalendarz (zgodnie z iPhone Calendar)

```javascript
// Minimal spacing
const CALENDAR_STYLES = {
  gap: 1,
  padding: 2,
  dayMinHeight: 40,
  fontSize: 11,
  dotSize: 4,
};
```

**Kluczowe cechy:**
- Bardzo małe odstępy (1px)
- Numer dnia: 11px font
- Kropki wydarzeń: 4x4px
- Pokazuj tylko godzinę w siatce (tytuł w modalu)
- Max 2-3 wydarzenia widoczne, reszta jako "+X"

### 2. Karty (Cards)

```javascript
const cardStyle = {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 15,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3, // Dla Android
  marginBottom: 15,
};
```

### 3. FAB (Floating Action Button)

```javascript
const fabStyle = {
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
};
```

### 4. Modalny Drawer (Bottom Sheet)

```javascript
const modalStyle = {
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
};
```

## 📱 Dostosowanie do Draft Ekranów

### Ekran Logowania

**Draft pokazuje:**
- 3 taby na górze (Logowanie, Nowa Rodzina, Dołącz)
- Wielki okrągły avatar/ikona z "zaludą"
- Pola input z ikonami po lewej
- Przycisk full-width na dole

**Implementacja:** ✅ LoginScreen.js

### Ekran Kalendarza

**Draft pokazuje:**
- Ultra-kompaktny widok (jak iPhone)
- Małe liczby dni
- Kropki kolorów dla wydarzeń
- Minimalne pady

**Wskazówki:**
```javascript
// Jeszcze bardziej kompaktowy:
day: {
  width: '14.28%',
  aspectRatio: 1,
  padding: 1, // Zmniejsz z 2
  borderWidth: 0.5,
}

dayNumber: {
  fontSize: 10, // Zmniejsz z 11
}
```

### Ekran Dodawania Wydarzeń

**Draft pokazuje:**
- Data u góry (17/08/2025)
- Godzina (07:00 AM/PM)
- Kategoria z ikonką
- Training input field
- Lokalizacja z ikonką

**Rozszerzenia:**
```javascript
// Dodaj pole lokalizacji:
<View style={styles.inputContainer}>
  <Ionicons name="location-outline" size={20} color="#718096" />
  <TextInput
    style={styles.input}
    placeholder="Lokalizacja"
    value={formData.location}
    onChangeText={(text) => setFormData({...formData, location: text})}
  />
</View>

// Dodaj picker kategorii z ikonkami:
const CATEGORIES = [
  { id: 'training', label: 'Trening', icon: 'fitness' },
  { id: 'meeting', label: 'Spotkanie', icon: 'people' },
  { id: 'sport', label: 'Sport', icon: 'basketball' },
  // etc...
];
```

### Wybór Kategorii (jak w drafcie)

**Draft pokazuje selektor z ikonkami:**

```javascript
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {CATEGORIES.map(cat => (
    <TouchableOpacity
      key={cat.id}
      style={[
        styles.categoryButton,
        selectedCategory === cat.id && styles.categoryButtonActive
      ]}
    >
      <Ionicons name={cat.icon} size={24} color="..." />
      <Text>{cat.label}</Text>
    </TouchableOpacity>
  ))}
</ScrollView>

const styles = {
  categoryButton: {
    padding: 15,
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    minWidth: 100,
  },
  categoryButtonActive: {
    borderColor: '#667eea',
    backgroundColor: '#ebf4ff',
  },
};
```

## 🎨 Dodatkowe Komponenty do Implementacji

### Time Picker (jak w drafcie)

```javascript
import DateTimePicker from '@react-native-community/datetimepicker';

// W stanie:
const [showTimePicker, setShowTimePicker] = useState(false);
const [time, setTime] = useState(new Date());

// W render:
{showTimePicker && (
  <DateTimePicker
    value={time}
    mode="time"
    display="spinner" // lub "default"
    onChange={(event, selectedTime) => {
      setShowTimePicker(false);
      if (selectedTime) {
        setTime(selectedTime);
      }
    }}
  />
)}
```

### Avatar z inicjałami

```javascript
const Avatar = ({ name, color, size = 50 }) => (
  <View 
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Text style={{
      fontSize: size / 2.5,
      fontWeight: 'bold',
      color: '#fff',
    }}>
      {name.charAt(0).toUpperCase()}
    </Text>
  </View>
);
```

## 📊 Responsywność

### Breakpoints

```javascript
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 768;
const isLargeDevice = width >= 768;
```

### Dynamiczne style

```javascript
const styles = StyleSheet.create({
  container: {
    padding: isSmallDevice ? 10 : 15,
  },
  title: {
    fontSize: isSmallDevice ? 18 : 22,
  },
});
```

## 🔄 Animacje (Opcjonalne)

### Fade In Animation

```javascript
import { Animated } from 'react-native';

const fadeAnim = new Animated.Value(0);

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }).start();
}, []);

<Animated.View style={{ opacity: fadeAnim }}>
  {/* Content */}
</Animated.View>
```

## 📝 Checklist Zgodności z Draftem

- [ ] Kalendarz ultra-kompaktowy (jak iPhone)
- [ ] Kropki kolorów dla członków rodziny
- [ ] Bottom sheet modals zamiast center modals
- [ ] FAB dla głównych akcji
- [ ] Kategorie z ikonkami
- [ ] Time picker 12h format (AM/PM)
- [ ] Pole lokalizacji w wydarzeniach
- [ ] Awatary z inicjałami i kolorami
- [ ] Smooth transitions między ekranami

## 🎯 Następne Kroki

1. Dokończ MealsScreen z tygodniowym plannerem
2. NotesScreen ze sticky notes różnych kolorów
3. Dodaj kategorię/typ wydarzenia
4. Dodaj pole lokalizacji do wydarzeń
5. Implementuj gesture handling (swipe to delete, etc.)
6. Dodaj pull-to-refresh
7. Implementuj skeleton loaders

---

**Tip:** Użyj narzędzia do design system jak [React Native Paper](https://callstack.github.io/react-native-paper/) lub [NativeBase](https://nativebase.io/) dla spójnego UI.