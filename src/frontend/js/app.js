// WPanel Desktop App - Main JavaScript

const API_URL = 'http://localhost:3000/api';
let authToken = localStorage.getItem('wpanel_token');
let currentUser = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  if (authToken) {
    validateToken();
  } else {
    showLoginScreen();
  }
  
  setupEventListeners();
  createModalContainer();
});

// Create modal container
function createModalContainer() {
  if (!document.getElementById('modal-container')) {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modal-container';
    document.body.appendChild(modalContainer);
  }
}

// Event Listeners
function setupEventListeners() {
  // Login form
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  
  // Logout button
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      navigateTo(page);
    });
  });
  
  // Toggle password visibility
  document.querySelector('.toggle-password')?.addEventListener('click', togglePassword);
}

// Login Handler
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      authToken = data.access_token;
      currentUser = data.user;
      localStorage.setItem('wpanel_token', authToken);
      showMainScreen();
      loadDashboard();
    } else {
      alert(data.error || 'Giriş başarısız');
    }
  } catch (error) {
    alert('Sunucuya bağlanılamadı. Lütfen uygulamanın çalıştığından emin olun.');
  }
}

// Validate Token
async function validateToken() {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      showMainScreen();
      loadDashboard();
    } else {
      localStorage.removeItem('wpanel_token');
      showLoginScreen();
    }
  } catch (error) {
    showLoginScreen();
  }
}

// Logout Handler
function handleLogout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('wpanel_token');
  showLoginScreen();
}

// Screen Navigation
function showLoginScreen() {
  document.getElementById('login-screen').classList.add('active');
  document.getElementById('main-screen').classList.remove('active');
}

function showMainScreen() {
  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('main-screen').classList.add('active');
  
  if (currentUser) {
    document.getElementById('user-name').textContent = 
      `${currentUser.first_name} ${currentUser.last_name}`;
  }
}

// Page Navigation
function navigateTo(page) {
  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  
  // Update page title
  const titles = {
    dashboard: 'Dashboard',
    customers: 'Müşteriler',
    campaigns: 'Kampanyalar',
    templates: 'Şablonlar',
    settings: 'Ayarlar'
  };
  document.getElementById('page-title').textContent = titles[page];
  
  // Load page content
  switch(page) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'customers':
      loadCustomers();
      break;
    case 'campaigns':
      loadCampaigns();
      break;
    case 'templates':
      loadTemplates();
      break;
    case 'settings':
      loadSettings();
      break;
  }
}

// Load Dashboard
async function loadDashboard() {
  const contentArea = document.getElementById('content-area');
  
  try {
    const response = await fetch(`${API_URL}/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const stats = await response.json();
    
    contentArea.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon customers">👥</div>
          <div class="stat-info">
            <div class="stat-value">${stats.total_customers || 0}</div>
            <div class="stat-label">Toplam Müşteri</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon active">✅</div>
          <div class="stat-info">
            <div class="stat-value">${stats.active_consent || 0}</div>
            <div class="stat-label">Aktif İzinli</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon sent">📨</div>
          <div class="stat-info">
            <div class="stat-value">${stats.today_sent || 0}</div>
            <div class="stat-label">Bugün Gönderilen</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon campaigns">📢</div>
          <div class="stat-info">
            <div class="stat-value">${stats.total_campaigns || 0}</div>
            <div class="stat-label">Kampanyalar</div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-title">🚀 Hızlı Başlangıç</span>
        </div>
        <div class="card-body">
          <p>WPanel'e hoş geldiniz! İşte yapabilecekleriniz:</p>
          <ul style="margin-top: 16px; padding-left: 20px; line-height: 2;">
            <li>📱 WhatsApp API'nizi bağlayın</li>
            <li>👥 Müşteri listenizi içe aktarın</li>
            <li>📢 Kampanya oluşturun ve gönderin</li>
            <li>📊 Gönderim raporlarını görüntüleyin</li>
          </ul>
        </div>
      </div>
    `;
  } catch (error) {
    contentArea.innerHTML = `
      <div class="card">
        <div class="card-body">
          <p>Veriler yüklenirken hata oluştu.</p>
        </div>
      </div>
    `;
  }
}

// Load Customers
async function loadCustomers() {
  const contentArea = document.getElementById('content-area');
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title">Müşteri Listesi</span>
        <div class="header-actions">
          <button class="btn btn-secondary" onclick="showImportModal()">
            <i class="fas fa-upload"></i> İçe Aktar
          </button>
          <button class="btn btn-primary" onclick="showAddCustomerModal()">
            <i class="fas fa-plus"></i> Yeni Müşteri
          </button>
        </div>
      </div>
      <div class="card-body">
        <div id="customers-table">Yükleniyor...</div>
      </div>
    </div>
  `;
  
  try {
    const response = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const data = await response.json();
    
    const tableHtml = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Ad Soyad</th>
            <th>Telefon</th>
            <th>E-posta</th>
            <th>Şehir</th>
            <th>Etiket</th>
            <th>Durum</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          ${data.customers?.map(c => `
            <tr>
              <td>${c.first_name} ${c.last_name}</td>
              <td>${c.phone}</td>
              <td>${c.email || '-'}</td>
              <td>${c.city || '-'}</td>
              <td>${c.tags || '-'}</td>
              <td><span class="badge badge-${c.consent_status === 'active' ? 'success' : c.consent_status === 'opt_out' ? 'danger' : 'warning'}">${c.consent_status}</span></td>
              <td>
                <button class="btn btn-sm btn-success" onclick="sendMessageToCustomer(${c.id}, '${c.phone}', '${c.first_name} ${c.last_name}')">📱 Mesaj</button>
                <button class="btn btn-sm btn-secondary" onclick="editCustomer(${c.id})">Düzenle</button>
              </td>
            </tr>
          `).join('') || '<tr><td colspan="7" style="text-align:center;">Henüz müşteri yok</td></tr>'}
        </tbody>
      </table>
    `;
    
    document.getElementById('customers-table').innerHTML = tableHtml;
  } catch (error) {
    document.getElementById('customers-table').innerHTML = '<p>Veriler yüklenirken hata oluştu.</p>';
  }
}

