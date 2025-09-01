import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import ProductGrid from "./components/ProductGrid/ProductGrid";
import Home from "./components/Home/Home";
import { products } from "./components/product/product";
import SearchPage from "./components/SearchPage/SearchPage";
import ProfilePage from "./components/Profile-Page/profile";
import "./App.css";

function SearchWrapper() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("q") || "";
  return <SearchPage query={query} />;
}

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/office-stationery" element={<ProductGrid products={products['office-stationery']} />} />
            <Route path="/housekeeping-materials" element={<ProductGrid products={products['housekeeping-materials']} />} />
            <Route path="/packaging-materials" element={<ProductGrid products={products['packaging-materials']} />} />
            <Route path="/art-craft" element={<ProductGrid products={products['art-craft']} />} />
            <Route path="/search" element={<SearchWrapper />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
