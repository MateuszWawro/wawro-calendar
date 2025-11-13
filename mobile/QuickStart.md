# Family Hub Mobile - Quick Start 🚀

## ⚡ 5-minutowy Setup

### 1️⃣ Rozpakuj i Zainstaluj (2 min)

```bash
# Rozpakuj archiwum
unzip family-hub-mobile.zip
cd family-hub-mobile

# Zainstaluj zależności
npm install
```

### 2️⃣ Skonfiguruj Backend (1 min)

Otwórz `src/config/api.js` i zmień adres API:

```javascript
// Dla iOS Simulator:
const API_URL = 'http://localhost:3001/api';

// Dla Android Emulator:
const API_URL = 'http://10.0.2.2:3001/api';

// Dla prawdziwego urządzenia (znajdź swój IP):
// Windows: ipconfig
// Mac/Linux: ifconfig
const API_URL = 'http://192.168.1.XXX:3001/api';
```

**Pro Tip:** Uruchom backend przed testem!

### 3️⃣ Uruchom Aplikację (2 min)

```bash
npm start
```

Otworzy się Expo DevTools. Wybierz:

- **iOS:** naciśnij `i` (wymaga Xcode na Mac)
- **Android:** naciśnij `a` (wymaga Android Studio)
- **Urządzenie fizyczne:** zeskanuj QR w aplikacji **Expo Go**

---

## 📱 Pierwsze Kroki w Aplikacji

### Rejestracja:

1. Otwórz aplikację
2. Kliknij tab **"Nowa Rodzina"**
3. Wypełnij:
   - Nazwa rodziny: `Kowalskich`
   - Twoje imię: `Jan`
   - Email: `jan@example.com`
   - Hasło: `haslo123`
4. Kliknij **"Utwórz rodzinę"**

**Gotowe!** Otrzymasz kod zaproszenia, np. `ABC123`

### Dodanie Drugiego Członka:

Na innym urządzeniu/emulatorze:

1. Kliknij tab **"Dołącz"**
2. Wpisz kod zaproszenia: `ABC123`
3. Podaj swoje dane
4. Kliknij **"Dołącz do rodziny"**

### Test Podstawowych Funkcji:

**Kalendarz:**
- Kliknij dowolny dzień
- Dodaj wydarzenie: `Obiad z rodziną`
- Wybierz członka i godzinę
- Zobacz kolorowe kropki na kalendarzu

**Zakupy:**
- Kliknij **+** (FAB)
- Stwórz listę: `Biedronka`
- Dodaj produkty: `Mleko`, `Chleb`, `Jajka`
- Zaznaczaj checkboxy podczas zakupów

**Zadania:**
- Kliknij **+** (FAB)
- Dodaj zadanie: `Wynieść śmieci`
- Przypisz do członka
- Zaznacz gdy zrobione

---

## 🐛 Szybkie Rozwiązywanie Problemów

### Problem: "Network request failed"

**Rozwiązanie:**
```bash
# 1. Sprawdź czy backend działa:
curl http://localhost:3001/api/health

# 2. Jeśli używasz urządzenia fizycznego, użyj IP zamiast localhost
# Znajdź swój IP:
ipconfig          # Windows
ifconfig          # Mac/Linux

# 3. Zmień API_URL w src/config/api.js
```

### Problem: Biały ekran

**Rozwiązanie:**
```bash
# Wyczyść cache:
expo start -c

# Lub przeinstaluj:
rm -rf node_modules
npm install
```

### Problem: "Could not connect to development server"

**Rozwiązanie:**
1. Upewnij się, że urządzenie i komputer są w tej samej sieci WiFi
2. Wyłącz firewall/VPN tymczasowo
3. Restart Metro bundler (`npm start`)

---

## 🎯 Co Dalej?

### Dokończ Missing Features:

1. **MealsScreen** - Zobacz `src/screens/MealsScreen.js`
2. **NotesScreen** - Zobacz `src/screens/NotesScreen.js`

### Dodaj Nowe Funkcje:

