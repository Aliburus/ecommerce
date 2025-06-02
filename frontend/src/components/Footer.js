import React from "react";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">LUXE</h3>
            <p className="text-gray-400">
              Premium moda ve yaşam tarzı markası, çağdaş tasarımda en iyisini
              sunuyor.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Alışveriş</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Yeni Gelenler
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Çok Satanlar
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  İndirim
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Koleksiyonlar
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Yardım</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  İletişim
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Kargo
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  İade
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  SSS
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Bizi Takip Edin</h4>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 cursor-pointer hover:text-gray-300" />
              <Twitter className="h-5 w-5 cursor-pointer hover:text-gray-300" />
              <Instagram className="h-5 w-5 cursor-pointer hover:text-gray-300" />
              <Youtube className="h-5 w-5 cursor-pointer hover:text-gray-300" />
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-400">
            &copy; 2024 LUXE. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
