import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black"></div>
        <p className="mt-4 text-lg font-medium text-black">Yükleniyor...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
