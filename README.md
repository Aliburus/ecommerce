# E-Ticaret Uygulaması

## Genel Bakış

Bu proje, modern ve sade bir tasarıma sahip, React (web), Node.js/Express (backend) ve MongoDB ile geliştirilmiş tam kapsamlı bir e-ticaret platformudur. Tüm arayüzler siyah-beyaz ve minimalist bir yaklaşımla hazırlanmıştır. Güvenlik, kullanıcı deneyimi ve mobil uyumluluk ön plandadır.

## Ekran Görüntüleri

### Anasayfa

![Anasayfa](/screenshots/Homepage.jpeg)

### Ürünler (Kullanıcı)

![Ürünler](/screenshots/Products.jpeg)

### Ürünler (Admin)

![Ürünler Admin](/screenshots/Proudcts-Admin.jpeg)

### Dashboard (Admin)

![Dashboard](/screenshots/Dashboard.jpeg)

### Siparişler (Admin)

![Siparişler](/screenshots/Orders.jpeg)

### İndirimler (Admin)

![İndirimler](/screenshots/Discounts.jpeg)

### Koleksiyonlar (Admin)

![Koleksiyonlar](/screenshots/Collections.jpeg)

### Profil (Kullanıcı)

![Profil](/screenshots/Profile.jpeg)

## Sitenin Genel Yapısı

- **Kullanıcı Paneli:**

  - Kayıt, giriş, şifre sıfırlama
  - Ürünleri listeleme, filtreleme, detay görüntüleme
  - Sepet yönetimi, adres seçimi/ekleme, ödeme (İyzico entegrasyonu)
  - Sipariş geçmişi, profil ve adres yönetimi
  - Favoriler (wishlist)

- **Admin Paneli:**

  - Dashboard: Satış istatistikleri, en çok satılan ürünler
  - Ürün yönetimi: Ürün ekleme, düzenleme, silme, grid/kart ve klasik görünüm
  - Sipariş yönetimi: Siparişleri sıralama (teslim edilenler en sonda, diğerleri en yeni en üstte)
  - Koleksiyon ve kategori yönetimi
  - Toplu e-posta gönderimi (kampanya/indirim duyuruları)
  - İndirim yönetimi: Yeni indirim oluşturma, mevcut indirimleri düzenleme/silme, indirimlerin otomatik olarak kullanıcılara e-posta ile duyurulması
  - Ayarlar: Temel site ayarları

- **Tema ve Tasarım:**

  - Siyah-beyaz, sade ve modern arayüz
  - Tüm sayfalarda responsive ve mobil uyumlu yapı

- **Güvenlik:**
  - JWT tabanlı kimlik doğrulama
  - Şifre sıfırlama akışı (mail ile token gönderimi ve yeni şifre belirleme)
  - Admin ve kullanıcı rolleri
  - HTTP cookie ve oturum güvenliği

## İndirimler (Discounts) Özelliği

- **Admin için:**
  - Admin panelinde özel bir "İndirimler" bölümü bulunur.
  - Buradan yeni indirim oluşturulabilir, mevcut indirimler düzenlenebilir veya silinebilir.
  - İndirimler belirli ürünlere, kategorilere veya tüm siteye uygulanabilir.
  - İndirim oluşturulduğunda, sistem otomatik olarak toplu e-posta gönderimi yapar.

## Admin Paneli Detayları

- **Dashboard:**
  - Satış grafikleri ve özetler
  - En çok satılan ürünler görsel ve modern kartlarla listelenir
- **Ürünler:**
  - Grid/kart ve klasik liste görünümü arasında geçiş
  - Ürün ekleme, düzenleme, silme işlemleri
  - Sayfa başı 10/20/50 ürün gösterme seçeneği
- **Siparişler:**
  - Teslim edilenler en sonda, diğerleri en yeni en üstte
  - Sipariş detayları ve müşteri bilgileri
- **Koleksiyonlar/Kategoriler:**
  - Koleksiyon ve kategori ekleme, düzenleme, silme
- **İndirimler:**
  - İndirim oluşturma, düzenleme, silme ve toplu e-posta ile duyurma
- **Toplu E-Posta Gönderimi:**
  - Kampanya ve indirimlerde tüm kullanıcılara otomatik mail gönderimi
- **Ayarlar:**
  - Bildirim ve veri aktarımı bölümleri kaldırıldı, sadeleştirildi

## Kurulum

1. `npm install` ile bağımlılıkları yükleyin.
2. `npm start` ile projeyi başlatın.
3. Backend için ayrı olarak backend klasöründe de aynı işlemleri uygulayın.

## Katkı ve Lisans

Açık kaynaklıdır. Katkıda bulunmak için PR gönderebilirsiniz.