// Show Add Customer Modal
function showAddCustomerModal() {
  const modalContainer = document.getElementById('modal-container');
  
  modalContainer.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Yeni Müşteri Ekle</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="add-customer-form">
            <div class="form-row">
              <div class="form-group">
                <label>Ad *</label>
                <input type="text" name="first_name" class="form-control" required>
              </div>
              <div class="form-group">
                <label>Soyad *</label>
                <input type="text" name="last_name" class="form-control" required>
              </div>
            </div>
            
            <div class="form-group">
              <label>Telefon * (örn: 905551234567)</label>
              <input type="tel" name="phone" class="form-control" placeholder="905551234567" required>
            </div>
            
            <div class="form-group">
              <label>E-posta</label>
              <input type="email" name="email" class="form-control">
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Şehir</label>
                <input type="text" name="city" class="form-control">
              </div>
              <div class="form-group">
                <label>Etiket</label>
                <input type="text" name="tags" class="form-control" placeholder="VIP, Müşteri, vs.">
              </div>
            </div>
            
            <div class="form-group">
              <label>İzin Durumu</label>
              <select name="consent_status" class="form-control">
                <option value="active">✅ Aktif - Mesaj gönderilebilir</option>
                <option value="pending">⏳ Beklemede - Onay bekleniyor</option>
                <option value="opt_out">❌ Opt-out - Gönderim yapılamaz</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Not</label>
              <textarea name="notes" class="form-control" rows="3"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">İptal</button>
          <button class="btn btn-primary" onclick="saveCustomer()">Kaydet</button>
        </div>
      </div>
    </div>
  `;
  
  modalContainer.querySelector('.modal-overlay').classList.add('active');
}

// Show Import Modal
function showImportModal() {
  const modalContainer = document.getElementById('modal-container');
  
  modalContainer.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal modal-lg" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>CSV/Excel İçe Aktar</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="import-info">
            <h4>📋 Gerekli Sütunlar:</h4>
            <p><code>first_name</code>, <code>last_name</code>, <code>phone</code> (zorunlu)</p>
            <p>İsteğe bağlı: <code>email</code>, <code>city</code>, <code>tags</code>, <code>notes</code></p>
            <a href="#" class="btn btn-sm btn-secondary" onclick="downloadTemplate()">Örnek Şablon İndir</a>
          </div>
          
          <div class="file-upload-area" id="drop-zone">
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Dosya sürükleyin veya tıklayarak seçin</p>
            <input type="file" id="import-file" accept=".csv,.xlsx,.xls" onchange="handleFileSelect(event)">
          </div>
          
          <div id="import-preview"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">İptal</button>
          <button class="btn btn-primary" id="import-btn" onclick="importCustomers()" disabled>İçe Aktar</button>
        </div>
      </div>
    </div>
  `;
  
  // Drag and drop
  const dropZone = document.getElementById('drop-zone');
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length) {
      document.getElementById('import-file').files = files;
      handleFileSelect({ target: { files } });
    }
  });
  
  modalContainer.querySelector('.modal-overlay').classList.add('active');
}

// Handle file select for import
let importData = [];

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    
    // Simple CSV parser
    const lines = content.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    
    importData = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      if (row.first_name && row.last_name && row.phone) {
        importData.push(row);
      }
    }
    
    document.getElementById('import-preview').innerHTML = `
      <div class="alert alert-info">
        <strong>${importData.length}</strong> müşteri bulundu. 
        İlk 3 kayıt önizleme:
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Ad</th>
            <th>Soyad</th>
            <th>Telefon</th>
            <th>Şehir</th>
          </tr>
        </thead>
        <tbody>
          ${importData.slice(0, 3).map(c => `
            <tr>
              <td>${c.first_name}</td>
              <td>${c.last_name}</td>
              <td>${c.phone}</td>
              <td>${c.city || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    document.getElementById('import-btn').disabled = false;
  };
  
  reader.readAsText(file);
}

// Download CSV template
function downloadTemplate() {
  const csv = 'first_name,last_name,phone,email,city,tags,notes\n' +
              'Ahmet,Yılmaz,905551234567,ahmet@email.com,İstanbul,VIP,Müşteri notu\n' +
              'Ayşe,Demir,905559876543,ayse@email.com,Ankara,Müşteri,\n';
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wpanel_musteri_sablonu.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// Import customers
async function importCustomers() {
  if (!importData.length) return;
  
  try {
    const response = await fetch(`${API_URL}/customers/import`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ customers: importData })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      alert(`${result.imported} müşteri başarıyla içe aktarıldı!`);
      closeModal();
      loadCustomers();
    } else {
      alert('İçe aktarma hatası: ' + (result.error || 'Bilinmeyen hata'));
    }
  } catch (error) {
    alert('Sunucu hatası: ' + error.message);
  }
}

// Save customer
async function saveCustomer() {
  const form = document.getElementById('add-customer-form');
  const formData = new FormData(form);
  
  const customer = {
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    city: formData.get('city'),
    tags: formData.get('tags'),
    consent_status: formData.get('consent_status'),
    notes: formData.get('notes')
  };
  
  try {
    const response = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(customer)
    });
    
    if (response.ok) {
      alert('Müşteri başarıyla eklendi!');
      closeModal();
      loadCustomers();
    } else {
      const data = await response.json();
      alert('Hata: ' + (data.error || 'Müşteri eklenemedi'));
    }
  } catch (error) {
    alert('Sunucu hatası: ' + error.message);
  }
}

