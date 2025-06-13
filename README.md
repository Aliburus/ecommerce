# 🛍️ E-Ticaret Yönetim Sistemi

Modern, güvenli ve kullanıcı dostu bir e-ticaret çözümü. Müşteriler ve yöneticiler için kapsamlı alışveriş ve yönetim deneyimi.

## ✨ Temel Özellikler

### 🔒 Güvenlik & Kimlik Doğrulama

- JWT tabanlı güvenli kimlik doğrulama
- HTTP-only cookie ile güvenli oturum yönetimi
- Rol tabanlı yetkilendirme sistemi

### 📦 Ürün Yönetimi

- Çoklu varyant ve beden desteği
- Stok takibi ve otomatik güncelleme
- Kategorize edilmiş ürün listeleme
- Gelişmiş ürün arama ve filtreleme

### 🛒 Sepet & Sipariş Sistemi

- Gerçek zamanlı stok kontrolü
- Varyant/beden bazlı sepet yönetimi
- Dinamik kargo ücreti hesaplama
- Sipariş durumu takibi ve bildirimler

### 📊 Yönetim Paneli

- Gerçek zamanlı satış istatistikleri
- Sipariş ve fatura yönetimi
- Müşteri veritabanı yönetimi
- Stok ve envanter kontrolü

### 📧 İletişim & Bildirimler

- SMTP entegrasyonu ile e-posta bildirimleri
- Sipariş durumu güncellemeleri
- Otomatik fatura gönderimi
- Toast bildirimleri ile kullanıcı geri bildirimi

## 🛠️ Teknoloji Yığını

### Frontend

- React.js 18+
- TailwindCSS
- Axios
- Zustand (State Management)
- React Query

### Backend

- Node.js
- Express.js
- MongoDB & Mongoose
- JWT & Bcrypt
- Nodemailer

## 🚀 Kurulum

### Gereksinimler

- Node.js 16+
- MongoDB 4.4+
- npm veya yarn

### Backend Kurulumu

```bash
cd backend
npm install
cp .env.example .env  # .env dosyasını düzenle
npm run dev
```

### Frontend Kurulumu

```bash
cd frontend
npm install
npm start
```

## 🔧 Ortam Değişkenleri

```env
# Backend
MONGODB_URI=
JWT_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Frontend
REACT_APP_API_URL=
```

## 📚 API Dokümantasyonu

API endpointleri ve kullanım örnekleri için `backend/routes/` klasörüne bakabilirsiniz.

## 🔐 Güvenlik Önlemleri

- HTTP-only cookie kullanımı
- CORS politikaları
- Rate limiting
- Input validasyonu
- XSS koruması

## 📱 Responsive Tasarım

- Mobil öncelikli yaklaşım
- TailwindCSS ile responsive grid sistemi
- Touch-friendly arayüz
- Cross-browser uyumluluk

## 📸 Ekran Görüntüleri

> Tüm ekran görüntüleri `screenshots` klasöründe bulunmaktadır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Tüm Hakları Saklıdır

## 📞 İletişim

Proje Sahibi - [@Aliburus](https://github.com/Aliburus)

Proje Linki: [https://github.com/Aliburus/ecommerce](https://github.com/Aliburus/ecommerce)
