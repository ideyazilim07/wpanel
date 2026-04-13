const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// WhatsApp Client
let client = null;
let isReady = false;
let qrCodeData = null;

// Initialize WhatsApp client
function initWhatsApp() {
  // Use a unique session path with timestamp to avoid conflicts
  const sessionId = Date.now().toString();
  const sessionPath = path.join(__dirname, '.wwebjs_auth', sessionId);
  
  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: sessionPath
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    }
  });

  // QR Code event
  client.on('qr', (qr) => {
    console.log('QR Code received');
    qrCodeData = qr;
    qrcode.generate(qr, { small: true });
  });

  // Ready event
  client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    isReady = true;
    qrCodeData = null;
  });

  // Auth failure
  client.on('auth_failure', (msg) => {
    console.error('Auth failure:', msg);
    isReady = false;
  });

  // Disconnected
  client.on('disconnected', (reason) => {
    console.log('Client disconnected:', reason);
    isReady = false;
    qrCodeData = null;
    // Reinitialize
    setTimeout(initWhatsApp, 5000);
  });

  // Message received (for logging)
  client.on('message', async (msg) => {
    console.log(`Message received from ${msg.from}: ${msg.body}`);
  });

  client.initialize();
}

// API Routes

// Get QR Code
app.get('/qr', (req, res) => {
  if (isReady) {
    return res.json({ status: 'ready', message: 'WhatsApp already connected' });
  }
  if (qrCodeData) {
    return res.json({ status: 'qr', qr: qrCodeData });
  }
  return res.json({ status: 'loading', message: 'Initializing...' });
});

// Get connection status
app.get('/status', (req, res) => {
  res.json({ 
    status: isReady ? 'connected' : 'disconnected',
    ready: isReady 
  });
});

// Send message
app.post('/send', async (req, res) => {
  const { phone, message } = req.body;
  
  if (!isReady) {
    return res.status(400).json({ error: 'WhatsApp not connected' });
  }
  
  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message required' });
  }
  
  try {
    // Format phone number
    let formattedPhone = phone.replace(/[^0-9]/g, '');
    if (!formattedPhone.startsWith('90')) {
      formattedPhone = '90' + formattedPhone;
    }
    
    const chatId = `${formattedPhone}@c.us`;
    
    await client.sendMessage(chatId, message);
    
    res.json({ 
      success: true, 
      message: 'Message sent successfully',
      to: formattedPhone 
    });
  } catch (error) {
    console.error('Send error:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error.message 
    });
  }
});

// Send bulk messages
app.post('/send-bulk', async (req, res) => {
  const { messages, delay = 3000 } = req.body;
  
  if (!isReady) {
    return res.status(400).json({ error: 'WhatsApp not connected' });
  }
  
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array required' });
  }
  
  const results = [];
  
  for (const msg of messages) {
    try {
      let formattedPhone = msg.phone.replace(/[^0-9]/g, '');
      if (!formattedPhone.startsWith('90')) {
        formattedPhone = '90' + formattedPhone;
      }
      
      const chatId = `${formattedPhone}@c.us`;
      await client.sendMessage(chatId, msg.message);
      
      results.push({ 
        phone: formattedPhone, 
        status: 'success' 
      });
      
      // Wait before next message
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      results.push({ 
        phone: msg.phone, 
        status: 'failed', 
        error: error.message 
      });
    }
  }
  
  res.json({ 
    success: true, 
    total: messages.length,
    sent: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'failed').length,
    results 
  });
});

// Logout
app.post('/logout', async (req, res) => {
  try {
    if (client) {
      await client.logout();
      await client.destroy();
    }
    
    // Clear session
    const sessionPath = path.join(__dirname, '.wwebjs_auth');
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true });
    }
    
    isReady = false;
    qrCodeData = null;
    
    // Reinitialize
    setTimeout(initWhatsApp, 2000);
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    whatsapp: isReady ? 'connected' : 'disconnected' 
  });
});

// Start server - FIXED PORT 3002
const PORT = 3002;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`WhatsApp Service running on port ${PORT}`);
  initWhatsApp();
});