import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);

  const fileInputRef = useRef(null);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${user?.token}` }
  });

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ['storeStats'],
    queryFn: async () => {
      const res = await api.get('/stats', getAuthHeader());
      return res.data;
    },
    enabled: !!user && user.role === 'ADMIN',
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.products);
    } catch (err) {
      setError('Failed to load products');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchProducts();
      fetchCategories();
    }
  }, [user, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('categoryId', categoryId);
    formData.append('stock', stock);
    if (image) formData.append('image', image);

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage('Product updated!');
        setEditingProduct(null);
      } else {
        await api.post('/products', formData, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage('Product created!');
      }

      setName('');
      setDescription('');
      setPrice('');
      setCategoryId('');
      setStock('');
      setImage(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`, getAuthHeader());
      fetchProducts();
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  if (authLoading) {
    return (
      <div className="container">
        <p className="section-subtitle">Verifying admin credentials...</p>
      </div>
    );
  }

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setCategoryId(product.categoryId);
    setStock(product.stock);
    setMessage('');
    setError('');
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="container">
        <p className="error-text">Access denied. Admins only.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="section-title">Admin Dashboard</h1>
      <p className="section-subtitle">Manage your product catalog</p>

      <div className="stats-grid">
        {statsLoading && <p className="section-subtitle">Loading stats...</p>}
        {statsError && <p className="error-text">Failed to load store stats</p>}
        {stats && (
          <>
            <div className="stat-card">
              <span className="stat-label">Total Products</span>
              <span className="stat-value">{stats.totalProducts}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{stats.totalUsers}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Customers</span>
              <span className="stat-value">{stats.totalCustomers}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Admins</span>
              <span className="stat-value">{stats.totalAdmins}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Cart Items</span>
              <span className="stat-value">{stats.totalCartItems}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Inventory Value</span>
              <span className="stat-value">${stats.totalInventoryValue}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Low Stock</span>
              <span className="stat-value">{stats.lowStockCount}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Out of Stock</span>
              <span className="stat-value">{stats.outOfStockCount}</span>
            </div>
          </>
        )}
      </div>

      <div className="form-container" style={{ margin: '0 0 3rem' }}>
        <h1>{editingProduct ? 'Edit Product' : 'Create Product'}</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoryId">Category</label>
            <select
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock</label>
            <input
              id="stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Image</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          {error && <p className="error-text">{error}</p>}
          {message && <p className="success-text">{message}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {editingProduct ? 'Update Product' : 'Create Product'}
          </button>

          {editingProduct && (
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', marginTop: '0.5rem' }}
              onClick={() => {
                setEditingProduct(null);
                setName('');
                setDescription('');
                setPrice('');
                setCategoryId('');
                setStock('');
                setImage(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <h2 className="section-title" style={{ fontSize: '1.5rem' }}>
        Existing Products
      </h2>

      {products.length === 0 ? (
        <p className="section-subtitle">No products yet.</p>
      ) : (
        products.map((p) => (
          <div key={p.id} className="admin-product-row">
            <div className="product-info">
              <span>{p.name}</span>
              <span>${p.price}</span>
            </div>
            <button onClick={() => handleEditClick(p)} className="btn btn-outline">
              Edit
            </button>
            <button onClick={() => handleDelete(p.id)} className="btn btn-danger">
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminDashboard;