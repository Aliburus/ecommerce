import React from "react";
import Hero from "../components/sections/Hero";
import Promotions from "../components/sections/Promotions";
import FeaturedProducts from "../components/sections/FeaturedProducts";
import FeaturedCollections from "../components/sections/FeaturedCollections";
import FeaturedCategories from "../components/sections/FeaturedCategories";
import Navbar from "../components/Navbar";

function Home() {
  return (
    <div className="min-h-screen ">
      <Hero />
      <Promotions />
      <FeaturedProducts />
      <FeaturedCategories />

      <FeaturedCollections />
    </div>
  );
}

export default Home;
