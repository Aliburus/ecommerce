import React from "react";

function About() {
  return (
    <div className="bg-white">
      <div className="relative h-[60vh] bg-black">
        <img
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04"
          alt="LUXE Hakkında"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white">
            Hikayemiz
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-6">Vizyonumuz</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              LUXE olarak, olağanüstü tasarımın sadece görünüşünüzü değil, aynı
              zamanda kendinizi nasıl hissettiğinizi de değiştirme gücüne
              inanıyoruz. Vizyonumuz, çağdaş estetiği ödünsüz kaliteyle
              birleştiren zamansız parçalar yaratmaktır.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Her koleksiyon, sürdürülebilir lüks ve yenilikçi tasarıma olan
              bağlılığımızı yansıtacak şekilde özenle seçilmiştir ve her
              parçanın kendi benzersiz hikayesini anlatmasını sağlar.
            </p>
          </div>
          <div className="aspect-square">
            <img
              src="https://images.unsplash.com/photo-1459156212016-c812468e2115"
              alt="LUXE Tasarım Stüdyosu"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold mb-6">Değerlerimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Kalite</h3>
              <p className="text-gray-600">
                Her parçada ödünsüz detay ve premium malzeme kullanımı.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Sürdürülebilirlik</h3>
              <p className="text-gray-600">
                Etik üretim ve çevresel sorumluluğa olan bağlılık.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Yenilik</h3>
              <p className="text-gray-600">
                Zamansız zarafeti korurken tasarımda sınırları zorlamak.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
