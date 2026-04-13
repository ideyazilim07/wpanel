const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './wpanel.db';
const JWT_SECRET = 'wpanel-secret-key-change-in-production';

// WhatsApp Service Process
let whatsappProcess = null;

function startWhatsAppService() {
  const whatsappServicePath = path.join(__dirname, 'whatsapp-service', 'index.js');
  
  if (!fs.existsSync(whatsappServicePath)) {
    console.log('WhatsApp service not found, skipping...');
    return;
  }
  
  console.log('Starting WhatsApp service...');
  
  whatsappProcess = spawn('node', [whatsappServicePath], {
    cwd: path.join(__dirname, 'whatsapp-service'),
    stdio: 'pipe'
  });
  
  whatsappProcess.stdout.on('data', (data) => {
    console.log(`WhatsApp: ${data.toString().trim()}`);
  });
  
  whatsappProcess.stderr.on('data', (data) => {
    console.error(`WhatsApp Error: ${data.toString().trim()}`);
  });
  
  whatsappProcess.on('close', (code) => {
    console.log(`WhatsApp service exited with code ${code}`);
    // Restart after 5 seconds
    setTimeout(startWhatsAppService, 5000);
  });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(process.env.UPLOADS_PATH || './uploads')));

// Database setup
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  const schema = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Customers table
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      city TEXT,
      tags TEXT,
      consent_status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Campaigns table
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      campaign_type TEXT DEFAULT 'promotion',
      message_type TEXT DEFAULT 'text',
      message_content TEXT,
      status TEXT DEFAULT 'draft',
      total_recipients INTEGER DEFAULT 0,
      sent_count INTEGER DEFAULT 0,
      delivered_count INTEGER DEFAULT 0,
      failed_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Templates table
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      template_type TEXT DEFAULT 'info',
      message_type TEXT DEFAULT 'text',
      content TEXT NOT NULL,
      variables TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Message logs table
    CREATE TABLE IF NOT EXISTS message_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      campaign_id INTEGER,
      phone TEXT NOT NULL,
      message_type TEXT DEFAULT 'text',
      content TEXT,
      status TEXT DEFAULT 'pending',
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Settings table
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.exec(schema, (err) => {
    if (err) {
      console.error('Schema creation failed:', err);
    } else {
      console.log('Database schema initialized');
      createDefaultUser();
      createDefaultTemplates();
    }
  });
}

// Create default admin user
function createDefaultUser() {
  const email = 'admin@wpanel.com';
  const password = bcrypt.hashSync('admin123', 10);
  
  db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
    if (!row) {
      db.run(
        'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
        [email, password, 'Admin', 'User', 'admin'],
        (err) => {
          if (err) console.error('Default user creation failed:', err);
          else console.log('Default admin user created');
        }
      );
    }
  });
}

// Create default templates
function createDefaultTemplates() {
  const templates = [
    {
      name: 'Hoş Geldiniz',
      template_type: 'info',
      content: 'Merhaba {ad}, aramıza hoş geldiniz! Size özel fırsatlar için bizi takip edin.'
    },
    {
      name: 'İndirim Duyurusu',
      template_type: 'promotion',
      content: 'Sayın {ad} {soyad}, tüm ürünlerde %20 indirim fırsatını kaçırmayın!'
    },
    {
      name: 'Randevu Hatırlatması',
      template_type: 'reminder',
      content: 'Merhaba {ad}, yarın saat 14:00\'te randevunuz bulunmaktadır.'
    }
  ];

  templates.forEach(template => {
    db.get('SELECT id FROM templates WHERE name = ?', [template.name], (err, row) => {
      if (!row) {
        db.run(
          'INSERT INTO templates (name, template_type, content) VALUES (?, ?, ?)',
          [template.name, template.template_type, template.content]
        );
      }
    });
  });
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ? AND is_active = 1', [email], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, email, first_name, last_name, role FROM users WHERE id = ?', 
    [req.user.id], 
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    }
  );
});

// Dashboard stats
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const stats = {};
  
  db.get('SELECT COUNT(*) as count FROM customers', (err, row) => {
    stats.total_customers = row?.count || 0;
    
    db.get('SELECT COUNT(*) as count FROM customers WHERE consent_status = "active"', (err, row) => {
      stats.active_consent = row?.count || 0;
      
      db.get('SELECT COUNT(*) as count FROM campaigns', (err, row) => {
        stats.total_campaigns = row?.count || 0;
        
        db.get('SELECT COUNT(*) as count FROM message_logs WHERE DATE(created_at) = DATE("now")', (err, row) => {
          stats.today_sent = row?.count || 0;
          
          res.json(stats);
        });
      });
    });
  });
});

// Customers routes
app.get('/api/customers', authenticateToken, (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM customers';
  let countQuery = 'SELECT COUNT(*) as total FROM customers';
  let params = [];
  
  if (search) {
    query += ' WHERE first_name LIKE ? OR last_name LIKE ? OR phone LIKE ?';
    countQuery += ' WHERE first_name LIKE ? OR last_name LIKE ? OR phone LIKE ?';
    params = [`%${search}%`, `%${search}%`, `%${search}%`];
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  
  db.get(countQuery, params, (err, countRow) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.all(query, [...params, parseInt(limit), parseInt(offset)], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      
      res.json({
        customers: rows,
        total: countRow.total,
        page: parseInt(page),
        pages: Math.ceil(countRow.total / limit)
      });
    });
  });
});

