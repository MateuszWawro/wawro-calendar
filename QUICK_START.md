# Family Hub - Szybki Start 🚀

## 📦 Co otrzymałeś?

Kompletny system rodzinnego organizera z:
- ✅ Backend API (Node.js + Express + SQLite)
- ✅ Frontend Web (React)
- ✅ Aplikacja Mobilna (React Native - iOS + Android)
- ✅ Docker Compose dla łatwego deploymentu
- ✅ Konfiguracja Cloudflare Tunnel

## ⚡ Najszybszy sposób - Docker Compose

### 1. Struktura folderów

```
family-hub/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── mobile/
│   └── (React Native app)
├── docker-compose.yml
└── .env (główny)
```

### 2. Skopiuj pliki

Stwórz strukturę i skopiuj wszystkie pliki które dostałeś.

### 3. Konfiguracja Backend

```bash
cd backend

# Utwórz .env
cat > .env << EOF
PORT=3001
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF

# Utwórz package.json
cat > package.json << EOF
{
  "name": "family-hub-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "sqlite3": "^5.1.6",
    "dotenv": "^16.3.1"
  }
}
EOF

# Utwórz Dockerfile
cat > Dockerfile << EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN mkdir -p /app/data
EXPOSE 3001
CMD ["node", "server.js"]
EOF
```

### 4. Konfiguracja Frontend

```bash
cd ../frontend

# Zainstaluj Create React App jeśli nie masz
npx create-react-app .

# Lub utwórz nowy projekt
npx create-react-app family-hub-frontend

# Skopiuj komponenty do src/
# Skopiuj App.css

# Utwórz .env
cat > .env << EOF
REACT_APP_API_URL=http://localhost:3001/api
EOF

# Utwórz Dockerfile
cat > Dockerfile << EOF
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
```

### 5. Docker Compose

```bash
cd ..

# Utwórz docker-compose.yml (już masz w artifacts)

# Utwórz .env główny
cat > .env << EOF
JWT_SECRET=$(openssl rand -base64 32)
EOF
```

### 6. Uruchomienie!

```bash
# Build i start
docker compose up -d

# Sprawdź logi
docker compose logs -f

# Sprawdź status
docker compose ps
```

Otwórz http://localhost:3000 🎉

## 🔧 Testowanie lokalne (bez Dockera)

### Backend

```bash
cd backend
npm install
npm start
```

Backend będzie na http://localhost:3001

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend będzie na http://localhost:3000

## 📱 Aplikacja Mobilna

### Wymagania
- Node.js 18+
- React Native CLI
- Android Studio (dla Androida)
- Xcode (dla iOS, tylko macOS)

### Setup

```bash
cd mobile

# Inicjalizacja React Native (jeśli jeszcze nie)
npx react-native init FamilyHub

# Zainstaluj zależności
npm install @react-navigation/native
npm install @react-navigation/bottom-tabs
npm install @react-native-async-storage/async-storage
npm install axios
npm install react-native-vector-icons

# iOS (tylko macOS)
cd ios && pod install && cd ..
```

### Konfiguracja API

Edytuj `mobile/src/config.js`:

```javascript
// Dla testów lokalnych
export const API_URL = Platform.select({
  ios: 'http://localhost:3001/api',
  android: 'http://10.0.2.2:3001/api', // Android emulator
});

// Dla produkcji
// export const API_URL = 'https://api.family.twoja-domena.pl/api';
```

### Uruchomienie

```bash
# Android
npm run android

# iOS (tylko macOS)
npm run ios
```

### Build produkcyjny

#### Android APK

```bash
cd android
./gradlew assembleRelease

# APK będzie w:
# android/app/build/outputs/apk/release/app-release.apk
```

#### iOS (wymaga Apple Developer Account)

```bash
cd ios
xcodebuild -workspace FamilyHub.xcworkspace \
  -scheme FamilyHub \
  -configuration Release \
  archive
```

## 🌐 Hosting domowy z Cloudflare Tunnel

### 1. Zainstaluj cloudflared

```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

### 2. Zaloguj się

```bash
cloudflared tunnel login
```

### 3. Utwórz tunel

```bash
cloudflared tunnel create family-hub
```

### 4. Konfiguracja

```bash
mkdir -p ~/.cloudflared

