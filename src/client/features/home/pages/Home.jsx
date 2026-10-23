import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import Container from "../../../components/layout/Container";
import PromoBanner from "../components/PromoBanner";
import ProductSection from "../components/ProductSection";
import CartDrawer from "../../../features/cart/components/CartDrawer";
import FloatingCartBanner from "../../../features/cart/components/FloatingCartBanner";
import { useSearch } from "../../../../context/SearchContext";
import ScrollToTopButton from "../../../components/common/ScrollToTopButton";
import { useRef, useCallback } from "react";

export default function Home() {
  const { searchItem, priceRange } = useSearch();
  const isFiltering = searchItem.trim() !== "" || priceRange !== "all";

  const allProductsRef = useRef(null);
  
  const scrollToAllProducts = useCallback(() => {
    if (!allProductsRef.current) return;
    const headerEl = document.querySelector("header");
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 80;
    const navEl = document.getElementById("category-sticky-nav");
    const navHeight = navEl ? navEl.getBoundingClientRect().height : 56;
    const totalOffset = headerHeight + navHeight + 12;

    const elementPosition = allProductsRef.current.getBoundingClientRect().top;
    window.scrollTo({
      top: elementPosition + window.pageYOffset - totalOffset,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="relative">
      <Header />
      <Container className="pt-4 md:space-y-6">
        {!isFiltering && <PromoBanner onShopClick={scrollToAllProducts} />}
        <ProductSection allProductsRef={allProductsRef} />
      </Container>
      <FloatingCartBanner />
      <CartDrawer />
      <ScrollToTopButton />
      <Footer />
    </div>
  );
}
