// backend/server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'zmien-to-na-swoj-super-tajny-klucz-production';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://family.wawro.ovh', 'http://family.wawro.ovh'],
  credentials: true
}));
app.use(express.json());

// Database initialization
const dbPath = process.env.DB_PATH || './data/family-hub.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  db.serialize(() => {
    // Families table
    db.run(`CREATE TABLE IF NOT EXISTS families (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      invite_code TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#3b82f6',
      role TEXT DEFAULT 'member',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (family_id) REFERENCES families(id)
    )`);

    // Events table
    db.run(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      event_date DATE NOT NULL,
      event_time TIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (family_id) REFERENCES families(id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Shopping lists table
    db.run(`CREATE TABLE IF NOT EXISTS shopping_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (family_id) REFERENCES families(id)
    )`);

    // Shopping items table
    db.run(`CREATE TABLE IF NOT EXISTS shopping_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      checked INTEGER DEFAULT 0,
      added_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE,
      FOREIGN KEY (added_by) REFERENCES users(id)
    )`);

    // Todos table
    db.run(`CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      task TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      due_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (family_id) REFERENCES families(id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Meals table
    db.run(`CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL,
      day_of_week TEXT NOT NULL,
      meal TEXT NOT NULL,
      recipe_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (family_id) REFERENCES families(id)
    )`);

    // Notes table
    db.run(`CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (family_id) REFERENCES families(id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Reminders table
    db.run(`CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      remind_at DATETIME NOT NULL,
      repeat_type TEXT,
      sent INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (family_id) REFERENCES families(id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`, (err) => {
      if (!err) {
        console.log('✅ Database tables initialized successfully');
      }
    });
  });
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Brak tokenu autoryzacji' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Nieprawidłowy lub wygasły token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate invite code
function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ==================== AUTH ROUTES ====================

// Register new family
app.post('/api/auth/register', async (req, res) => {
  const { familyName, email, password, name, color } = req.body;

  try {
    // Validate input
    if (!familyName || !email || !password || !name) {
      return res.status(400).json({ error: 'Wszystkie pola są wymagane' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Hasło musi mieć minimum 6 znaków' });
    }

    // Check if email exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
      if (user) {
        return res.status(400).json({ error: 'Email jest już zarejestrowany' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const inviteCode = generateInviteCode();

      db.run(
        'INSERT INTO families (name, invite_code) VALUES (?, ?)',
        [familyName, inviteCode],
        function(err) {
          if (err) {
            console.error('Error creating family:', err);
            return res.status(500).json({ error: 'Błąd tworzenia rodziny' });
          }

          const familyId = this.lastID;

          db.run(
            'INSERT INTO users (family_id, email, password, name, color, role) VALUES (?, ?, ?, ?, ?, ?)',
            [familyId, email, hashedPassword, name, color || '#3b82f6', 'admin'],
            function(err) {
              if (err) {
                console.error('Error creating user:', err);
                return res.status(500).json({ error: 'Błąd tworzenia użytkownika' });
              }

              const token = jwt.sign(
                { userId: this.lastID, familyId, email, role: 'admin' },
                JWT_SECRET,
                { expiresIn: '30d' }
              );

              res.json({
                token,
                user: { id: this.lastID, email, name, color: color || '#3b82f6', role: 'admin' },
                family: { id: familyId, name: familyName, inviteCode }
              });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Join existing family
app.post('/api/auth/join', async (req, res) => {
  const { inviteCode, email, password, name, color } = req.body;

  try {
    if (!inviteCode || !email || !password || !name) {
      return res.status(400).json({ error: 'Wszystkie pola są wymagane' });
    }

    db.get('SELECT id, name FROM families WHERE invite_code = ?', [inviteCode.toUpperCase()], async (err, family) => {
      if (err || !family) {
        return res.status(404).json({ error: 'Nieprawidłowy kod zaproszenia' });
      }

      // Check if email exists
      db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
        if (user) {
          return res.status(400).json({ error: 'Email jest już zarejestrowany' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
          'INSERT INTO users (family_id, email, password, name, color) VALUES (?, ?, ?, ?, ?)',
          [family.id, email, hashedPassword, name, color || '#3b82f6'],
          function(err) {
            if (err) {
              console.error('Error creating user:', err);
              return res.status(500).json({ error: 'Błąd tworzenia użytkownika' });
            }

            const token = jwt.sign(
              { userId: this.lastID, familyId: family.id, email, role: 'member' },
              JWT_SECRET,
              { expiresIn: '30d' }
            );

            res.json({
              token,
              user: { id: this.lastID, email, name, color: color || '#3b82f6', role: 'member' },
              family: { id: family.id, name: family.name, inviteCode }
            });
          }
        );
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email i hasło są wymagane' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }

    db.get('SELECT name, invite_code FROM families WHERE id = ?', [user.family_id], (err, family) => {
      const token = jwt.sign(
        { userId: user.id, familyId: user.family_id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          color: user.color,
          role: user.role
        },
        family: {
          id: user.family_id,
          name: family?.name,
          inviteCode: family?.invite_code
        }
      });
    });
  });
});

// ==================== FAMILY ROUTES ====================

app.get('/api/family/members', authenticateToken, (req, res) => {
  db.all(
    'SELECT id, name, email, color, role FROM users WHERE family_id = ? ORDER BY created_at',
    [req.user.familyId],
    (err, members) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd pobierania członków rodziny' });
      }
      res.json(members);
    }
  );
});

app.get('/api/family/info', authenticateToken, (req, res) => {
  db.get(
    'SELECT * FROM families WHERE id = ?',
    [req.user.familyId],
    (err, family) => {
      if (err || !family) {
        return res.status(404).json({ error: 'Rodzina nie znaleziona' });
      }
      res.json(family);
    }
  );
});

// ==================== EVENTS ROUTES ====================

app.get('/api/events', authenticateToken, (req, res) => {
  const { month, year } = req.query;
  
  let query = `
    SELECT e.*, u.name as user_name, u.color as user_color 
    FROM events e 
    JOIN users u ON e.user_id = u.id 
    WHERE e.family_id = ?
  `;
  
  const params = [req.user.familyId];
  
  if (month && year) {
    query += ` AND strftime('%m', event_date) = ? AND strftime('%Y', event_date) = ?`;
    params.push(month.padStart(2, '0'), year);
  }
  
  query += ' ORDER BY event_date, event_time';
  
  db.all(query, params, (err, events) => {
    if (err) {
      return res.status(500).json({ error: 'Błąd pobierania wydarzeń' });
    }
    res.json(events);
  });
});

app.post('/api/events', authenticateToken, (req, res) => {
  const { title, description, eventDate, eventTime, userId } = req.body;
  
  if (!title || !eventDate) {
    return res.status(400).json({ error: 'Tytuł i data są wymagane' });
  }

  db.run(
    'INSERT INTO events (family_id, user_id, title, description, event_date, event_time) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.familyId, userId || req.user.userId, title, description, eventDate, eventTime],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd tworzenia wydarzenia' });
      }
      res.json({ id: this.lastID, title, description, eventDate, eventTime });
    }
  );
});

app.put('/api/events/:id', authenticateToken, (req, res) => {
  const { title, description, eventDate, eventTime, userId } = req.body;
  
  db.run(
    'UPDATE events SET title = ?, description = ?, event_date = ?, event_time = ?, user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND family_id = ?',
    [title, description, eventDate, eventTime, userId, req.params.id, req.user.familyId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd aktualizacji wydarzenia' });
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/events/:id', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM events WHERE id = ? AND family_id = ?',
    [req.params.id, req.user.familyId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd usuwania wydarzenia' });
      }
      res.json({ success: true });
    }
  );
});

// ==================== SHOPPING LISTS ROUTES ====================

app.get('/api/shopping', authenticateToken, (req, res) => {
  db.all(
    `SELECT sl.*, 
     (SELECT COUNT(*) FROM shopping_items WHERE list_id = sl.id) as item_count,
     (SELECT COUNT(*) FROM shopping_items WHERE list_id = sl.id AND checked = 1) as checked_count
     FROM shopping_lists sl 
     WHERE sl.family_id = ?
     ORDER BY sl.created_at DESC`,
    [req.user.familyId],
    (err, lists) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd pobierania list zakupów' });
      }
      res.json(lists);
    }
  );
});

app.get('/api/shopping/:listId/items', authenticateToken, (req, res) => {
  db.all(
    `SELECT si.*, u.name as added_by_name 
     FROM shopping_items si 
     LEFT JOIN users u ON si.added_by = u.id 
     WHERE si.list_id = ?
     ORDER BY si.checked, si.created_at`,
    [req.params.listId],
    (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd pobierania produktów' });
      }
      res.json(items);
    }
  );
});

app.post('/api/shopping', authenticateToken, (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Nazwa listy jest wymagana' });
  }

  db.run(
    'INSERT INTO shopping_lists (family_id, name) VALUES (?, ?)',
    [req.user.familyId, name],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd tworzenia listy' });
      }
      res.json({ id: this.lastID, name, item_count: 0, checked_count: 0 });
    }
  );
});

app.post('/api/shopping/:listId/items', authenticateToken, (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Nazwa produktu jest wymagana' });
  }

  db.run(
    'INSERT INTO shopping_items (list_id, text, added_by) VALUES (?, ?, ?)',
    [req.params.listId, text, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd dodawania produktu' });
      }
      res.json({ id: this.lastID, text, checked: 0 });
    }
  );
});

app.patch('/api/shopping/items/:itemId', authenticateToken, (req, res) => {
  const { checked } = req.body;
  
  db.run(
    'UPDATE shopping_items SET checked = ? WHERE id = ?',
    [checked ? 1 : 0, req.params.itemId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd aktualizacji produktu' });
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/shopping/:listId', authenticateToken, (req, res) => {
  db.run('DELETE FROM shopping_items WHERE list_id = ?', [req.params.listId]);
  db.run(
    'DELETE FROM shopping_lists WHERE id = ? AND family_id = ?',
    [req.params.listId, req.user.familyId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd usuwania listy' });
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/shopping/items/:itemId', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM shopping_items WHERE id = ?',
    [req.params.itemId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd usuwania produktu' });
      }
      res.json({ success: true });
    }
  );
});

// ==================== TODOS ROUTES ====================

app.get('/api/todos', authenticateToken, (req, res) => {
  db.all(
    `SELECT t.*, u.name as user_name, u.color as user_color 
     FROM todos t 
     JOIN users u ON t.user_id = u.id 
     WHERE t.family_id = ?
     ORDER BY t.completed, t.due_date, t.created_at`,
    [req.user.familyId],
    (err, todos) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd pobierania zadań' });
      }
      res.json(todos);
    }
  );
});

app.post('/api/todos', authenticateToken, (req, res) => {
  const { task, userId, dueDate } = req.body;
  
  if (!task) {
    return res.status(400).json({ error: 'Treść zadania jest wymagana' });
  }

  db.run(
    'INSERT INTO todos (family_id, user_id, task, due_date) VALUES (?, ?, ?, ?)',
    [req.user.familyId, userId || req.user.userId, task, dueDate],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd tworzenia zadania' });
      }
      res.json({ id: this.lastID, task, completed: 0, dueDate });
    }
  );
});