```javascript
// Przykład: Dodaj kategorię do wydarzenia

// W CalendarScreen.js:
const CATEGORIES = [
  { id: 'work', label: 'Praca', icon: 'briefcase', color: '#3b82f6' },
  { id: 'personal', label: 'Osobiste', icon: 'person', color: '#10b981' },
  { id: 'family', label: 'Rodzina', icon: 'people', color: '#f59e0b' },
];

// Dodaj do formData:
const [formData, setFormData] = useState({
  ...
  category: 'personal',
});

// Dodaj picker w modal:
<View style={styles.categoryPicker}>
  {CATEGORIES.map(cat => (
    <TouchableOpacity
      key={cat.id}
      style={[
        styles.categoryBtn,
        formData.category === cat.id && styles.categoryBtnActive
      ]}
      onPress={() => setFormData({...formData, category: cat.id})}
    >
      <Ionicons name={cat.icon} size={24} color={cat.color} />
      <Text>{cat.label}</Text>
    </TouchableOpacity>
  ))}
</View>
```

### Deployment na Prawdziwe Urządzenia:

```bash
# Build dla iOS:
eas build --platform ios

# Build dla Android:
eas build --platform android
```

Zobacz `DEPLOYMENT.md` dla szczegółów.

---

## 📚 Przydatne Komendy

```bash
# Start z czyszczeniem cache
npm start -- --clear

# Tylko iOS
npm run ios

# Tylko Android
npm run android

# Logi w czasie rzeczywistym
npx react-native log-ios       # iOS
npx react-native log-android   # Android

# Install nowej paczki
npm install nazwa-paczki
expo install nazwa-paczki  # dla expo-kompatybilnych

# Update Expo
npm install expo@latest

# Check outdated packages
npm outdated
```

---

## 🎨 Customizacja

### Zmień Kolor Primary:

W każdym pliku screen, zamień `#667eea` na swój kolor:

```javascript
// Globalny color scheme - stwórz plik:
// src/theme/colors.js
export default {
  primary: '#667eea',    // Twój kolor
  secondary: '#764ba2',
  background: '#f5f7fa',
  // ...
};

// Import w screens:
import colors from '../theme/colors';
```

### Dodaj Dark Mode:

```javascript
// 1. Install:
npm install @react-navigation/native

// 2. Użyj useColorScheme:
import { useColorScheme } from 'react-native';

const ColorScheme = () => {
  const scheme = useColorScheme();
  
  return {
    background: scheme === 'dark' ? '#1a202c' : '#f5f7fa',
    text: scheme === 'dark' ? '#f7fafc' : '#2d3748',
  };
};
```

---

## 💬 Potrzebujesz Pomocy?

### Dokumentacja:
- **README.md** - Pełne instrukcje instalacji
- **STYLING_GUIDE.md** - Stylizacja zgodna z draftem
- **DEPLOYMENT.md** - Deployment na App/Play Store
- **PROJECT_SUMMARY.md** - Kompletne podsumowanie

### Community:
- [React Native Discord](https://discord.gg/reactnative)
- [Expo Discord](https://discord.gg/expo)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

### Debug Mode:
W aplikacji naciśnij:
- iOS: `Cmd + D`
- Android: `Cmd + M` (Mac) lub `Ctrl + M` (Windows)

Wybierz: **Toggle Element Inspector** lub **Show Dev Menu**

---

## ✅ Checklist Pierwszego Uruchomienia

- [ ] Backend działa na http://localhost:3001
- [ ] API_URL skonfigurowany w `src/config/api.js`
- [ ] `npm install` wykonany
- [ ] Expo Go zainstalowane (dla urządzenia fizycznego)
- [ ] `npm start` uruchomiony
- [ ] Aplikacja otwarta na iOS/Android/urządzeniu
- [ ] Testowa rejestracja działa
- [ ] Wszystkie ekrany są dostępne

---

**Gotowe!** Teraz możesz zacząć developować! 🎉

Jeśli coś nie działa, sprawdź **README.md** lub **PROJECT_SUMMARY.md** dla bardziej szczegółowych instrukcji.

**Powodzenia! 🚀**