import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getHero, updateHero } from "../../services/heroService";

const heroImageDefault =
  "https://burst.shopifycdn.com/photos/clothing-on-retail-rack.jpg?width=1000&format=pjpg&exif=0&iptc=0";

function Hero() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [hero, setHero] = useState({
    title: "KIŞ İNDİRİMİNDE %50'YE VARAN FIRSATLAR",
    desc: "Yeni sezon ürünlerinde büyük indirimler! Şimdi alışverişe başla ve fırsatları kaçırma.",
    image: heroImageDefault,
    buttonText: "ALIŞVERİŞE BAŞLA",
    buttonLink: "/kadin",
  });
  const [editHero, setEditHero] = useState(hero);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const data = await getHero();
        if (data) {
          setHero({
            title: data.title,
            desc: data.subtitle,
            image: data.image,
            buttonText: data.buttonText,
            buttonLink: data.buttonLink,
          });
        }
      } catch (error) {
        // Backend'den veri gelmezse default değerler kalır
      }
    };
    fetchHeroData();
  }, []);

  const handleEdit = () => {
    setEditHero(hero);
    setIsEditing(true);
  };
  const handleCancel = () => {
    setIsEditing(false);
  };
  const handleSave = async () => {
    setLoading(true);
    try {
      await updateHero({
        title: editHero.title,
        subtitle: editHero.desc,
        image: editHero.image,
        buttonText: editHero.buttonText,
        buttonLink: editHero.buttonLink,
      });
      setHero(editHero);
      setIsEditing(false);
    } catch (error) {
      alert("Güncelleme başarısız");
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    setEditHero({ ...editHero, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="relative top-0 w-full min-h-screen flex items-center bg-cover bg-center"
      style={{
        backgroundImage: `url(${isEditing ? editHero.image : hero.image})`,
      }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 w-full h-full flex items-center justify-start">
        <div className="max-w-2xl ml-8 md:ml-24 py-24 px-6 md:px-0">
          <div className="h-1 w-32 bg-white mb-8 hidden md:block"></div>
          {user && user.isAdmin && (
            <div className="mb-4 flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-1 rounded"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-red-600 text-white px-4 py-1 rounded"
                  >
                    İptal
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="bg-black text-white px-4 py-1 rounded"
                >
                  Düzenle
                </button>
              )}
            </div>
          )}
          {isEditing ? (
            <>
              <input
                name="title"
                value={editHero.title}
                onChange={handleChange}
                className="text-4xl md:text-6xl font-light text-white mb-6 text-left tracking-wide leading-tight bg-transparent border-b border-white w-full mb-2"
              />
              <textarea
                name="desc"
                value={editHero.desc}
                onChange={handleChange}
                className="text-base md:text-lg text-white mb-10 text-left max-w-lg bg-transparent border-b border-white w-full mb-2"
              />
              <input
                name="image"
                value={editHero.image}
                onChange={handleChange}
                className="text-xs text-white bg-transparent border-b border-white w-full mb-2"
                placeholder="Görsel URL"
              />
              <input
                name="buttonText"
                value={editHero.buttonText}
                onChange={handleChange}
                className="bg-white text-black px-4 py-2 text-base font-normal tracking-widest border-0 w-full mb-2"
                placeholder="Buton Metni"
              />
              <input
                name="buttonLink"
                value={editHero.buttonLink}
                onChange={handleChange}
                className="bg-white text-black px-4 py-2 text-base font-normal tracking-widest border-0 w-full mb-2"
                placeholder="Buton Link"
              />
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-light text-white mb-6 text-left tracking-wide leading-tight">
                {hero.title}
              </h1>
              <p className="text-base md:text-lg text-white mb-10 text-left max-w-lg">
                {hero.desc}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={hero.buttonLink}
                  className="bg-white text-black px-8 py-4 text-base font-normal tracking-widest border-0 hover:bg-gray-100 transition-colors text-center"
                >
                  {hero.buttonText}
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Hero;
