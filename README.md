# 🛒 E-Ticaret Yönetim Paneli

Modern, güvenli ve kullanıcı dostu bir e-ticaret platformu. Hem müşteriler hem de yöneticiler için eksiksiz alışveriş ve yönetim deneyimi sunar.

## 🚀 Özellikler

- **Sipariş & Fatura Yönetimi:**

  - Sipariş ve fatura işlemleri, e-posta bildirimleri
  - HTTP-only cookie ile güvenli fatura
  - Türkçe sipariş durumları, badge ve renkli etiketler
  - Anlık güncellenen dashboard ve sipariş listeleri

- **Ürün Yönetimi:**

  - Modern, kompakt, iki sütunlu ürün kartları
  - Sayfalama (pagination) ile hızlı gezinme
  - Dashboard'da slider ile en çok satanlar

- **Dashboard & Görsel İyileştirmeler:**

  - Modern kutu ve kaydırma tasarımları
  - İçerik yoksa bilgilendirici mesajlar
  - Son siparişlerde limit ve yatay kaydırma

- **Müşteri Yönetimi:**

  - Pagination ile müşteri listesi

- **Sepet & Varyant/Beden:**

  - Sepete beden zorunlu, varyant stok güncelleme
  - Sepet item'ı `{ product, quantity, price, size }`
  - Spinnerlı sayaç, beden bazlı silme

- **Kargo Limiti & Ücreti:**

  - Kargo limiti ve ücreti admin panelinden anlık ayarlanabilir
  - Sepet limiti ve kargo ücreti dinamik, özet kutusunda gösterim

- **Mail & Bildirim:**

  - Tek sendEmail fonksiyonu, SMTP ayarları koddan veya isteğe göre
  - Tüm mail gönderimleri güncel
  - Başarılı işlem ve hata bildirimleri (toast)

- **Genel UX & Performans:**
  - Ortak util fonksiyonları, gereksiz render azaltma
  - Hızlı ve anlık güncellemeler
  - Mobil uyumlu, modern arayüz

## 🛠️ Kullanılan Teknolojiler

- **Frontend:** React.js, TailwindCSS, Axios, Context API/Zustand
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Bcrypt
- **Mail:** Nodemailer

## ⚡ Kurulum

### 1. Projeyi Klonla

```bash
git clone https://github.com/Aliburus/ecommerce.git
cd ecommerce
```

### 2. Backend Kurulumu

```bash
cd backend
npm install
# .env dosyasını oluştur ve gerekli ortam değişkenlerini gir
npm run dev
```

### 3. Frontend Kurulumu

```bash
cd ../frontend
npm install
npm start
```

## 📸 Ekran Görüntüleri

> Tüm ekran görüntüleri `Screenshots` klasöründe yer almaktadır.

## 📚 API & Veritabanı

- Tüm endpointler için: `backend/routes/` klasörüne bakabilirsin.
- JWT ile korunan endpointler ve örnek istekler için Postman koleksiyonu eklenebilir.
- Veritabanı şemaları: `backend/models/` klasöründe.

## 🤝 Katkı Sağlama

1. Fork'la ve yeni bir branch oluştur.
2. Değişikliklerini yap ve commit et.
3. Pull request gönder.

## 📄 Lisans

MIT
