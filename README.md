# WPanel Desktop - WhatsApp Müşteri İletişim Paneli

WPanel Desktop, işletmelerin WhatsApp üzerinden müşterileriyle kolayca iletişim kurmasını sağlayan kapsamlı bir masaüstü uygulamasıdır.

## 🚀 Özellikler

### 1. Müşteri Yönetimi
- ✅ Müşteri ekleme, düzenleme ve silme
- ✅ CSV/Excel dosyasından toplu müşteri içe aktarma
- ✅ Müşteri segmentasyonu ve etiketleme
- ✅ İzin durumu takibi (Aktif/Beklemede/Opt-out)

### 2. WhatsApp Entegrasyonu
- ✅ WhatsApp Web.js ile güvenli bağlantı
- ✅ QR kod ile kolay bağlantı kurma
- ✅ Tekli ve toplu mesaj gönderimi
- ✅ Medya dosyası gönderimi (yakında)

### 3. Kampanya Yönetimi
- ✅ Kampanya oluşturma ve planlama
- ✅ Hedef kitle seçimi
- ✅ Zamanlanmış gönderim
- ✅ Gönderim raporları

### 4. Şablonlar
- ✅ Hazır mesaj şablonları
- ✅ Değişken desteği ({ad}, {soyad}, {telefon})
- ✅ Özel şablon oluşturma

### 5. Raporlama
- ✅ Gönderim istatistikleri
- ✅ Başarı/başarısız oranları
- ✅ Kampanya bazlı raporlar

## 📥 Kurulum

### Gereksinimler
- macOS 10.14+ / Windows 10+ / Linux
- 4GB RAM (önerilen: 8GB)
- 500MB boş disk alanı
- WhatsApp Business hesabı

### Kurulum Adımları