cat > ~/.cloudflared/config.yml << EOF
tunnel: TWOJ-UUID-TUNELU
credentials-file: /root/.cloudflared/TWOJ-UUID-TUNELU.json

ingress:
  - hostname: family.twoja-domena.pl
    service: http://localhost:3000
  - hostname: api.family.twoja-domena.pl
    service: http://localhost:3001
  - service: http_status:404
EOF
```

### 5. DNS

```bash
cloudflared tunnel route dns family-hub family.twoja-domena.pl
cloudflared tunnel route dns family-hub api.family.twoja-domena.pl
```

### 6. Uruchom jako serwis

```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

**Gotowe!** Twoja aplikacja jest online 🌍

## 🐛 Rozwiązywanie problemów

### Backend nie startuje

```bash
# Sprawdź logi
docker compose logs backend

# Sprawdź port
sudo lsof -i :3001

# Restart
docker compose restart backend
```

### Frontend nie łączy się z API

1. Sprawdź `REACT_APP_API_URL` w `.env`
2. Sprawdź CORS w `server.js`
3. Test API: `curl http://localhost:3001/api/health`

### Aplikacja mobilna nie łączy się

1. Upewnij się że backend działa
2. Dla Androida użyj `10.0.2.2` zamiast `localhost`
3. Dla iOS użyj swojego IP lokalnego (np. `192.168.1.100`)
4. Sprawdź czy masz HTTP dozwolony w konfiguracji (nie tylko HTTPS)

### Cloudflare Tunnel nie działa

```bash
# Sprawdź logi
sudo journalctl -u cloudflared -f

# Sprawdź czy tunel jest uruchomiony
cloudflared tunnel list

# Restart
sudo systemctl restart cloudflared
```

## 📊 Pierwsze użycie

1. **Otwórz aplikację** (web lub mobile)
2. **Kliknij "Nowa Rodzina"**
3. **Wypełnij formularz:**
   - Nazwa rodziny (np. "Rodzina Kowalskich")
   - Twoje imię
   - Email
   - Hasło (min. 6 znaków)
   - Wybierz kolor
4. **ZAPISZ KOD ZAPROSZENIA!** (np. ABC123)
5. **Podziel się kodem z rodziną**
6. Inni członkowie używają **"Dołącz"** + ten kod

## 💡 Porady

### Bezpieczeństwo
- Zmień `JWT_SECRET` na coś bardziej losowego
- Używaj silnych haseł
- Regularnie rób backup bazy danych

### Backup

```bash
# Automatyczny backup (dodaj do crontab)
0 2 * * * docker exec family-hub-backend cp /app/family-hub.db /app/data/backup-$(date +\%Y\%m\%d).db

# Manualne backup
docker compose exec backend cp /app/family-hub.db /app/data/backup.db
```

### Performance
- Używaj Production build frontendu
- Włącz GZIP w Nginx
- Cloudflare automatycznie cache'uje statyczne pliki

### Monitoring

```bash
# Status
docker compose ps

# Użycie zasobów
docker stats

# Logi na żywo
docker compose logs -f
```

## 🆘 Potrzebujesz pomocy?

1. Sprawdź logi: `docker compose logs`
2. Sprawdź dokumentację Cloudflare: https://developers.cloudflare.com/
3. GitHub Issues: [link do twojego repo]

## 📝 Checklist Setup

- [ ] Backend działa lokalnie (http://localhost:3001/api/health)
- [ ] Frontend działa lokalnie (http://localhost:3000)
- [ ] Aplikacja mobilna compiles
- [ ] Docker Compose uruchamia się bez błędów
- [ ] Cloudflare Tunnel jest skonfigurowany
- [ ] DNS records są ustawione
- [ ] Mogę zalogować się przez internet
- [ ] Członkowie rodziny mogą dołączyć przez kod
- [ ] Backup bazy jest skonfigurowany

## 🎉 To wszystko!

Masz teraz w pełni funkcjonalny organizer rodzinny dostępny z każdego miejsca na świecie, hostowany u siebie w domu, za darmo!

Powodzenia! 🚀