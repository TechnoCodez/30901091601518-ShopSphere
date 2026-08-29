import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import reviewApi from "../api/reviewApi";
import { useAuth } from "../context/AuthContext";

function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await reviewApi.get(`/reviews/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to load reviews", err);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id]);

  const handleAddToCart = async () => {
    setMessage("");
    try {
      await api.post(
        "/cart",
        { productId: id, quantity: 1 },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      setMessage("Added to cart!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add to cart");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    try {
      await reviewApi.post(`/reviews/${id}`, {
        rating,
        comment,
        userId: user.id,
        userName: user.name,
      });
      setComment("");
      setRating(5);
      fetchReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p className="section-subtitle">Loading product...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <p className="error-text">{error}</p>
        <Link to="/" className="btn btn-outline" style={{ marginTop: "1rem" }}>
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to="/" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
        ← Back to shop
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
          marginTop: "1.5rem",
          alignItems: "start",
        }}
      >
        <div
          style={{
            borderRadius: "var(--radius)",
            overflow: "hidden",
            background: "var(--section-bg)",
            border: "1px solid var(--border)",
          }}
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
            <div
              style={{
                width: "100%",
                height: "420px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
              }}
            >
              No image available
            </div>
          )}
        </div>

        <div>
          <span className="badge">{product.category?.name}</span>
          <h1
            style={{
              fontSize: "2.2rem",
              fontWeight: 700,
              margin: "0.75rem 0 0.5rem",
            }}
          >
            {product.name}
          </h1>
          <p
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--accent)",
              marginBottom: "1.5rem",
            }}
          >
            ${product.price}
          </p>

          <p
            style={{
              color: "var(--text-muted)",
              lineHeight: 1.7,
              marginBottom: "1.5rem",
            }}
          >
            {product.description}
          </p>

          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              marginBottom: "2rem",
            }}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {user ? (
            <button
              onClick={handleAddToCart}
              className="btn btn-primary"
              disabled={product.stock === 0}
              style={{ width: "100%", opacity: product.stock === 0 ? 0.5 : 1 }}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          ) : (
            <div>
              <p
                style={{ color: "var(--text-muted)", marginBottom: "0.75rem" }}
              >
                Log in to add this to your cart.
              </p>
              <Link
                to="/login"
                className="btn btn-outline"
                style={{ width: "100%", display: "flex" }}
              >
                Log In
              </Link>
            </div>
          )}

          {message && (
            <p
              className={
                message.includes("Added") ? "success-text" : "error-text"
              }
            >
              {message}
            </p>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: "3rem",
          borderTop: "1px solid var(--border)",
          paddingTop: "2rem",
        }}
      >
        <h2
          style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}
        >
          Reviews
        </h2>

        {reviews.length === 0 ? (
          <p className="section-subtitle">No reviews yet.</p>
        ) : (
          reviews.map((r) => (
            <div
              key={r._id}
              style={{
                borderBottom: "1px solid var(--border)",
                padding: "1rem 0",
              }}
            >
              <strong>{r.userName}</strong> — {"★".repeat(r.rating)}
              {"☆".repeat(5 - r.rating)}
              <p style={{ color: "var(--text-muted)", marginTop: "0.3rem" }}>
                {r.comment}
              </p>
            </div>
          ))
        )}

        {user ? (
          <form onSubmit={handleReviewSubmit} style={{ marginTop: "1.5rem" }}>
            <div className="form-group">
              <label htmlFor="rating">Rating</label>
              <select
                id="rating"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
                <option value={1}>1 - Terrible</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="comment">Comment</label>
              <input
                id="comment"
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>
            {reviewError && <p className="error-text">{reviewError}</p>}
            <button type="submit" className="btn btn-primary">
              Submit Review
            </button>
          </form>
        ) : (
          <p className="section-subtitle" style={{ marginTop: "1rem" }}>
            Log in to leave a review.
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
