import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import "../styles/Products.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search") || "";

  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [category, minPrice, maxPrice, sortOrder, search]);

  useEffect(() => {
    api
      .get("products/products/")
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const filteredProducts = products
    .filter((product) => {
      const productName = product.name?.toLowerCase() || "";
      const productCategory = product.category?.toLowerCase() || "";
      const productPrice = Number(product.price);

      const searchText = search.trim().toLowerCase();

const searchMatch =
  searchText === "" ||
  productName.includes(searchText);

      const categoryMatch =
        category === "" || productCategory === category.toLowerCase();

      const minPriceMatch =
        minPrice === "" || productPrice >= Number(minPrice);

      const maxPriceMatch =
        maxPrice === "" || productPrice <= Number(maxPrice);

      return (
        searchMatch &&
        categoryMatch &&
        minPriceMatch &&
        maxPriceMatch
      );
    })
    .sort((a, b) => {
      if (sortOrder === "low-to-high") {
        return Number(a.price) - Number(b.price);
      }

      if (sortOrder === "high-to-low") {
        return Number(b.price) - Number(a.price);
      }

      return 0;
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const clearFilters = () => {
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortOrder("");
  };

  return (
    <div className="products-page-wrapper">
      <h1 className="products-page-title">Products</h1>

      {/* Filter Bar */}
      <div className="products-filter-bar">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="products-filter-select"
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="grocery">Grocery</option>
          <option value="fashion">Fashion</option>
          <option value="beauty">Beauty</option>
          <option value="home">Home</option>
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="products-filter-input"
        />

        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="products-filter-input"
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="products-filter-select"
        >
          <option value="">Sort By</option>
          <option value="low-to-high">Price: Low to High</option>
          <option value="high-to-low">Price: High to Low</option>
        </select>

        <button onClick={clearFilters} className="products-clear-btn">
          Clear Filters
        </button>
      </div>

      {/* Grid */}
      <div className="products-grid">
        {currentProducts.length === 0 ? (
          <div className="products-empty">
            <h2>No products found</h2>
          </div>
        ) : (
          currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            aria-label="Previous Page"
          >
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              className={`pagination-btn ${currentPage === pageNumber ? "active" : ""}`}
              onClick={() => setCurrentPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            aria-label="Next Page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};