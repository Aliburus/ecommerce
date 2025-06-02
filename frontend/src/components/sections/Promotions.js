import React from "react";
import { ShoppingBag } from "lucide-react";

function Promotions() {
  return (
    <div className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center space-x-4 p-6 bg-white rounded-lg shadow-sm">
            <div className="p-3 bg-black rounded-full">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Ücretsiz Kargo</h3>
              <p className="text-sm text-gray-600">
                500 TL üzeri alışverişlerde
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-6 bg-white rounded-lg shadow-sm">
            <div className="p-3 bg-black rounded-full">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Güvenli Ödeme</h3>
              <p className="text-sm text-gray-600">256-bit SSL güvenlik</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-6 bg-white rounded-lg shadow-sm">
            <div className="p-3 bg-black rounded-full">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Kolay İade</h3>
              <p className="text-sm text-gray-600">
                30 gün içinde ücretsiz iade
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Promotions;
