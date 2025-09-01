// src/components/SearchPage/SearchPage.jsx
import ProductGrid from "../ProductGrid/ProductGrid";
import { products } from "../product/product";

function SearchPage({ query }) {
  if (!query) {
    return <p style={{ textAlign: "center", margin: "2rem" }}>Type something to search products...</p>;
  }

  // Flatten all products
  const allProducts = Object.values(products).flat();

  // Filter by name (case-insensitive)
  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <h2 style={{ textAlign: "center", margin: "1.5rem 0" }}>
        Search Results for: "{query}"
      </h2>
      {filtered.length > 0 ? (
        <ProductGrid products={filtered} />
      ) : (
        <p style={{ textAlign: "center", margin: "2rem" }}>No products found.</p>
      )}
    </div>
  );
}

export default SearchPage;