1. **İndirme**
   - WPanel-Setup.dmg (macOS) veya WPanel-Setup.exe (Windows) dosyasını indirin
   - İndirme bağlantısı: [GitHub Releases](https://github.com/ideyazilim07/wpanel/releases)

2. **macOS Kurulumu**
   ```bash
   # DMG dosyasını açın
   # WPanel uygulamasını Applications klasörüne sürükleyin
   # İlk çalıştırmada: Sistem Tercihleri > Güvenlik ve Gizlilik > Yine de Aç
   ```

3. **Windows Kurulumu**
   ```bash
   # Setup.exe'yi çalıştırın
   # Kurulum sihirbazını takip edin
   # Masaüstü kısayolu otomatik oluşturulacak
   ```

4. **İlk Başlatma**
   - Uygulamayı açın
   - Varsayılan giriş bilgileri:
     - E-posta: `admin@wpanel.com`
     - Şifre: `admin123`
   - Giriş yaptıktan sonra şifrenizi değiştirin

## 📖 Kullanım Kılavuzu

### Giriş ve Ana Ekran

1. **Giriş Yapma**
   - E-posta ve şifrenizi girin
   - "Giriş Yap" butonuna tıklayın
   - İlk girişte varsayılan şifreyi değiştirmeniz önerilir

2. **Dashboard**
   - Toplam müşteri sayısı
   - Aktif izinli müşteriler
   - Bugün gönderilen mesajlar
   - Kampanya istatistikleri

### Müşteri Yönetimi

#### Yeni Müşteri Ekleme
1. Sol menüden **"Müşteriler"** seçeneğine tıklayın
2. Sağ üstteki **"+ Yeni Müşteri"** butonuna tıklayın
3. Formu doldurun:
   - Ad ve Soyad (Zorunlu)
   - Telefon numarası (Zorunlu - 905XXXXXXXXX formatında)
   - E-posta (İsteğe bağlı)
   - Şehir (İsteğe bağlı)
   - Etiket (İsteğe bağlı)
   - İzin durumu (Aktif/Beklemede/Opt-out)
4. **"Kaydet"** butonuna tıklayın

#### Toplu Müşteri İçe Aktarma
1. **"İçe Aktar"** butonuna tıklayın
2. CSV veya Excel dosyanızı seçin
3. Gerekli sütunlar:
   - `first_name` - Ad
   - `last_name` - Soyad
   - `phone` - Telefon (905XXXXXXXXX formatında)
   - `email` - E-posta (isteğe bağlı)
   - `city` - Şehir (isteğe bağlı)
   - `tags` - Etiket (isteğe bağlı)
4. **"İçe Aktar"** butonuna tıklayın

#### Şablon İndirme
- **"Örnek Şablon İndir"** linkine tıklayarak boş şablon alabilirsiniz

### WhatsApp Bağlantısı

#### İlk Bağlantı Kurma
1. Sol menüden **"Ayarlar"** seçeneğine tıklayın
2. **"📱 WhatsApp Bağlan"** butonuna tıklayın
3. Ekranda beliren QR kodu telefonunuzdan okutun:
   - WhatsApp uygulamasını açın
   - Ayarlar > Bağlı Cihazlar > Cihaz Bağla
   - QR kodu tarayın
4. Bağlantı başarılı olduğunda **"WhatsApp Bağlı"** mesajı görünecek

#### Bağlantıyı Kesme
1. WhatsApp Bağlantısı modalını açın
2. **"🚪 Çıkış Yap"** butonuna tıklayın
3. Onaylayın

### Mesaj Gönderimi

#### Tekli Mesaj Gönderme
1. **"Müşteriler"** sayfasına gidin
2. Mesaj göndermek istediğiniz müşterinin yanındaki **"📱 Mesaj"** butonuna tıklayın
3. Mesaj içeriğini yazın veya hazır şablon seçin:
   - **Merhaba**: Genel selamlama mesajı
   - **Kampanya**: Kampanya duyurusu
   - **Hatırlatma**: Randevu/ödeme hatırlatması
4. Değişkenler otomatik doldurulacaktır:
   - `{ad}` → Müşterinin adı
   - `{soyad}` → Müşterinin soyadı
   - `{telefon}` → Müşterinin telefon numarası
5. **"📤 Gönder"** butonuna tıklayın

#### Toplu Mesaj Gönderme (Kampanya)
1. **"Kampanyalar"** sayfasına gidin
2. **"+ Yeni Kampanya"** butonuna tıklayın
3. Kampanya bilgilerini doldurun:
   - Kampanya adı
   - Tür (Bilgilendirme/Kampanya/Duyuru/Hatırlatma)
   - Hedef kitle seçimi
   - Mesaj içeriği
   - Gönderim hızı (Yavaş/Normal/Hızlı)
4. **"Kampanya Oluştur"** butonuna tıklayın
5. Kampanya listesinden oluşturduğunuz kampanyaya tıklayın
6. **"Gönderimi Başlat"** butonuna tıklayın

### Şablon Yönetimi

#### Yeni Şablon Oluşturma
1. **"Şablonlar"** sayfasına gidin
2. **"+ Yeni Şablon"** butonuna tıklayın
3. Şablon bilgilerini girin:
   - Şablon adı
   - Tür (Bilgilendirme/Kampanya/Duyuru/Hatırlatma)
   - İçerik (değişkenler kullanabilirsiniz)
4. **"Kaydet"** butonuna tıklayın

#### Şablon Kullanma
- Mesaj gönderirken **"Hazır Şablon"** dropdown'undan seçim yapın
- Şablon otomatik olarak mesaj alanına yüklenecektir

## ⚙️ Ayarlar

### WhatsApp API Ayarları
- **API URL**: WhatsApp servisi adresi (varsayılan: localhost)
- **API Key**: Güvenlik anahtarı
- **Instance Adı**: WhatsApp bağlantı adı

### Genel Ayarlar
- **Varsayılan Gönderim Hızı**: Mesajlar arası bekleme süresi
  - Yavaş: 5 saniye (güvenli)
  - Normal: 3 saniye (önerilen)
  - Hızlı: 1 saniye (riskli)
- **Maksimum Dosya Boyutu**: Medya gönderim limiti
- **Otomatik Opt-out**: "Çıkış" yazanları otomatik engelle

### Hesap Bilgileri
- Kullanıcı adı ve e-posta görüntüleme
- Şifre değiştirme

## 🔒 Güvenlik ve Uyumluluk

### İzinli İletişim (Opt-in)
- Sadece izin veren müşterilere mesaj gönderin
- Müşterilerin izin durumunu düzenli kontrol edin
- Opt-out olan müşterilere asla mesaj göndermeyin

### WhatsApp Kuralları
- Spam gönderimden kaçının
- Çok hızlı gönderim yapmayın (hesap banlanabilir)
- Kişisel ve işletme hesaplarını ayırın
- WhatsApp Business hesabı kullanın

### Veri Güvenliği
- Tüm veriler yerel SQLite veritabanında saklanır
- İnternet bağlantısı sadece WhatsApp mesajları için kullanılır
- Müşteri verileri şifrelenmez ( yerel güvenlik önlemleri alın)

## 🐛 Sorun Giderme

### WhatsApp Bağlantı Sorunları

**QR kod görünmüyor:**
1. Uygulamayı kapatıp yeniden açın
2. "Yenile" butonuna tıklayın
3. Hâlâ olmuyorsa Ayarlar > Çıkış Yap > Tekrar bağlan

**"WhatsApp servisi çalışmıyor" hatası:**
1. Uygulamayı tamamen kapatın
2. Activity Monitor/Task Manager'dan tüm Chrome ve Node işlemlerini sonlandırın
3. Uygulamayı yeniden başlatın

**Mesaj gönderilmiyor:**
1. WhatsApp bağlantısını kontrol edin
2. Telefon numarasının doğru formatta olduğundan emin olun (905XXXXXXXXX)
3. WhatsApp Business hesabınızın aktif olduğunu kontrol edin

### Giriş Sorunları

**"Giriş başarısız" hatası:**
- Varsayılan giriş bilgilerini kullanın:
  - E-posta: `admin@wpanel.com`
  - Şifre: `admin123`
- Caps Lock kapalı olduğundan emin olun

## 📞 Destek

Sorularınız veya önerileriniz için:
- E-posta: destek@wpanel.com.tr
- GitHub: https://github.com/ideyazilim07/wpanel/issues

## 📝 Sürüm Geçmişi

### v1.0.0 (13 Nisan 2026)
- İlk sürüm
- WhatsApp Web.js entegrasyonu
- Müşteri yönetimi
- Kampanya yönetimi
- Şablon sistemi
- Raporlama

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için LICENSE dosyasına bakın.

---

**Made with ❤️ in Turkey**

**İde Yazılım** © 2026
