import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import Container from "../../../components/layout/Container";
import PromoBanner from "../components/PromoBanner";
import ProductSection from "../components/ProductSection";
import CartDrawer from "../../../features/cart/components/CartDrawer";
import { useSearch } from "../../../../context/SearchContext";
import ScrollToTopButton from "../../../components/common/ScrollToTopButton";
import { useRef } from "react";

export default function Home() {
  const { searchItem, priceRange } = useSearch();
  const isFiltering = searchItem.trim() !== "" || priceRange !== "all";

  const allProductsRef = useRef(null);
  
  const scrollToAllProducts = () => {
    if (!allProductsRef.current) return;
    const headerOffset = 100;
    const elementPosition = allProductsRef.current.getBoundingClientRect().top;
    window.scrollTo({
      top: elementPosition + window.pageYOffset - headerOffset,
      behavior: "smooth",
    });
  };

  return (
    // Replaced standard div with a relative wrapper and padding-top
    <div className="relative">
      <Header />
      <Container className="py-5 md:space-y-6">
        {!isFiltering && <PromoBanner onShopClick={scrollToAllProducts} />}
        <ProductSection allProductsRef={allProductsRef} />
      </Container>
      <CartDrawer />
      <ScrollToTopButton />
      <Footer />
    </div>
  );
}