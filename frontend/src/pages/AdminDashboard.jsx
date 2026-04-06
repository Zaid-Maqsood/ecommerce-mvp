import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const STATUS_OPTIONS = ['pending', 'shipped', 'delivered'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', image: '' });
  const [editId, setEditId] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/dashboard'),
      api.get('/api/admin/orders'),
      api.get('/api/products'),
    ]).then(([statsRes, ordersRes, productsRes]) => {
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/api/admin/orders/${orderId}`, { status });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    } catch {
      alert('Failed to update status');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); setFormSuccess('');
    try {
      if (editId) {
        const { data } = await api.put(`/api/products/${editId}`, productForm);
        setProducts((prev) => prev.map((p) => p.id === editId ? data : p));
        setFormSuccess('Product updated!');
      } else {
        const { data } = await api.post('/api/products', productForm);
        setProducts((prev) => [data, ...prev]);
        setFormSuccess('Product created!');
      }
      setProductForm({ name: '', description: '', price: '', stock: '', image: '' });
      setEditId(null);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditId(product.id);
    setProductForm({ name: product.name, description: product.description, price: product.price, stock: product.stock, image: product.image || '' });
    setTab('products');
    setFormSuccess(''); setFormError('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Failed to delete product');
    }
  };

  const uploadImage = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImageUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await api.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProductForm((prev) => ({ ...prev, image: data.url }));
    } catch {
      setFormError('Image upload failed');
    } finally {
      setImageUploading(false);
    }
  };

  const handlePaste = (e) => {
    const file = Array.from(e.clipboardData.items)
      .find((item) => item.type.startsWith('image/'))
      ?.getAsFile();
    if (file) uploadImage(file);
  };

  if (loading) return <div className="page"><div className="loading-text">Loading dashboard…</div></div>;

  return (
    <main className="page">
      <h1 className="page-title">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <p className="stat-label">Total Users</p>
            <p className="stat-value">{stats?.totalUsers ?? 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/></svg>
          </div>
          <div>
            <p className="stat-label">Total Orders</p>
            <p className="stat-value">{stats?.totalOrders ?? 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-cyan">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <p className="stat-label">Total Revenue</p>
            <p className="stat-value">${(stats?.totalRevenue ?? 0).toFixed(2)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <div>
            <p className="stat-label">Products</p>
            <p className="stat-value">{stats?.totalProducts ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {['overview', 'orders', 'products'].map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ cursor: 'pointer' }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="admin-section">
          <h2 className="section-title">Top Selling Products</h2>
          {stats?.topProducts?.length > 0 ? (
            <table className="admin-table">
              <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Units Sold</th></tr></thead>
              <tbody>
                {stats.topProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>${p.price?.toFixed(2)}</td>
                    <td><span className={p.stock === 0 ? 'badge badge-red' : 'badge badge-green'}>{p.stock}</span></td>
                    <td><strong>{p.totalSold}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="muted">No sales data yet.</p>}
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div className="admin-section">
          <h2 className="section-title">All Orders</h2>
          <div className="table-scroll">
            <table className="admin-table">
              <thead><tr><th>#</th><th>Customer</th><th>Total</th><th>Address</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.user?.email}</td>
                    <td>${order.totalAmount.toFixed(2)}</td>
                    <td className="address-cell">{order.address}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`status-select status-${order.status}`}
                        style={{ cursor: 'pointer' }}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {tab === 'products' && (
        <div className="admin-section">
          <div className="products-admin-layout">
            {/* Product Form */}
            <div className="product-form-card">
              <h2 className="section-title">{editId ? 'Edit Product' : 'Add New Product'}</h2>
              {formError && <div className="alert alert-error">{formError}</div>}
              {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
              <form onSubmit={handleProductSubmit} className="auth-form">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" placeholder="Product name" value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea placeholder="Product description" value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} required rows={3} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price ($)</label>
                    <input type="number" step="0.01" min="0" placeholder="0.00" value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input type="number" min="0" placeholder="0" value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group" onPaste={handlePaste}>
                  <label>Product Image (optional)</label>
                  <div className="image-upload-area" onClick={() => fileInputRef.current.click()} style={{ cursor: 'pointer' }}>
                    {productForm.image ? (
                      <img src={productForm.image} alt="preview" className="image-preview" />
                    ) : (
                      <div className="image-upload-placeholder">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                        <span>{imageUploading ? 'Uploading…' : 'Click to upload or paste image'}</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => uploadImage(e.target.files[0])}
                  />
                  {productForm.image && (
                    <button type="button" className="btn-secondary" style={{ marginTop: '6px', fontSize: '12px', padding: '4px 10px' }}
                      onClick={() => setProductForm((prev) => ({ ...prev, image: '' }))}>
                      Remove image
                    </button>
                  )}
                </div>
                <div className="form-row">
                  <button type="submit" className="btn-primary" style={{ cursor: 'pointer' }}>
                    {editId ? 'Update Product' : 'Add Product'}
                  </button>
                  {editId && (
                    <button type="button" className="btn-secondary" onClick={() => { setEditId(null); setProductForm({ name: '', description: '', price: '', stock: '', image: '' }); }} style={{ cursor: 'pointer' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Product List */}
            <div className="product-list-admin">
              <h2 className="section-title">All Products ({products.length})</h2>
              <div className="table-scroll">
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>${p.price.toFixed(2)}</td>
                        <td><span className={p.stock === 0 ? 'badge badge-red' : 'badge badge-green'}>{p.stock}</span></td>
                        <td>
                          <button className="btn-icon-edit" onClick={() => handleEdit(p)} style={{ cursor: 'pointer' }}>Edit</button>
                          <button className="btn-icon-delete" onClick={() => handleDelete(p.id)} style={{ cursor: 'pointer' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
