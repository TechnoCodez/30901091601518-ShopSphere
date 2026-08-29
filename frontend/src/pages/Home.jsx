import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../hooks/useDebounce";
import api from "../api/axios";

function Home() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  const debouncedKeyword = useDebounce(keyword, 300);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data;
    },
  });

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", debouncedKeyword, category, sort],
    queryFn: async () => {
      const params = {};
      if (debouncedKeyword) params.keyword = debouncedKeyword;
      if (category) params.category = category;
      if (sort) params.sort = sort;

      const res = await api.get("/products", { params });
      return res.data.products;
    },
  });

  return (
    <div>
      <div className="hero">
        <h1>Discover Your Next Favorite Thing</h1>
        <p>Quality products, unbeatable prices, delivered fast.</p>
      </div>

      <div className="container">
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">Sort by</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A-Z</option>
          </select>
        </div>

        {isLoading && <p>Loading products...</p>}
        {isError && <p className="error-text">Failed to load products</p>}

        {!isLoading && !isError && products.length === 0 && (
          <p>No products found.</p>
        )}

        <div className="product-grid">
          {products.map((product) => (
            <Link
              to={`/products/${product.id}`}
              key={product.id}
              className="product-card"
            >
              {product.imageUrl ? (
                <img
                  src={
                    product.imageUrl.startsWith("http")
                      ? product.imageUrl
                      : `${import.meta.env.VITE_API_URL?.replace("/api", "")}${product.imageUrl}`
                  }
                  alt={product.name}
                />
              ) : (
                <img
                  src="https://placehold.co/400x300?text=No+Image"
                  alt={product.name}
                />
              )}
              <div className="product-card-body">
                <span className="badge">{product.category?.name}</span>
                <h3>{product.name}</h3>
                <p className="product-price">${product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
