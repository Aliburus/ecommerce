import React from "react";

const heroImage =
  "https://burst.shopifycdn.com/photos/clothing-on-retail-rack.jpg?width=1000&format=pjpg&exif=0&iptc=0";

function Hero() {
  return (
    <div
      className="relative top-0 w-full min-h-screen flex items-center bg-cover bg-center"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 w-full h-full flex items-center justify-start">
        <div className="max-w-2xl ml-8 md:ml-24 py-24 px-6 md:px-0">
          <div className="h-1 w-32 bg-white mb-8 hidden md:block"></div>
          <h1 className="text-4xl md:text-6xl font-light text-white mb-6 text-left tracking-wide leading-tight">
            KIŞ İNDİRİMİNDE %50'YE VARAN FIRSATLAR
          </h1>
          <p className="text-base md:text-lg text-white mb-10 text-left max-w-lg">
            Yeni sezon ürünlerinde büyük indirimler! Şimdi alışverişe başla ve
            fırsatları kaçırma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/kadin"
              className="bg-white text-black px-8 py-4 text-base font-normal tracking-widest border-0 hover:bg-gray-100 transition-colors text-center"
            >
              KADIN
            </a>
            <a
              href="/erkek"
              className="bg-transparent text-white border border-white px-8 py-4 text-base font-normal tracking-widest hover:bg-white hover:text-black transition-colors text-center"
            >
              ERKEK
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
