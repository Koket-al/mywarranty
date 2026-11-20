'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import { apiRequest } from '../../../services/api';
import { PlusCircle, Package, X, Archive, Image as ImageIcon, Trash2 } from 'lucide-react';

export default function CompanyProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Product Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('Smartphones');
  const [description, setDescription] = useState('');
  const [serialNumberRequired, setSerialNumberRequired] = useState(true);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await apiRequest('/api/products');
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size exceeds 5MB limit.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview('');
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const data = await apiRequest('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name,
          brand,
          model,
          category,
          description,
          serialNumberRequired,
          imageBase64: imagePreview || ''
        })
      });

      if (data.success) {
        setIsModalOpen(false);
        setName('');
        setBrand('');
        setModel('');
        setDescription('');
        setImagePreview('');
        loadProducts();
      }
    } catch (err) {
      setError(err.message || 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id) => {
    if (!confirm('Archive this product? It will no longer appear for new warranty issuance.')) return;
    try {
      await apiRequest(`/api/products/${id}/archive`, { method: 'POST' });
      loadProducts();
    } catch (err) {
      alert(err.message || 'Failed to archive product.');
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar mode="company" />

        <main style={{ flex: 1, padding: '2rem', maxWidth: '1100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.01em' }}>
                Product Catalog
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Manage electronics models, categories, and serial number requirements
              </p>
            </div>

            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              <PlusCircle size={18} /> Add New Product
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading catalog...</div>
          ) : products.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Package size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>No products registered</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Add your electronics catalog items to enable sales staff to issue digital warranties.
              </p>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
                Add First Product
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Photo</th>
                    <th>Product Name</th>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Category</th>
                    <th>Serial Required</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td>
                        {p.imageUrl ? (
                          <div style={{ width: '42px', height: '42px', borderRadius: '6px', overflow: 'hidden', border: 'none', background: 'var(--feature-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ) : (
                          <div style={{ width: '42px', height: '42px', borderRadius: '6px', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={20} color="var(--text-muted)" />
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>{p.brand}</td>
                      <td>{p.model}</td>
                      <td><span className="badge badge-info">{p.category}</span></td>
                      <td>{p.serialNumberRequired ? 'Yes' : 'No'}</td>
                      <td>
                        <button onClick={() => handleArchive(p._id)} className="btn btn-secondary btn-sm" title="Archive product">
                          <Archive size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* New Product Modal */}
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title">Add Product to Catalog</h3>
                  <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleCreateProduct}>
                  <div className="form-group">
                    <label className="form-label">Product Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Galaxy S24 Ultra"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Brand <span className="required">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Samsung"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Model <span className="required">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. SM-S928B"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Smartphones">Smartphones</option>
                      <option value="Laptops">Laptops & Computers</option>
                      <option value="Tablets">Tablets</option>
                      <option value="Televisions">Televisions</option>
                      <option value="Audio">Audio & Headphones</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Home Appliances">Home Appliances</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Product Image (Optional)</span>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: 0
                          }}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      )}
                    </label>

                    {imagePreview ? (
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '150px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid var(--border)',
                        background: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img
                          src={imagePreview}
                          alt="Product Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    ) : (
                      <label style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.25rem',
                        border: '2px dashed var(--border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: 'var(--bg-card)',
                        transition: 'border-color 0.2s',
                        textAlign: 'center'
                      }}>
                        <ImageIcon size={28} color="var(--text-muted)" style={{ marginBottom: '0.4rem' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                          Click to upload product photo
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          PNG, JPG, WEBP up to 5MB
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description (Optional)</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Brief specifications or color details..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="snReq"
                      checked={serialNumberRequired}
                      onChange={(e) => setSerialNumberRequired(e.target.checked)}
                    />
                    <label htmlFor="snReq" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                      Require unique serial number at warranty issuance
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Saving...' : 'Add Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

