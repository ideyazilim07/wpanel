# WPanel Desktop - Docker Kurulum Kılavuzu

WPanel Desktop'u Docker ile kolayca çalıştırabilirsiniz.

## 📋 Gereksinimler

- Docker Desktop (macOS/Windows/Linux)
- Docker Compose (v2+)

## 🚀 Hızlı Başlangıç

### 1. Docker'ı İndirin

**macOS:**
```bash
# Homebrew ile kurulum
brew install --cask docker

# Veya resmi sitesinden indirin:
# https://www.docker.com/products/docker-desktop
```

**Windows:**
```bash
# Resmi sitesinden indirin:
# https://www.docker.com/products/docker-desktop
```

**Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 2. WPanel'i İndirin

```bash
# Git ile klonlayın
git clone https://github.com/ideyazilim07/wpanel.git
cd wpanel/whatsapp-panel-desktop

# Veya ZIP olarak indirin ve çıkarın
wget https://github.com/ideyazilim07/wpanel/archive/refs/heads/main.zip
unzip main.zip
cd wpanel-main/whatsapp-panel-desktop
```

### 3. Docker ile Çalıştırın

```bash
# Container'ı başlat
docker-compose up -d

# Logları görüntüleyin
docker-compose logs -f
```

### 4. Uygulamaya Erişin

Tarayıcınızda şu adresi açın:
```
http://localhost:3000
```

Varsayılan giriş bilgileri:
- **E-posta:** `admin@wpanel.com`
- **Şifre:** `admin123`

## 🛠️ Yönetim Komutları

### Container'ı Durdurma
```bash
docker-compose stop
```

### Container'ı Başlatma
```bash
docker-compose start
```

### Container'ı Yeniden Başlatma
```bash
docker-compose restart
```

### Container'ı Kaldırma
```bash
docker-compose down
```

### Verileri Temizleme (DİKKAT!)
```bash
docker-compose down -v
```

## 📁 Veri Yedekleme

WPanel verileri `data` klasöründe saklanır:
- SQLite veritabanı: `data/wpanel.db`
- WhatsApp oturumu: `.wwebjs_auth/`

### Yedek Alma
```bash
# Veritabanını yedekleyin
cp data/wpanel.db data/wpanel.db.backup.$(date +%Y%m%d)
```

### Yedekten Geri Yükleme
```bash
# Uygulamayı durdurun
docker-compose stop

# Yedeği geri yükleyin
cp data/wpanel.db.backup.20240413 data/wpanel.db

# Uygulamayı başlatın
docker-compose start
```

## 🔄 Güncelleme

```bash
# Son kodları çekin
git pull

# Container'ı yeniden oluşturun
docker-compose down
docker-compose up -d --build
```

## 🐛 Sorun Giderme

### "Port already in use" Hatası

Port 3000 veya 3002 başka bir uygulama tarafından kullanılıyor:

```bash
# Kullanılan portları kontrol edin
lsof -i :3000
lsof -i :3002

# Portları değiştirin (docker-compose.yml'de)
ports:
  - "3001:3000"  # Yerel 3001, Container 3000
  - "3003:3002"  # Yerel 3003, Container 3002
```

### WhatsApp QR Kod Gelmiyor

```bash
# Logları kontrol edin
docker-compose logs -f wpanel

# WhatsApp servisini yeniden başlatın
docker-compose restart wpanel
```

### Veritabanı Hatası

```bash
# Veri klasörünün izinlerini kontrol edin
ls -la data/

# İzinleri düzeltin
chmod 755 data/
```

## 📊 Sistem Gereksinimleri

### Minimum
- 2 CPU çekirdeği
- 4GB RAM
- 1GB disk alanı

### Önerilen
- 4 CPU çekirdeği
- 8GB RAM
- 5GB disk alanı

## 🔒 Güvenlik

- Veritabanı şifresiz saklanır (yerel kullanım için)
- WhatsApp oturumu container içinde güvenli tutulur
- Üretim ortamında güvenlik duvarı kuralları uygulayın

## 📞 Destek

Sorularınız için:
- E-posta: destek@wpanel.com.tr
- GitHub: https://github.com/ideyazilim07/wpanel/issues

---

**Made with ❤️ in Turkey**

**İde Yazılım** © 2026
