import React from "react";

function FeaturedCategories() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold">Öne Çıkan Kategoriler</h2>
          <a href="/categories" className="text-gray-600 hover:text-black">
            Tümünü Gör →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Kadın Koleksiyonu",
              subtitle: "Yeni Sezon",
              image:
                "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
              link: "/kadin",
            },
            {
              title: "Erkek Koleksiyonu",
              subtitle: "Trend Parçalar",
              image:
                "https://images.unsplash.com/photo-1488161628813-04466f872be2",
              link: "/erkek",
            },
            {
              title: "Aksesuarlar",
              subtitle: "Tamamlayıcı Parçalar",
              image:
                "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93",
              link: "/aksesuarlar",
            },
          ].map((category, index) => (
            <a
              href={category.link}
              key={index}
              className="relative group cursor-pointer overflow-hidden"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col items-center justify-end pb-8">
                <h3 className="text-white text-2xl font-semibold mb-2">
                  {category.title}
                </h3>
                <p className="text-white/80 text-sm">{category.subtitle}</p>
                <span className="mt-4 inline-block bg-white text-black px-6 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  Keşfet
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeaturedCategories;
