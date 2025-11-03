# wawro-calendar
# Family Hub - Organizer Rodzinny

Kompletna aplikacja rodzinna z kalendarzem, listami zakupów, zadaniami, plannerem posiłków i przypomnieniami.

## 📱 Funkcje

- ✅ **Kalendarz rodzinny** - wydarzenia dla każdego członka rodziny
- 🛒 **Listy zakupów** - współdzielone listy z możliwością odznaczania
- ✔️ **Zadania do zrobienia** - przypisywanie zadań z datami
- 🍽️ **Planner posiłków** - planowanie na cały tydzień
- 📝 **Notatki rodzinne** - wspólne notatki
- ⏰ **Przypomnienia** - powiadomienia o ważnych wydarzeniach
- 👨‍👩‍👧‍👦 **Multi-użytkownik** - każdy członek rodziny ma swoje konto
- 🔐 **Bezpieczeństwo** - JWT authentication, bcrypt hashing
- 📱 **Aplikacje mobilne** - iOS i Android (React Native)
- 🌐 **Web app** - dostęp przez przeglądarkę

## 🏗️ Architektura

```
family-hub/
├── backend/           # Node.js + Express API
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env
├── frontend/          # React Web App
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── mobile/            # React Native App
│   ├── ios/
│   ├── android/
│   ├── src/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🚀 Instalacja (Hosting domowy)

### Wymagania
- Serwer domowy z Ubuntu/Debian (lub Windows z WSL2)
- Docker i Docker Compose
- Konto Cloudflare (darmowe)
- Domena (opcjonalnie, może być subdomena Cloudflare)

### Krok 1: Przygotowanie serwera

```bash
# Instalacja Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalacja Docker Compose
sudo apt-get install docker-compose-plugin

# Weryfikacja
docker --version
docker compose version
```

### Krok 2: Sklonowanie projektu

```bash
# Stwórz folder projektu
mkdir family-hub
cd family-hub

# Skopiuj wszystkie pliki do odpowiednich katalogów
```

### Krok 3: Konfiguracja Backend

```bash
cd backend

# Stwórz plik .env
cat > .env << EOF
PORT=3001
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF

# Zainstaluj zależności
npm install

# Test lokalny (opcjonalnie)
npm start
```

### Krok 4: Konfiguracja Frontend

```bash
cd ../frontend

# Stwórz plik .env
cat > .env << EOF
REACT_APP_API_URL=https://twoja-domena.pl/api
EOF

# Zainstaluj zależności
npm install

# Build produkcyjny
npm run build
```

### Krok 5: Konfiguracja Cloudflare Tunnel

#### A. Załóż konto Cloudflare (jeśli nie masz)
1. Przejdź na https://dash.cloudflare.com/sign-up
2. Zarejestruj się (darmowe)

#### B. Dodaj domenę (opcjonalnie)
1. Jeśli masz domenę, dodaj ją w Cloudflare
2. Możesz też użyć darmowej subdomeny Cloudflare

#### C. Utwórz Cloudflare Tunnel

```bash
# Zaloguj się w terminalu
cloudflared tunnel login

# Utwórz tunel
cloudflared tunnel create family-hub

# Zapisz UUID tunelu i token
```

#### D. Skonfiguruj tunel

Stwórz plik `config.yml`:

```yaml
tunnel: <TWOJ-TUNNEL-UUID>
credentials-file: /root/.cloudflared/<TWOJ-TUNNEL-UUID>.json

ingress:
  - hostname: family.twoja-domena.pl
    service: http://frontend:80
  - hostname: api.family.twoja-domena.pl
    service: http://backend:3001
  - service: http_status:404
```

#### E. Stwórz DNS records w Cloudflare
```bash
# Frontend
cloudflared tunnel route dns family-hub family.twoja-domena.pl

# Backend API
cloudflared tunnel route dns family-hub api.family.twoja-domena.pl
```

### Krok 6: Uruchomienie z Docker Compose

```bash
# Wróć do głównego katalogu
cd ..