// Edit customer
function editCustomer(id) {
  alert('Düzenleme özelliği yakında eklenecek! ID: ' + id);
}

// Send message to customer
function sendMessageToCustomer(id, phone, name) {
  const modalContainer = document.getElementById('modal-container');
  
  modalContainer.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>📱 WhatsApp Mesaj Gönder</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Alıcı</label>
            <input type="text" class="form-control" value="${name} (${phone})" readonly>
          </div>
          
          <div class="form-group">
            <label>Mesaj İçeriği</label>
            <textarea id="message-content" class="form-control" rows="4" placeholder="Mesajınızı yazın..."></textarea>
            <small class="form-hint">Değişkenler: {ad}, {soyad}, {telefon}</small>
          </div>
          
          <div class="form-group">
            <label>Hazır Şablon</label>
            <select class="form-control" onchange="applyQuickTemplate(this.value)">
              <option value="">Şablon seçin...</option>
              <option value="merhaba">Merhaba</option>
              <option value="kampanya">Kampanya</option>
              <option value="hatirlatma">Hatırlatma</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">İptal</button>
          <button class="btn btn-primary" onclick="submitMessage('${phone}', '${name}')">📤 Gönder</button>
        </div>
      </div>
    </div>
  `;
  
  modalContainer.querySelector('.modal-overlay').classList.add('active');
}

// Apply quick template
function applyQuickTemplate(template) {
  const messageInput = document.getElementById('message-content');
  const templates = {
    merhaba: 'Merhaba {ad},\n\nSize özel fırsatlarımızdan bahsetmek istedik.\n\nSaygılarımızla,',
    kampanya: '🎉 Merhaba {ad}!\n\nYeni kampanyamız başladı! Detaylar için bize ulaşın.\n\nSaygılarımızla,',
    hatirlatma: '⏰ Merhaba {ad},\n\nRandevunuzu hatırlatmak istedik.\n\nSaygılarımızla,'
  };
  
  if (templates[template]) {
    messageInput.value = templates[template];
  }
}

// Submit message
async function submitMessage(phone, name) {
  const messageInput = document.getElementById('message-content');
  let message = messageInput.value;
  
  if (!message.trim()) {
    alert('Lütfen bir mesaj yazın!');
    return;
  }
  
  // Replace variables
  const nameParts = name.split(' ');
  message = message.replace(/{ad}/g, nameParts[0] || '');
  message = message.replace(/{soyad}/g, nameParts.slice(1).join(' ') || '');
  message = message.replace(/{telefon}/g, phone);
  
  try {
    const response = await fetch(`${API_URL}/whatsapp/send`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ phone, message })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('✅ Mesaj başarıyla gönderildi!');
      closeModal();
    } else {
      alert('❌ Gönderim hatası: ' + (data.error || 'Bilinmeyen hata'));
    }
  } catch (error) {
    alert('❌ Bağlantı hatası: ' + error.message);
  }
}

// Close modal
function closeModal(event) {
  if (event && event.target !== event.currentTarget) return;
  const modalContainer = document.getElementById('modal-container');
  if (modalContainer) {
    modalContainer.innerHTML = '';
  }
}

// Load Campaigns
async function loadCampaigns() {
  const contentArea = document.getElementById('content-area');
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title">Kampanyalar</span>
        <button class="btn btn-primary" onclick="showCreateCampaignModal()">
          <i class="fas fa-plus"></i> Yeni Kampanya
        </button>
      </div>
      <div class="card-body">
        <div id="campaigns-list">Yükleniyor...</div>
      </div>
    </div>
  `;
  
  try {
    const response = await fetch(`${API_URL}/campaigns`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const data = await response.json();
    
    const campaignsHtml = data.campaigns?.length ? `
      <table class="data-table">
        <thead>
          <tr>
            <th>Kampanya Adı</th>
            <th>Tür</th>
            <th>Hedef</th>
            <th>Durum</th>
            <th>Gönderilen</th>
            <th>Tarih</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          ${data.campaigns.map(c => `
            <tr>
              <td>${c.name}</td>
              <td><span class="badge badge-info">${c.campaign_type || c.type || 'Bilinmiyor'}</span></td>
              <td>${c.total_recipients || c.target_count || 0} kişi</td>
              <td><span class="badge badge-${c.status === 'completed' ? 'success' : c.status === 'running' ? 'warning' : 'secondary'}">${c.status || 'draft'}</span></td>
              <td>${c.sent_count || 0}/${c.total_recipients || c.target_count || 0}</td>
              <td>${new Date(c.created_at).toLocaleDateString('tr-TR')}</td>
              <td>
                <button class="btn btn-sm btn-success" onclick="sendCampaign(${c.id})" ${c.status === 'completed' ? 'disabled' : ''}>📤 Gönder</button>
                <button class="btn btn-sm btn-secondary" onclick="editCampaign(${c.id})">Düzenle</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCampaign(${c.id})">Sil</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<p>Henüz kampanya oluşturulmamış.</p>';
    
    document.getElementById('campaigns-list').innerHTML = campaignsHtml;
  } catch (error) {
    document.getElementById('campaigns-list').innerHTML = '<p>Kampanyalar yüklenirken hata oluştu.</p>';
  }
}

// Show Create Campaign Modal
async function showCreateCampaignModal() {
  // Get customers for targeting
  let customers = [];
  try {
    const response = await fetch(`${API_URL}/customers?consent_status=active`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();
    customers = data.customers || [];
  } catch (e) {}
  
  // Get templates
  let templates = [];
  try {
    const response = await fetch(`${API_URL}/templates`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();
    templates = data.templates || [];
  } catch (e) {}
  
  const modalContainer = document.getElementById('modal-container');
  
  modalContainer.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal modal-xl" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Yeni Kampanya Oluştur</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="campaign-form">
            <div class="form-group">
              <label>Kampanya Adı *</label>
              <input type="text" name="name" class="form-control" required placeholder="Yaz İndirim Kampanyası">
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Kampanya Türü</label>
                <select name="type" class="form-control">
                  <option value="bilgilendirme">📢 Bilgilendirme</option>
                  <option value="kampanya">🎁 Kampanya</option>
                  <option value="duyuru">📣 Duyuru</option>
                  <option value="hatirlatma">⏰ Hatırlatma</option>
                </select>
              </div>
              <div class="form-group">
                <label>Mesaj Türü</label>
                <select name="message_type" class="form-control" onchange="toggleMediaUpload()">
                  <option value="text">📝 Metin</option>
                  <option value="image">🖼️ Görsel</option>
                  <option value="video">🎥 Video</option>
                  <option value="audio">🎵 Ses</option>
                  <option value="document">📄 PDF/Doküman</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label>Hedef Kitle</label>
              <div class="target-selection">
                <label class="checkbox-label">
                  <input type="radio" name="target_type" value="all" checked onchange="updateTargetCount()"> 
                  Tüm izinli müşteriler (${customers.length} kişi)
                </label>
                <label class="checkbox-label">
                  <input type="radio" name="target_type" value="tag" onchange="updateTargetCount()"> 
                  Etikete göre filtrele
                </label>
              </div>
              <div id="tag-filter" style="display:none; margin-top:10px;">
                <input type="text" name="tag_filter" class="form-control" placeholder="Etiket girin (örn: VIP)">
              </div>
              <div class="target-count" style="margin-top:10px; color: var(--success-color);">
                <strong>Hedef: ${customers.length} kişi</strong>
              </div>
            </div>
            
            <div class="form-group">
              <label>Mesaj İçeriği *</label>
              <textarea name="message" class="form-control" rows="4" required placeholder="Mesajınızı yazın...&#10;&#10;Değişkenler: {ad}, {soyad}, {şehir}"></textarea>
              <small class="form-hint">Değişkenler: {ad}, {soyad}, {şehir}, {telefon}</small>
            </div>
            
            <div class="form-group" id="media-upload" style="display:none;">
              <label>Medya Dosyası</label>
              <input type="file" name="media" class="form-control" accept="image/*,video/*,audio/*,.pdf">
              <small class="form-hint">Max: 16MB</small>
            </div>
            
            <div class="form-group">
              <label>Hazır Şablon</label>
              <select class="form-control" onchange="applyTemplate(this.value)">
                <option value="">Şablon seçin...</option>
                ${templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
              </select>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Gönderim Hızı</label>
                <select name="speed" class="form-control">
                  <option value="slow">🐌 Yavaş (1sn aralık)</option>
                  <option value="normal" selected>🚶 Normal (3sn aralık)</option>
                  <option value="fast">🚀 Hızlı (5sn aralık)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Zamanlama</label>
                <select name="schedule" class="form-control" onchange="toggleSchedule()">
                  <option value="now">🚀 Hemen Gönder</option>
                  <option value="later">⏰ Zamanla</option>
                </select>
              </div>
            </div>
            
            <div class="form-group" id="schedule-time" style="display:none;">
              <label>Gönderim Zamanı</label>
              <input type="datetime-local" name="scheduled_at" class="form-control">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">İptal</button>
          <button class="btn btn-primary" onclick="createCampaign()">Kampanya Oluştur</button>
        </div>
      </div>
    </div>
  `;
  
  modalContainer.querySelector('.modal-overlay').classList.add('active');
}

// Toggle media upload
function toggleMediaUpload() {
  const type = document.querySelector('[name="message_type"]').value;
  const uploadDiv = document.getElementById('media-upload');
  uploadDiv.style.display = type === 'text' ? 'none' : 'block';
}

// Toggle schedule
function toggleSchedule() {
  const schedule = document.querySelector('[name="schedule"]').value;
  document.getElementById('schedule-time').style.display = schedule === 'later' ? 'block' : 'none';
}

// Update target count
function updateTargetCount() {
  const targetType = document.querySelector('[name="target_type"]:checked').value;
  document.getElementById('tag-filter').style.display = targetType === 'tag' ? 'block' : 'none';
}

// Apply template
async function applyTemplate(templateId) {
  if (!templateId) return;
  
  try {
    const response = await fetch(`${API_URL}/templates/${templateId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();
    
    if (data.template) {
      document.querySelector('[name="message"]').value = data.template.content;
      document.querySelector('[name="message_type"]').value = data.template.message_type || 'text';
      toggleMediaUpload();
    }
  } catch (e) {}
}

// Create campaign
async function createCampaign() {
  const form = document.getElementById('campaign-form');
  const formData = new FormData(form);
  
  const campaign = {
    name: formData.get('name'),
    type: formData.get('type'),
    message_type: formData.get('message_type'),
    message: formData.get('message'),
    target_type: formData.get('target_type'),
    tag_filter: formData.get('tag_filter'),
    speed: formData.get('speed'),
    schedule: formData.get('schedule'),
    scheduled_at: formData.get('scheduled_at')
  };
  
  try {
    const response = await fetch(`${API_URL}/campaigns`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(campaign)
    });
    
    if (response.ok) {
      alert('Kampanya başarıyla oluşturuldu!');
      closeModal();
      loadCampaigns();
    } else {
      const data = await response.json();
      alert('Hata: ' + (data.error || 'Kampanya oluşturulamadı'));
    }
  } catch (error) {
    alert('Sunucu hatası: ' + error.message);
  }
}

// Load Templates
async function loadTemplates() {
  const contentArea = document.getElementById('content-area');
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title">Mesaj Şablonları</span>
        <button class="btn btn-primary" onclick="showAddTemplateModal()">
          <i class="fas fa-plus"></i> Yeni Şablon
        </button>
      </div>
      <div class="card-body">
        <div id="templates-list">Yükleniyor...</div>
      </div>
    </div>
  `;
  
  try {
    const response = await fetch(`${API_URL}/templates`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const data = await response.json();
    
    const templatesHtml = data.templates?.length ? `
      <div class="templates-grid">
        ${data.templates.map(t => `
          <div class="template-card">
            <div class="template-header">
              <h4>${t.name}</h4>
              <span class="badge badge-${t.template_type === 'kampanya' ? 'success' : t.template_type === 'bilgilendirme' ? 'info' : 'warning'}">${t.template_type || t.type || 'Genel'}</span>
            </div>
            <div class="template-preview">
              ${t.content.substring(0, 100)}${t.content.length > 100 ? '...' : ''}
            </div>
            <div class="template-actions">
              <button class="btn btn-sm btn-secondary" onclick="editTemplate(${t.id})">Düzenle</button>
              <button class="btn btn-sm btn-primary" onclick="useTemplate(${t.id})">Kullan</button>
            </div>
          </div>
        `).join('')}
      </div>
    ` : '<p>Henüz şablon oluşturulmamış.</p>';
    
    document.getElementById('templates-list').innerHTML = templatesHtml;
  } catch (error) {
    document.getElementById('templates-list').innerHTML = '<p>Şablonlar yüklenirken hata oluştu.</p>';
  }
}

// Show Add Template Modal
function showAddTemplateModal() {
  const modalContainer = document.getElementById('modal-container');
  
  modalContainer.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Yeni Şablon</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="template-form">
            <div class="form-group">
              <label>Şablon Adı *</label>
              <input type="text" name="name" class="form-control" required>
            </div>
            
            <div class="form-group">
              <label>Tür</label>
              <select name="type" class="form-control">
                <option value="bilgilendirme">📢 Bilgilendirme</option>
                <option value="kampanya">🎁 Kampanya</option>
                <option value="duyuru">📣 Duyuru</option>
                <option value="hatirlatma">⏰ Hatırlatma</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>İçerik *</label>
              <textarea name="content" class="form-control" rows="6" required placeholder="Merhaba {ad} {soyad},&#10;&#10;Size özel fırsatlarımızdan yararlanmak için...&#10;&#10;Saygılarımızla,"></textarea>
              <small class="form-hint">Değişkenler: {ad}, {soyad}, {şehir}, {telefon}, {etiket}</small>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">İptal</button>
          <button class="btn btn-primary" onclick="saveTemplate()">Kaydet</button>
        </div>
      </div>
    </div>
  `;
  
  modalContainer.querySelector('.modal-overlay').classList.add('active');
}

// Save template
async function saveTemplate() {
  const form = document.getElementById('template-form');
  const formData = new FormData(form);
  
  const template = {
    name: formData.get('name'),
    type: formData.get('type'),
    content: formData.get('content'),
    message_type: 'text'
  };
  
  try {
    const response = await fetch(`${API_URL}/templates`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(template)
    });
    
    if (response.ok) {
      alert('Şablon başarıyla kaydedildi!');
      closeModal();
      loadTemplates();
    } else {
      const data = await response.json();
      alert('Hata: ' + (data.error || 'Şablon kaydedilemedi'));
    }
  } catch (error) {
    alert('Sunucu hatası: ' + error.message);
  }
}

// Use template
function useTemplate(id) {
  navigateTo('campaigns');
  setTimeout(() => showCreateCampaignModal(), 100);
}

// Edit template
function editTemplate(id) {
  alert('Düzenleme özelliği yakında! ID: ' + id);
}

// Campaign actions
function sendCampaign(id) {
  if (!confirm('Kampanyayı şimdi göndermek istediğinize emin misiniz?')) return;
  
  // Show loading
  const btn = document.querySelector(`button[onclick="sendCampaign(${id})"]`);
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Gönderiliyor...';
  }
  
  // Simulate sending (in real app, this would call the API)
  setTimeout(() => {
    alert('✅ Kampanya başarıyla gönderildi!');
    loadCampaigns(); // Refresh list
  }, 2000);
}

function editCampaign(id) {
  alert('Kampanya düzenleme özelliği yakında eklenecek! ID: ' + id);
}

function deleteCampaign(id) {
  if (!confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) return;
  
  // In real app, this would call DELETE API
  alert('Kampanya silindi! ID: ' + id);
  loadCampaigns(); // Refresh list
}

// Load Settings
async function loadSettings() {
  const contentArea = document.getElementById('content-area');
  
  // Get current settings
  let settings = {};
  try {
    const response = await fetch(`${API_URL}/settings`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();
    settings = data.settings || {};
  } catch (e) {}
  
  contentArea.innerHTML = `
    <div class="settings-grid">
      <div class="card">
        <div class="card-header">
          <span class="card-title">📱 WhatsApp API Bağlantısı</span>
        </div>
        <div class="card-body">
          <form id="whatsapp-settings-form">
            <div class="form-group">
              <label>API URL</label>
              <input type="url" name="api_url" class="form-control" value="${settings.whatsapp_api_url || ''}" placeholder="https://api.evolution.com">
              <small class="form-hint">Evolution API veya WhatsApp Business API URL</small>
            </div>
            
            <div class="form-group">
              <label>API Key</label>
              <input type="password" name="api_key" class="form-control" value="${settings.whatsapp_api_key || ''}" placeholder="API Key">
            </div>
            
            <div class="form-group">
              <label>Instance Adı</label>
              <input type="text" name="instance_name" class="form-control" value="${settings.whatsapp_instance || ''}" placeholder="wpanel">
            </div>
            
            <div class="form-group">
              <label>Durum</label>
              <div id="connection-status" class="connection-status">
                <span class="status-dot offline"></span> Bağlantı test edilmedi
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onclick="testConnection()">Bağlantı Testi</button>
              <button type="button" class="btn btn-success" onclick="showWhatsAppConnectModal()">📱 WhatsApp Bağlan</button>
              <button type="button" class="btn btn-primary" onclick="saveWhatsAppSettings()">Kaydet</button>
            </div>
          </form>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚙️ Genel Ayarlar</span>
        </div>
        <div class="card-body">
          <form id="general-settings-form">
            <div class="form-group">
              <label>Varsayılan Gönderim Hızı</label>
              <select name="default_speed" class="form-control">
                <option value="1" ${settings.default_speed === '1' ? 'selected' : ''}>1 saniye (Yavaş)</option>
                <option value="3" ${settings.default_speed === '3' || !settings.default_speed ? 'selected' : ''}>3 saniye (Normal)</option>
                <option value="5" ${settings.default_speed === '5' ? 'selected' : ''}>5 saniye (Hızlı)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Maksimum Dosya Boyutu (MB)</label>
              <input type="number" name="max_file_size" class="form-control" value="${settings.max_file_size || '16'}" min="1" max="100">
            </div>
            
            <div class="form-group">
              <label>
                <input type="checkbox" name="auto_opt_out" ${settings.auto_opt_out === 'true' ? 'checked' : ''}>
                "Çıkış" yazanları otomatik opt-out yap
              </label>
            </div>
            
            <button type="button" class="btn btn-primary" onclick="saveGeneralSettings()">Kaydet</button>
          </form>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-title">👤 Hesap Bilgileri</span>
        </div>
        <div class="card-body">
          <div class="user-info">
            <p><strong>Ad:</strong> ${currentUser?.first_name || ''} ${currentUser?.last_name || ''}</p>
            <p><strong>E-posta:</strong> ${currentUser?.email || ''}</p>
            <p><strong>Rol:</strong> ${currentUser?.role || 'admin'}</p>
          </div>
          <hr>
          <button class="btn btn-secondary" onclick="showChangePasswordModal()">Şifre Değiştir</button>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-title">❓ Yardım ve Destek</span>
        </div>
        <div class="card-body">
          <div class="help-section">
            <h4>🚀 Hızlı Başlangıç</h4>
            <ol style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
              <li>WhatsApp Business hesabınızı hazırlayın</li>
              <li>"📱 WhatsApp Bağlan" butonuna tıklayın</li>
              <li>QR kodu telefonunuzdan okutun</li>
              <li>Müşteriler sayfasından mesaj gönderin</li>
            </ol>
            
            <h4 style="margin-top: 20px;">💡 İpuçları</h4>
            <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
              <li>Telefon numaraları <code>905XXXXXXXXX</code> formatında olmalı</li>
              <li>Spam gönderimden kaçının (hesap banlanabilir)</li>
              <li>Opt-out olan müşterilere mesaj göndermeyin</li>
              <li>Şablonlarda <code>{ad}</code>, <code>{soyad}</code> değişkenlerini kullanabilirsiniz</li>
            </ul>
            
            <h4 style="margin-top: 20px;">🐛 Sorun Giderme</h4>
            <p style="margin: 10px 0;"><strong>QR kod görünmüyor:</strong> "Yenile" butonuna tıklayın veya uygulamayı yeniden başlatın.</p>
            <p style="margin: 10px 0;"><strong>Mesaj gitmiyor:</strong> WhatsApp bağlantısını kontrol edin, numara formatını doğrulayın.</p>
            
            <h4 style="margin-top: 20px;">📞 Destek</h4>
            <p>Sorularınız için: <a href="mailto:destek@wpanel.com.tr" style="color: var(--primary);">destek@wpanel.com.tr</a></p>
            <p>GitHub: <a href="https://github.com/ideyazilim07/wpanel" target="_blank" style="color: var(--primary);">github.com/ideyazilim07/wpanel</a></p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Show WhatsApp Connect Modal (WhatsApp Web.js)
async function showWhatsAppConnectModal() {
  const modalContainer = document.getElementById('modal-container');
  
  modalContainer.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>📱 WhatsApp Bağlantısı</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div id="qr-container" style="text-align: center; padding: 20px;">
            <p>QR kod alınıyor...</p>
            <div class="loading-spinner"></div>
          </div>
          <div id="qr-status" style="margin-top: 20px; text-align: center;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">Kapat</button>
          <button class="btn btn-danger" onclick="logoutWhatsApp()">🚪 Çıkış Yap</button>
          <button class="btn btn-primary" onclick="refreshWhatsAppQR()">🔄 Yenile</button>
        </div>
      </div>
    </div>
  `;
  
  modalContainer.querySelector('.modal-overlay').classList.add('active');
  
  // Fetch QR code from local WhatsApp service
  fetchWhatsAppQR();
}

// Fetch QR Code from WhatsApp Web.js Service
async function fetchWhatsAppQR() {
  const qrContainer = document.getElementById('qr-container');
  const qrStatus = document.getElementById('qr-status');
  
  try {
    // Check status first
    const statusResponse = await fetch(`${API_URL}/whatsapp/status`);
    const statusData = await statusResponse.json();
    
    if (statusData.status === 'connected') {
      qrContainer.innerHTML = `
        <div style="text-align: center; padding: 30px;">
          <div style="font-size: 60px; margin-bottom: 15px;">✅</div>
          <h3 style="color: var(--success-color);">WhatsApp Bağlı</h3>
          <p style="color: var(--text-secondary);">WhatsApp hesabınız başarıyla bağlandı!</p>
          <p style="margin-top: 10px; font-size: 12px; color: var(--text-muted);">
            Telefon: ${statusData.info?.phone || 'Bilinmiyor'}
          </p>
        </div>
      `;
      qrStatus.innerHTML = '<span style="color: var(--success-color);">✅ Bağlantı aktif</span>';
      return;
    }
    
    // Get QR code
    const response = await fetch(`${API_URL}/whatsapp/qr`);
    const data = await response.json();
    
    if (data.status === 'qr' && data.qr) {
      // Generate QR code image
      qrContainer.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 10px; display: inline-block;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data.qr)}" 
               alt="WhatsApp QR Code" style="max-width: 250px; max-height: 250px;">
        </div>
        <p style="margin-top: 15px; color: var(--text-secondary);">
          WhatsApp uygulamanızı açın ve Ayarlar > Bağlı Cihazlar > Cihaz Bağla yolunu izleyin
        </p>
      `;
      qrStatus.innerHTML = '<span style="color: var(--warning-color);">⏳ QR kod okutulmayı bekliyor...</span>';
      
      // Start polling for connection status
      startWhatsAppPolling();
    } else if (data.status === 'ready') {
      qrContainer.innerHTML = `
        <div style="text-align: center; padding: 30px;">
          <div style="font-size: 60px; margin-bottom: 15px;">✅</div>
          <h3 style="color: var(--success-color);">WhatsApp Bağlı</h3>
          <p style="color: var(--text-secondary);">WhatsApp hesabınız başarıyla bağlandı!</p>
        </div>
      `;
      qrStatus.innerHTML = '<span style="color: var(--success-color);">✅ Bağlantı başarılı!</span>';
    } else {
      qrContainer.innerHTML = `
        <div style="text-align: center; padding: 30px;">
          <div style="font-size: 60px; margin-bottom: 15px;">⏳</div>
          <h3>WhatsApp Başlatılıyor</h3>
          <p style="color: var(--text-secondary);">Lütfen bekleyin...</p>
        </div>
      `;
      qrStatus.innerHTML = '<span style="color: var(--text-muted);">Başlatılıyor...</span>';
      
      // Retry after 3 seconds
      setTimeout(fetchWhatsAppQR, 3000);
    }
  } catch (error) {
    qrContainer.innerHTML = `
      <div style="text-align: center; padding: 30px;">
        <div style="font-size: 60px; margin-bottom: 15px;">❌</div>
        <h3>Bağlantı Hatası</h3>
        <p style="color: var(--text-secondary);">WhatsApp servisi çalışmıyor</p>
        <p style="margin-top: 10px; font-size: 12px; color: var(--danger-color);">${error.message}</p>
      </div>
    `;
    qrStatus.innerHTML = '<span style="color: var(--danger-color);">❌ Servis kullanılamıyor</span>';
  }
}

// Refresh WhatsApp QR
function refreshWhatsAppQR() {
  const qrContainer = document.getElementById('qr-container');
  qrContainer.innerHTML = `
    <p>QR kod alınıyor...</p>
    <div class="loading-spinner"></div>
  `;
  fetchWhatsAppQR();
}

// Start polling for WhatsApp connection status
function startWhatsAppPolling() {
  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch(`${API_URL}/whatsapp/status`);
      const data = await response.json();
      
      if (data.status === 'connected') {
        clearInterval(pollInterval);
        document.getElementById('qr-container').innerHTML = `
          <div style="text-align: center; padding: 30px;">
            <div style="font-size: 60px; margin-bottom: 15px;">✅</div>
            <h3 style="color: var(--success-color);">WhatsApp Bağlı</h3>
            <p style="color: var(--text-secondary);">WhatsApp hesabınız başarıyla bağlandı!</p>
            <p style="margin-top: 10px; font-size: 12px; color: var(--text-muted);">
              Telefon: ${data.info?.phone || 'Bilinmiyor'}
            </p>
          </div>
        `;
        document.getElementById('qr-status').innerHTML = '<span style="color: var(--success-color);">✅ Bağlantı başarılı!</span>';
      }
    } catch (e) {}
  }, 3000);
  
  // Stop polling after 3 minutes
  setTimeout(() => clearInterval(pollInterval), 180000);
}

// Logout WhatsApp
async function logoutWhatsApp() {
  if (!confirm('WhatsApp bağlantısını kesmek istediğinize emin misiniz?')) return;
  
  try {
    const response = await fetch(`${API_URL}/whatsapp/logout`, { method: 'POST' });
    const data = await response.json();
    
    if (data.success) {
      alert('WhatsApp bağlantısı kesildi.');
      refreshWhatsAppQR();
    } else {
      alert('Çıkış yapılırken hata oluştu.');
    }
  } catch (error) {
    alert('Hata: ' + error.message);
  }
}

// Send WhatsApp Message
async function sendWhatsAppMessage(phone, message) {
  try {
    const response = await fetch(`${API_URL}/whatsapp/send`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ phone, message })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

// Send Bulk WhatsApp Messages
async function sendBulkWhatsAppMessages(messages, delay = 3000) {
  try {
    const response = await fetch(`${API_URL}/whatsapp/send-bulk`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ messages, delay })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

// Refresh QR Code
function refreshQRCode() {
  const qrContainer = document.getElementById('qr-container');
  qrContainer.innerHTML = `
    <p>QR kod alınıyor...</p>
    <div class="loading-spinner"></div>
  `;
  
  // Get current settings
  fetch(`${API_URL}/settings`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  })
  .then(r => r.json())
  .then(data => {
    const apiUrl = data.settings?.whatsapp_api_url || '';
    const apiKey = data.settings?.whatsapp_api_key || '';
    const instanceName = data.settings?.whatsapp_instance || '';
    
    if (apiUrl && apiKey && instanceName) {
      fetchQRCode(apiUrl, apiKey, instanceName);
    }
  });
}

// Start polling for connection status
function startConnectionPolling(apiUrl, apiKey, instanceName) {
  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch(`${apiUrl}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: { 
          'apikey': apiKey
        }
      });
      
      const data = await response.json();
      
      if (data.state === 'open') {
        clearInterval(pollInterval);
        document.getElementById('qr-container').innerHTML = `
          <div style="text-align: center; padding: 30px;">
            <div style="font-size: 60px; margin-bottom: 15px;">✅</div>
            <h3 style="color: var(--success-color);">WhatsApp Bağlı</h3>
            <p style="color: var(--text-secondary);">WhatsApp hesabınız başarıyla bağlandı!</p>
          </div>
        `;
        document.getElementById('qr-status').innerHTML = '<span style="color: var(--success-color);">✅ Bağlantı başarılı!</span>';
      }
    } catch (e) {}
  }, 3000); // Poll every 3 seconds
  
  // Stop polling after 2 minutes
  setTimeout(() => clearInterval(pollInterval), 120000);
}

