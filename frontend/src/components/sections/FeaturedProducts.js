import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useWishlist } from "../../context/WishlistContext";

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/products/all`
        );
        const randomProducts = response.data
          .sort(() => 0.5 - Math.random())
          .slice(0, 8);
        setProducts(randomProducts);
      } catch (error) {
        console.error("Ürünler yüklenirken hata:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleWishlist = async (id) => {
    if (wishlist.includes(id)) {
      await removeFromWishlist(id);
    } else {
      await addToWishlist(id);
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Öne Çıkan Ürünler</h2>
          <a href="/men" className="text-gray-600 hover:text-black">
            Tümünü Gör →
          </a>
        </div>
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={30}
          slidesPerView={4}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="featured-products-slider"
        >
          {products.map((product) => (
            <SwiperSlide key={product._id}>
              <div
                className="group cursor-pointer  p-4 "
                onClick={() => navigate(`/urun/${product._id}`)}
              >
                <div className="relative aspect-[3/4] overflow-hidden mb-4">
                  <img
                    src={
                      product.images[0]?.url
                        ? `${process.env.REACT_APP_API_URL}${product.images[0].url}`
                        : "/placeholder.jpg"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    className="absolute top-4 right-4 z-20 bg-white p-2 shadow-md hover:scale-110 transition-all duration-200 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlist(product._id);
                    }}
                  >
                    {wishlist.includes(product._id) ? (
                      <AiFillHeart className="h-6 w-6 text-red-600" />
                    ) : (
                      <AiOutlineHeart className="h-6 w-6 text-red-600" />
                    )}
                  </button>
                </div>
                <h3 className="text-m font-thin mb-1 text-center text-black line-clamp-2 min-h-[48px]">
                  {product.name}
                </h3>
                <p className="text-black text-center text-lg font-serif mb-2">
                  {product.price} TL
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default FeaturedProducts;