app.post('/api/customers', authenticateToken, (req, res) => {
  const { first_name, last_name, phone, email, city, segment, notes } = req.body;
  
  db.run(
    'INSERT INTO customers (first_name, last_name, phone, email, city, segment, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [first_name, last_name, phone, email, city, segment, notes],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: 'Customer created successfully' });
    }
  );
});

// Campaigns routes
app.get('/api/campaigns', authenticateToken, (req, res) => {
  db.all('SELECT * FROM campaigns ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ campaigns: rows });
  });
});

app.post('/api/campaigns', authenticateToken, (req, res) => {
  const { name, campaign_type, message_type, message_content } = req.body;
  
  db.run(
    'INSERT INTO campaigns (name, campaign_type, message_type, message_content) VALUES (?, ?, ?, ?)',
    [name, campaign_type, message_type, message_content],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: 'Campaign created successfully' });
    }
  );
});

// Templates routes
app.get('/api/templates', authenticateToken, (req, res) => {
  db.all('SELECT * FROM templates WHERE is_active = 1 ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ templates: rows });
  });
});

app.get('/api/templates/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM templates WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Template not found' });
    res.json({ template: row });
  });
});

app.post('/api/templates', authenticateToken, (req, res) => {
  const { name, type, content, message_type = 'text' } = req.body;
  
  db.run(
    'INSERT INTO templates (name, template_type, content, message_type) VALUES (?, ?, ?, ?)',
    [name, type, content, message_type],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: 'Template created successfully' });
    }
  );
});

// Customer import
app.post('/api/customers/import', authenticateToken, (req, res) => {
  const { customers } = req.body;
  
  if (!Array.isArray(customers) || customers.length === 0) {
    return res.status(400).json({ error: 'No customers to import' });
  }
  
  let imported = 0;
  let errors = [];
  
  const stmt = db.prepare(
    'INSERT INTO customers (first_name, last_name, phone, email, city, tags, notes, consent_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  
  customers.forEach(customer => {
    try {
      stmt.run([
        customer.first_name,
        customer.last_name,
        customer.phone,
        customer.email || null,
        customer.city || null,
        customer.tags || null,
        customer.notes || null,
        customer.consent_status || 'active'
      ]);
      imported++;
    } catch (err) {
      errors.push({ phone: customer.phone, error: err.message });
    }
  });
  
  stmt.finalize();
  
  res.json({ imported, errors, total: customers.length });
});

// Settings routes
app.get('/api/settings', authenticateToken, (req, res) => {
  db.all('SELECT key, value FROM settings', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    res.json({ settings });
  });
});

app.put('/api/settings', authenticateToken, (req, res) => {
  const settings = req.body;
  
  const stmt = db.prepare(
    'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
  );
  
  Object.entries(settings).forEach(([key, value]) => {
    stmt.run([key, String(value)]);
  });
  
  stmt.finalize();
  
  res.json({ message: 'Settings saved successfully' });
});

app.post('/api/settings/test-connection', authenticateToken, (req, res) => {
  // Mock connection test - in real app, this would test WhatsApp API
  db.get('SELECT value FROM settings WHERE key = "whatsapp_api_url"', (err, row) => {
    if (err || !row || !row.value) {
      return res.status(400).json({ error: 'WhatsApp API URL not configured' });
    }
    
    // Simulate connection test
    setTimeout(() => {
      res.json({ status: 'connected', message: 'Connection successful' });
    }, 1000);
  });
});

// Change password
app.post('/api/auth/change-password', authenticateToken, (req, res) => {
  const { current_password, new_password } = req.body;
  
  db.get('SELECT password FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!bcrypt.compareSync(current_password, user.password)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    const hashedPassword = bcrypt.hashSync(new_password, 10);
    
    db.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Password changed successfully' });
      }
    );
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// WhatsApp proxy routes - MUST be before app.get('*')
app.get('/api/whatsapp/qr', async (req, res) => {
  try {
    const response = await fetch('http://localhost:3002/qr');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'WhatsApp service not available', details: error.message });
  }
});

app.get('/api/whatsapp/status', async (req, res) => {
  try {
    const response = await fetch('http://localhost:3002/status');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'WhatsApp service not available', details: error.message });
  }
});

app.post('/api/whatsapp/send', authenticateToken, async (req, res) => {
  try {
    const response = await fetch('http://localhost:3002/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'WhatsApp service not available', details: error.message });
  }
});

app.post('/api/whatsapp/send-bulk', authenticateToken, async (req, res) => {
  try {
    const response = await fetch('http://localhost:3002/send-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'WhatsApp service not available', details: error.message });
  }
});

app.post('/api/whatsapp/logout', async (req, res) => {
  try {
    const response = await fetch('http://localhost:3002/logout', { method: 'POST' });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'WhatsApp service not available', details: error.message });
  }
});

// Catch-all route - MUST be last
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // Start WhatsApp service
  startWhatsAppService();
});

module.exports = app;