// Test WhatsApp connection
async function testConnection() {
  const btn = document.querySelector('[onclick="testConnection()"]');
  btn.textContent = 'Test ediliyor...';
  btn.disabled = true;
  
  const form = document.getElementById('whatsapp-settings-form');
  const formData = new FormData(form);
  
  const apiUrl = formData.get('api_url');
  const apiKey = formData.get('api_key');
  const instanceName = formData.get('instance_name');
  
  if (!apiUrl || !apiKey || !instanceName) {
    alert('Lütfen tüm alanları doldurun!');
    btn.textContent = 'Bağlantı Testi';
    btn.disabled = false;
    return;
  }
  
  try {
    const response = await fetch(`${apiUrl}/instance/connectionState/${instanceName}`, {
      method: 'GET',
      headers: { 
        'apikey': apiKey
      }
    });
    
    const data = await response.json();
    const statusEl = document.getElementById('connection-status');
    
    if (response.ok) {
      if (data.state === 'open') {
        statusEl.innerHTML = '<span class="status-dot online"></span> ✅ WhatsApp Bağlı';
      } else {
        statusEl.innerHTML = '<span class="status-dot offline"></span> ⚠️ WhatsApp Bağlı Değil (QR kod ile bağlanın)';
      }
    } else {
      statusEl.innerHTML = '<span class="status-dot offline"></span> ❌ Bağlantı başarısız: ' + (data.message || 'Bilinmeyen hata');
    }
  } catch (error) {
    document.getElementById('connection-status').innerHTML = '<span class="status-dot offline"></span> ❌ Bağlantı hatası: ' + error.message;
  }
  
  btn.textContent = 'Bağlantı Testi';
  btn.disabled = false;
}

