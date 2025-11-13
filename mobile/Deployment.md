# Deployment Guide - Family Hub Mobile 🚀

## 📱 Przygotowanie do Produkcji

### 1. Przygotuj Assets

#### Ikona Aplikacji
- **iOS:** 1024x1024px PNG (bez zaokrąglonych rogów, bez przezroczystości)
- **Android:** 512x512px PNG
- Umieść w `assets/icon.png`

#### Splash Screen
- 1242x2436px PNG
- Umieść w `assets/splash.png`

#### Adaptive Icon (Android)
- Foreground: 432x432px (safe zone 288x288px)
- Umieść w `assets/adaptive-icon.png`

### 2. Zaktualizuj app.json

```json
{
  "expo": {
    "name": "Family Hub",
    "slug": "family-hub-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#667eea"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.familyhub",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.familyhub",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#667eea"
      },
      "permissions": []
    }
  }
}
```

## 🍎 Deployment na iOS (App Store)

### Wymagania:
- Konto Apple Developer ($99/rok)
- Mac z Xcode
- Certyfikaty i Profile

### Krok po kroku:

#### 1. Zainstaluj EAS CLI
```bash
npm install -g eas-cli
```

#### 2. Logowanie do Expo
```bash
eas login
```

#### 3. Konfiguracja projektu
```bash
eas build:configure
```

#### 4. Build dla iOS
```bash
eas build --platform ios
```

Wybierz:
- Build type: **production**
- Bundle identifier: Twój unikalny ID

#### 5. Czekaj na build
Build zajmuje 15-30 minut. Otrzymasz link do pobrania .ipa

#### 6. Testowanie przez TestFlight
```bash
eas submit --platform ios
```

#### 7. App Store Connect
1. Zaloguj się na [App Store Connect](https://appstoreconnect.apple.com)
2. Stwórz nową aplikację
3. Wypełnij metadane:
   - Nazwa aplikacji
   - Opis
   - Screenshots (wymagane)
   - Kategoria
   - Privacy Policy URL
4. Prześlij build przez EAS lub Transporter
5. Submit do Review

**Screenshots wymagane:**
- 6.5" Display (iPhone 14 Pro Max): 1290x2796px
- 5.5" Display (iPhone 8 Plus): 1242x2208px

### Alternative: Expo Classic Build

```bash
expo build:ios
```

Wybierz:
- Archive lub Simulator
- Managed lub Bare workflow

## 🤖 Deployment na Android (Google Play)

### Wymagania:
- Konto Google Play Developer ($25 jednorazowo)
- Keystore (certyfikat podpisywania)

### Krok po kroku:

#### 1. Stwórz Keystore (jeśli nie masz)
```bash
keytool -genkeypair -v -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Ważne:** Zachowaj hasło i keystore - nie da się go odzyskać!

#### 2. Build dla Android
```bash
eas build --platform android
```

Wybierz:
- Build type: **app-bundle** (preferowany przez Google Play)
- Lub **apk** do testowania

#### 3. Pobierz AAB/APK
Po zakończeniu buildu pobierz plik .aab

#### 4. Google Play Console
1. Zaloguj się na [Google Play Console](https://play.google.com/console)
2. Stwórz nową aplikację
3. Wypełnij Store Listing:
   - Tytuł (30 znaków)
   - Krótki opis (80 znaków)
   - Pełny opis (4000 znaków)
   - Ikona aplikacji (512x512px)
   - Feature Graphic (1024x500px)
   - Screenshots (min. 2, max 8)
     - Phone: 320-3840px wide
     - 7" Tablet: 600-7680px
     - 10" Tablet: 600-7680px
4. Kategoria i content rating
5. Ceny i dystrybucja

#### 5. Upload APK/AAB
1. Production → Create new release
2. Upload .aab
3. Nazwa wersji: 1.0.0 (1)
4. Release notes
5. Review → Start rollout

**Screenshots pomocnicze:**
```
Phone (9:16):
- 1080x1920px
- 1440x2560px

Tablet 7" (16:10):
- 1200x1920px

Tablet 10" (16:10):
- 1800x2880px
```

## 🔄 Over-the-Air (OTA) Updates

### Expo Updates (dla małych zmian bez native code)

```bash
expo publish
```

Automatyczne updatey dla użytkowników bez ponownego submitu do store!

**Ograniczenia:**
- Tylko zmiany w JS/TS
- Nie działa dla zmian w native module

## 📊 Monitoring i Analytics

### 1. Dodaj Sentry (Error Tracking)
```bash
npm install @sentry/react-native
```

### 2. Dodaj Analytics
```bash
expo install expo-firebase-analytics
```

## ✅ Pre-launch Checklist

### Funkcjonalność:
- [ ] Wszystkie ekrany działają poprawnie
- [ ] Formularze są walidowane
- [ ] Obsługa błędów sieciowych
- [ ] Loading states wszędzie
- [ ] Logout działa
- [ ] Deep linking (jeśli używany)

### Design:
- [ ] Ikona aplikacji (wszystkie rozmiary)
- [ ] Splash screen
- [ ] Screenshots dla store
- [ ] Feature graphic (Android)

### Legal:
- [ ] Privacy Policy URL
- [ ] Terms of Service
- [ ] GDPR compliance (jeśli EU)
- [ ] Content rating

### Testy:
- [ ] Przetestowane na iOS (min. iOS 13)
- [ ] Przetestowane na Android (min. Android 5.0)
- [ ] Różne rozmiary ekranów
- [ ] Różne wersje OS
- [ ] Wolne połączenie internetowe
- [ ] Tryb offline

## 🚀 CI/CD (Automatyzacja)

### GitHub Actions przykład:

```yaml
name: Build and Deploy
on:
  push:
    branches: [main]
    
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: eas build --platform all --non-interactive
```

## 📱 Beta Testing

### iOS (TestFlight):
```bash
eas submit --platform ios --latest
```
Następnie w App Store Connect dodaj testerów

### Android (Internal Testing):
W Google Play Console → Testing → Internal testing → Upload APK

## 🔐 Environment Variables

**Nie commituj secrets!**

```bash
# .env
API_URL=https://api.yourapp.com
SENTRY_DSN=your-sentry-dsn
```

W EAS Build:
```bash
eas secret:create --scope project --name API_URL --value https://...
```

## 📈 Po Wydaniu

### Monitoring:
- Śledź crashe w Sentry
- Sprawdzaj analytics
- Czytaj recenzje

### Updates:
- Regularne bugfixy
- Nowe funkcje
- Optymalizacja wydajności

### Marketing:
- App Store Optimization (ASO)
- Social media
- Website landing page

---

## 📚 Pomocne Linki

- [Expo Deployment Docs](https://docs.expo.dev/distribution/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

---

**Pro Tip:** Zacznij od beta testingu z małą grupą użytkowników przed pełnym wydaniem!