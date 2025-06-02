# 🛒 Ecommerce Projesi

Modern ve mobil uyumlu bir e-ticaret platformu. Kullanıcılar ürünleri inceleyebilir, filtreleyebilir, sepete ekleyebilir, favorilere alabilir ve güvenli şekilde alışveriş yapabilir. Admin paneli ile ürün, kategori ve sipariş yönetimi kolayca yapılır.

## 📑 İçindekiler

- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [API Dökümantasyonu](#api-dökümantasyonu)
- [Veritabanı Şeması](#veritabanı-şeması)
- [Ekran Görüntüleri](#ekran-görüntüleri)
- [Katkı Sağlama](#katkı-sağlama)
- [Lisans](#lisans)

## 🚀 Özellikler

- Kullanıcı kayıt ve giriş (JWT ile)
- Admin paneli
- Ürün, kategori, koleksiyon CRUD işlemleri
- Sepet ve favori yönetimi
- Yorum ve beğeni sistemi
- Filtreleme ve arama
- Mobil uyumlu ve modern tasarım

## 🛠 Teknolojiler

**Frontend:**

- React.js
- Tailwind CSS
- Axios
- Context API / Zustand

**Backend:**

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT & Bcrypt

## ⚙️ Kurulum

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

## ▶️ Kullanım

- `localhost:3000` üzerinden frontend arayüzüne erişebilirsin.
- `localhost:5000` üzerinden backend API çalışır.

## 📚 API Dökümantasyonu

- Tüm endpointler için: `backend/routes/` klasörüne bakabilirsin.
- JWT ile korunan endpointler ve örnek istekler için Postman koleksiyonu eklenebilir.

## 🗄️ Veritabanı Şeması

- Kullanıcılar, Ürünler, Kategoriler, Siparişler, Yorumlar, Favoriler koleksiyonları.
- Detaylı şema için: `backend/models/` klasörüne bakabilirsin.

## 🖼️ Ekran Görüntüleri

> Buraya arayüzden ve admin panelinden örnek görseller ekleyebilirsin.

## 🤝 Katkı Sağlama

1. Fork'la ve yeni bir branch oluştur.
2. Değişikliklerini yap ve commit et.
3. Pull request gönder.

## 📄 Lisans

MIT