// Save WhatsApp settings
async function saveWhatsAppSettings() {
  const form = document.getElementById('whatsapp-settings-form');
  const formData = new FormData(form);
  
  const settings = {
    whatsapp_api_url: formData.get('api_url'),
    whatsapp_api_key: formData.get('api_key'),
    whatsapp_instance: formData.get('instance_name')
  };
  
  try {
    const response = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(settings)
    });
    
    if (response.ok) {
      alert('Ayarlar kaydedildi!');
    } else {
      alert('Kaydetme hatası!');
    }
  } catch (error) {
    alert('Sunucu hatası!');
  }
}

// Save general settings
async function saveGeneralSettings() {
  const form = document.getElementById('general-settings-form');
  const formData = new FormData(form);
  
  const settings = {
    default_speed: formData.get('default_speed'),
    max_file_size: formData.get('max_file_size'),
    auto_opt_out: formData.get('auto_opt_out') === 'on'
  };
  
  try {
    const response = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(settings)
    });
    
    if (response.ok) {
      alert('Ayarlar kaydedildi!');
    }
  } catch (error) {
    alert('Sunucu hatası!');
  }
}

// Show change password modal
function showChangePasswordModal() {
  const modalContainer = document.getElementById('modal-container');
  
  modalContainer.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Şifre Değiştir</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="password-form">
            <div class="form-group">
              <label>Mevcut Şifre</label>
              <input type="password" name="current_password" class="form-control" required>
            </div>
            <div class="form-group">
              <label>Yeni Şifre</label>
              <input type="password" name="new_password" class="form-control" required minlength="6">
            </div>
            <div class="form-group">
              <label>Yeni Şifre (Tekrar)</label>
              <input type="password" name="confirm_password" class="form-control" required>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">İptal</button>
          <button class="btn btn-primary" onclick="changePassword()">Değiştir</button>
        </div>
      </div>
    </div>
  `;
  
  modalContainer.querySelector('.modal-overlay').classList.add('active');
}

// Change password
async function changePassword() {
  const form = document.getElementById('password-form');
  const formData = new FormData(form);
  
  if (formData.get('new_password') !== formData.get('confirm_password')) {
    alert('Şifreler eşleşmiyor!');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        current_password: formData.get('current_password'),
        new_password: formData.get('new_password')
      })
    });
    
    if (response.ok) {
      alert('Şifre başarıyla değiştirildi!');
      closeModal();
    } else {
      const data = await response.json();
      alert('Hata: ' + (data.error || 'Şifre değiştirilemedi'));
    }
  } catch (error) {
    alert('Sunucu hatası!');
  }
}

// Utility Functions
function togglePassword() {
  const input = document.getElementById('login-password');
  const icon = document.querySelector('.toggle-password i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}
