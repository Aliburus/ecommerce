import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import LoadingSpinner from "../components/LoadingSpinner";
// Placeholder bileşenler
const ProductGallery = ({ images }) => {
  const [mainImage, setMainImage] = useState(images[0]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
      }}
    >
      {/* Thumbnails dikey */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginRight: "16px",
          height: "600px",
          maxHeight: "600px",
          overflowY: "auto",
        }}
      >
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`Ürün ${idx + 1}`}
            style={{
              height: "90px",
              width: "90px",
              objectFit: "cover",
              cursor: "pointer",
              border: mainImage === img ? "2px solid black" : "1px solid #ccc",
              borderRadius: "4px",
              background: "#fff",
            }}
            onClick={() => setMainImage(img)}
            draggable={false}
          />
        ))}
      </div>
      {/* Ana görsel */}
      <div
        className="mb-4"
        style={{
          width: "400px",
          height: "600px",
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <Zoom>
          <img
            src={mainImage}
            alt="Ürün"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              background: "#fff",
            }}
            className="w-full h-full"
          />
        </Zoom>
      </div>
    </div>
  );
};
const SizeSelector = ({ variants, onSelect, selectedSize }) => (
  <div className="my-4">
    <h3 className="text-sm font-medium mb-2">Beden Seçiniz</h3>
    <div className="flex gap-2">
      {variants.map((variant, index) => (
        <button
          key={`${variant.size}-${index}`}
          onClick={() => onSelect(variant.size)}
          className={`border px-3 py-1 rounded ${
            selectedSize === variant.size ? "bg-black text-white" : ""
          } ${variant.stock > 0 ? "" : "opacity-50 cursor-not-allowed"}`}
          disabled={variant.stock <= 0}
        >
          {variant.size?.toUpperCase()}
        </button>
      ))}
    </div>
  </div>
);

const AddToCartButton = ({ product, selectedSize }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      Swal.fire({
        title: "Giriş Gerekli",
        text: "Sepete ürün eklemek için lütfen giriş yapın",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Giriş Yap",
        cancelButtonText: "İptal",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    if (!selectedSize) {
      Swal.fire({
        title: "Beden Seçimi Gerekli",
        text: "Lütfen bir beden seçin",
        icon: "warning",
        confirmButtonText: "Tamam",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await addToCart(product._id, 1);
      if (result.success) {
        Swal.fire({
          title: "Başarılı!",
          text: "Ürün sepete eklendi",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Hata!",
          text: result.error || "Ürün sepete eklenirken bir hata oluştu",
          icon: "error",
          confirmButtonText: "Tamam",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Hata!",
        text: "Ürün sepete eklenirken bir hata oluştu. Lütfen tekrar deneyin.",
        icon: "error",
        confirmButtonText: "Tamam",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className={`w-full bg-black text-white py-3 rounded mt-4 ${
        loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
      }`}
    >
      {loading ? "Ekleniyor..." : "Sepete Ekle"}
    </button>
  );
};
const ProductDetails = ({ product }) => {
  // Detayları ayırmak için : ve , karakterlerine göre bölüyoruz
  let details = [];
  if (product.description) {
    // Noktalı virgül veya yeni satır varsa ona göre böl
    if (product.description.includes(";")) {
      details = product.description
        .split(";")
        .map((d) => d.trim())
        .filter(Boolean);
    } else if (product.description.includes("\n")) {
      details = product.description
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean);
    } else {
      details = product.description
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);
    }
  }
  return (
    <div className="mt-8">
      <h3 className="font-semibold mb-2">Detaylar</h3>
      <ul className="text-gray-700 text-sm list-disc pl-5">
        {details.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

const DeliveryInfo = () => (
  <div className="mt-8 pt-6 border-t border-gray-200">
    <h3 className="text-sm font-medium mb-4">Kargo ve İade Bilgileri</h3>
    <div className="space-y-3">
      <div className="flex items-center text-sm text-gray-600">
        <svg
          className="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <p>
          Bugün sipariş verirseniz <strong>1-3 iş günü</strong> içinde kargoya
          verilir
        </p>
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <svg
          className="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <p>
          500₺ üzeri siparişlerde <strong>ücretsiz kargo</strong>
        </p>
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <svg
          className="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <p>
          14 gün içinde <strong>ücretsiz iade</strong>
        </p>
      </div>
    </div>
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/products/${id}`
        );
        setProduct(res.data);
        setSelectedSize(res.data.variants?.[0]?.size || "");
        setLoading(false);
      } catch (err) {
        setError("Ürün bulunamadı");
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error || !product)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || "Ürün bulunamadı"}
      </div>
    );

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <nav className="py-4 px-4 sm:px-6 lg:px-8 text-sm">
        <ol className="flex space-x-2">
          <li>
            <a href="#" className="text-gray-500 hover:text-black">
              Anasayfa
            </a>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <a href="#" className="text-gray-500 hover:text-black">
              {product.category?.name || product.category}
            </a>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium truncate max-w-xs">
            {product.name}
          </li>
        </ol>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-16">
          {/* Product gallery */}
          <ProductGallery
            images={
              product.images?.map((img) =>
                img.url ? `${process.env.REACT_APP_API_URL}${img.url}` : img
              ) || ["/placeholder.jpg"]
            }
          />
          {/* Product info */}
          <div className="mt-10 md:mt-0">
            <div className="border-b border-gray-200 pb-6">
              <h1 className="text-2xl font-medium text-gray-900">
                {product.name?.toUpperCase()}
              </h1>
              <div className="mt-2 flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating || 0)
                          ? "text-black"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="ml-2 text-sm text-gray-500">
                  ({product.reviewCount || 0} değerlendirme)
                </p>
              </div>
              <div className="mt-4 flex items-center">
                {product.originalPrice && (
                  <span className="text-base text-gray-400 line-through mr-2">
                    ₺{" "}
                    {product.originalPrice?.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                )}
                <span className="text-3xl font-bold text-black tracking-tight">
                  ₺ {product.price}
                </span>
                {product.discount && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-600 text-white rounded">
                    %{product.discount} İndirim
                  </span>
                )}
              </div>
            </div>

            {/* Size selector */}
            {product.variants && product.variants.length > 0 && (
              <SizeSelector
                variants={product.variants}
                onSelect={setSelectedSize}
                selectedSize={selectedSize}
              />
            )}
            {/* Add to cart */}
            <AddToCartButton product={product} selectedSize={selectedSize} />
            {/* Delivery info */}
            <DeliveryInfo />
            {/* Product details */}
            <ProductDetails product={product} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