app.put('/api/todos/:id', authenticateToken, (req, res) => {
  const { task, completed, dueDate, userId } = req.body;
  
  db.run(
    'UPDATE todos SET task = ?, completed = ?, due_date = ?, user_id = ? WHERE id = ? AND family_id = ?',
    [task, completed ? 1 : 0, dueDate, userId, req.params.id, req.user.familyId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd aktualizacji zadania' });
      }
      res.json({ success: true });
    }
  );
});

app.patch('/api/todos/:id', authenticateToken, (req, res) => {
  const { completed } = req.body;
  
  db.run(
    'UPDATE todos SET completed = ? WHERE id = ? AND family_id = ?',
    [completed ? 1 : 0, req.params.id, req.user.familyId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd aktualizacji zadania' });
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/todos/:id', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM todos WHERE id = ? AND family_id = ?',
    [req.params.id, req.user.familyId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd usuwania zadania' });
      }
      res.json({ success: true });
    }
  );
});

// ==================== MEALS ROUTES ====================

app.get('/api/meals', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM meals WHERE family_id = ? ORDER BY CASE day_of_week WHEN "Poniedziałek" THEN 1 WHEN "Wtorek" THEN 2 WHEN "Środa" THEN 3 WHEN "Czwartek" THEN 4 WHEN "Piątek" THEN 5 WHEN "Sobota" THEN 6 WHEN "Niedziela" THEN 7 END',
    [req.user.familyId],
    (err, meals) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd pobierania posiłków' });
      }
      res.json(meals);
    }
  );
});