# Stwórz plik .env dla docker-compose
cat > .env << EOF
JWT_SECRET=<WKLEJ_TOKEN_Z_BACKEND/.env>
TUNNEL_TOKEN=<TWOJ_CLOUDFLARE_TUNNEL_TOKEN>
EOF

# Uruchom wszystko
docker compose up -d

# Sprawdź logi
docker compose logs -f

# Sprawdź status
docker compose ps
```

## 📱 Instalacja Aplikacji Mobilnej

### iOS (wymaga macOS)

```bash
cd mobile

# Zainstaluj zależności
npm install

# Zainstaluj pods
cd ios && pod install && cd ..

# Uruchom w symulatorze
npm run ios

# Build produkcyjny
npm run build:ios
```

### Android

```bash
cd mobile

# Zainstaluj zależności
npm install

# Uruchom w emulatorze
npm run android

# Build produkcyjny (APK)
cd android
./gradlew assembleRelease

# APK będzie w: android/app/build/outputs/apk/release/app-release.apk
```

## 🔧 Konfiguracja

### Backend (server.js)
- Port: 3001 (domyślnie)
- Database: SQLite (family-hub.db)
- JWT expiry: 30 dni

### Frontend
- Zmień `REACT_APP_API_URL` w `.env` na swój adres API
- Build: `npm run build`
- Prod: serwowane przez Nginx w Dockerze

### Mobile
- Zmień `API_URL` w `src/config.js` na swój adres API
- iOS: edytuj `Info.plist` dla NSAppTransportSecurity
- Android: edytuj `AndroidManifest.xml` dla permisji

## 🔒 Bezpieczeństwo

### Firewall (opcjonalnie)
```bash
# Zablokuj bezpośredni dostęp do portów
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP (Cloudflare)
sudo ufw allow 443   # HTTPS (Cloudflare)
sudo ufw enable

# Docker będzie dostępny TYLKO przez Cloudflare Tunnel
```

### SSL/HTTPS
Cloudflare automatycznie zapewnia darmowy SSL. Nie musisz nic konfigurować!

### Backup bazy danych
```bash
# Backup
docker compose exec backend cp /app/family-hub.db /app/data/backup-$(date +%Y%m%d).db

# Restore
docker compose exec backend cp /app/data/backup-20250104.db /app/family-hub.db
```

## 🐛 Troubleshooting

### Backend nie startuje
```bash
# Sprawdź logi
docker compose logs backend

# Sprawdź czy port nie jest zajęty
sudo netstat -tulpn | grep 3001

# Restart
docker compose restart backend
```

### Frontend nie łączy się z API
1. Sprawdź `REACT_APP_API_URL` w `.env`
2. Sprawdź CORS w `server.js`
3. Sprawdź czy backend działa: `curl http://localhost:3001/api/health`

### Cloudflare Tunnel nie działa
```bash
# Sprawdź logi
docker compose logs cloudflared

# Sprawdź token
echo $TUNNEL_TOKEN

# Zrestartuj tunel
docker compose restart cloudflared
```

## 📊 Monitoring

```bash
# Status kontenerów
docker compose ps

# Użycie zasobów
docker stats

# Logi na żywo
docker compose logs -f

# Logi konkretnego serwisu
docker compose logs -f backend
```

## 🔄 Aktualizacja

```bash
# Pull latest changes
git pull

# Rebuild i restart
docker compose down
docker compose build --no-cache
docker compose up -d
```

## 📝 Pierwsze uruchomienie

1. Otwórz `https://family.twoja-domena.pl`
2. Kliknij "Nowa Rodzina"
3. Wypełnij formularz
4. Zapisz **Kod zaproszenia** - potrzebny do dodania rodziny
5. Podziel się kodem z rodziną
6. Inni używają "Dołącz" + kod

## 💡 Porady

- **Backup regularnie** - ustaw cron job na codzienne backupy bazy
- **Monitoruj** - postaw Uptime Robot lub podobne
- **Updates** - aktualizuj regularnie Docker images
- **Logs** - rotuj logi żeby nie zapchać dysku

## 🆘 Wsparcie

Issues: https://github.com/twoj-repo/family-hub/issues

## 📄 Licencja

MIT License - używaj jak chcesz!