app.post('/api/meals', authenticateToken, (req, res) => {
  const { dayOfWeek, meal, recipeUrl } = req.body;
  
  if (!dayOfWeek || !meal) {
    return res.status(400).json({ error: 'Dzień i nazwa posiłku są wymagane' });
  }

  db.run(
    'INSERT INTO meals (family_id, day_of_week, meal, recipe_url) VALUES (?, ?, ?, ?)',
    [req.user.familyId, dayOfWeek, meal, recipeUrl],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd dodawania posiłku' });
      }
      res.json({ id: this.lastID, dayOfWeek, meal, recipeUrl });
    }
  );
});

app.put('/api/meals/:id', authenticateToken, (req, res) => {
  const { dayOfWeek, meal, recipeUrl } = req.body;
  
  db.run(
    'UPDATE meals SET day_of_week = ?, meal = ?, recipe_url = ? WHERE id = ? AND family_id = ?',
    [dayOfWeek, meal, recipeUrl, req.params.id, req.user.familyId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd aktualizacji posiłku' });
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/meals/:id', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM meals WHERE id = ? AND family_id = ?',
    [req.params.id, req.user.familyId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd usuwania posiłku' });
      }
      res.json({ success: true });
    }
  );
});

// ==================== NOTES ROUTES ====================

app.get('/api/notes', authenticateToken, (req, res) => {
  db.all(
    `SELECT n.*, u.name as user_name, u.color as user_color 
     FROM notes n 
     JOIN users u ON n.user_id = u.id 
     WHERE n.family_id = ?
     ORDER BY n.created_at DESC`,
    [req.user.familyId],
    (err, notes) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd pobierania notatek' });
      }
      res.json(notes);
    }
  );
});

app.post('/api/notes', authenticateToken, (req, res) => {
  const { title, content } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Tytuł notatki jest wymagany' });
  }

  db.run(
    'INSERT INTO notes (family_id, user_id, title, content) VALUES (?, ?, ?, ?)',
    [req.user.familyId, req.user.userId, title, content],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd tworzenia notatki' });
      }
      res.json({ id: this.lastID, title, content });
    }
  );
});

app.put('/api/notes/:id', authenticateToken, (req, res) => {
  const { title, content } = req.body;
  
  db.run(
    'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND family_id = ?',
    [title, content, req.params.id, req.user.familyId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd aktualizacji notatki' });
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/notes/:id', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM notes WHERE id = ? AND family_id = ?',
    [req.params.id, req.user.familyId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd usuwania notatki' });
      }
      res.json({ success: true });
    }
  );
});

// ==================== REMINDERS ROUTES ====================

app.get('/api/reminders', authenticateToken, (req, res) => {
  db.all(
    `SELECT r.*, u.name as user_name, u.color as user_color 
     FROM reminders r 
     JOIN users u ON r.user_id = u.id 
     WHERE r.family_id = ?
     ORDER BY r.remind_at`,
    [req.user.familyId],
    (err, reminders) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd pobierania przypomnień' });
      }
      res.json(reminders);
    }
  );
});

app.post('/api/reminders', authenticateToken, (req, res) => {
  const { title, description, remindAt, repeatType, userId } = req.body;
  
  if (!title || !remindAt) {
    return res.status(400).json({ error: 'Tytuł i data przypomnienia są wymagane' });
  }

  db.run(
    'INSERT INTO reminders (family_id, user_id, title, description, remind_at, repeat_type) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.familyId, userId || req.user.userId, title, description, remindAt, repeatType],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd tworzenia przypomnienia' });
      }
      res.json({ id: this.lastID, title, description, remindAt, repeatType });
    }
  );
});

app.put('/api/reminders/:id', authenticateToken, (req, res) => {
  const { title, description, remindAt, repeatType, userId } = req.body;
  
  db.run(
    'UPDATE reminders SET title = ?, description = ?, remind_at = ?, repeat_type = ?, user_id = ? WHERE id = ? AND family_id = ?',
    [title, description, remindAt, repeatType, userId, req.params.id, req.user.familyId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd aktualizacji przypomnienia' });
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/reminders/:id', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM reminders WHERE id = ? AND family_id = ?',
    [req.params.id, req.user.familyId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd usuwania przypomnienia' });
      }
      res.json({ success: true });
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  Database: ${dbPath}`);
});