import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000/api'

export default function Products() {
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', comparePrice: '', discountPercent: '', category: 'jewelry', subcategory: '', tags: '', stock: '', material: '', weight: '', featured: false, trending: false, offer: false, images: '' })

  const fetchProducts = () => axios.get(`${API}/products`).then(r => setProducts(r.data.products || [])).catch(err => console.error('Fetch error:', err))

  useEffect(() => { fetchProducts() }, [])

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', description: '', price: '', comparePrice: '', discountPercent: '', category: 'jewelry', subcategory: '', tags: '', stock: '', material: '', weight: '', featured: false, trending: false, offer: false, images: '' })
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditing(p._id)
    const discount = p.comparePrice && p.comparePrice > p.price ? Math.round((1 - p.price / p.comparePrice) * 100) : ''
    setForm({ name: p.name, description: p.description || '', price: p.price, comparePrice: p.comparePrice || '', discountPercent: discount, category: p.category, subcategory: p.subcategory || '', tags: p.tags?.join(', ') || '', stock: p.stock, material: p.material || '', weight: p.weight || '', featured: p.featured, trending: p.trending, offer: p.offer || false, images: p.images?.join(', ') || '' })
    setShowModal(true)
  }

  // When discount % changes, auto-calculate compare price
  const handleDiscountChange = (val) => {
    const disc = Number(val) || 0
    const price = Number(form.price) || 0
    let comparePrice = ''
    if (disc > 0 && price > 0) {
      comparePrice = Math.round(price / (1 - disc / 100))
    }
    setForm({ ...form, discountPercent: val, comparePrice: comparePrice.toString() })
  }

  // When price changes, recalculate compare price if discount exists
  const handlePriceChange = (val) => {
    const price = Number(val) || 0
    const disc = Number(form.discountPercent) || 0
    let comparePrice = form.comparePrice
    if (disc > 0 && price > 0) {
      comparePrice = Math.round(price / (1 - disc / 100)).toString()
    }
    setForm({ ...form, price: val, comparePrice })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      comparePrice: Number(form.comparePrice) || 0,
      category: form.category,
      subcategory: form.subcategory,
      stock: Number(form.stock) || 0,
      material: form.material,
      weight: form.weight,
      featured: form.featured,
      trending: form.trending,
      offer: form.offer,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      images: form.images.split(',').map(t => t.trim()).filter(Boolean),
    }
    try {
      if (editing) {
        await axios.put(`${API}/products/${editing}`, payload)
      } else {
        await axios.post(`${API}/products`, payload)
      }
      setShowModal(false)
      fetchProducts()
    } catch (err) {
      console.error('Submit error:', err.response?.data || err.message)
      alert('Error: ' + (err.response?.data?.error || err.message))
    }
  }

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await axios.delete(`${API}/products/${id}`)
      fetchProducts()
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message)
      alert('Error deleting: ' + (err.response?.data?.error || err.message))
    }
  }

  return (
    <>
      <h1 className="page-title">Products</h1>
      <p className="page-subtitle">Manage your product catalog</p>

      <div className="table-container">
        <div className="table-header">
          <h3>{products.length} Products</h3>
          <button className="btn btn-primary" onClick={openNew}>+ Add Product</button>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} style={p.stock <= 0 ? { opacity: 0.5, background: 'rgba(255,68,68,0.05)' } : {}}>
                <td>{p.images?.[0] ? <img className="data-table__img" src={p.images[0]} alt="" /> : '—'}</td>
                <td><strong>{p.name}</strong></td>
                <td><span className="badge badge-info">{p.category}</span></td>
                <td style={{ color: 'var(--gold)' }}>
                  ${p.price?.toLocaleString()}
                  {p.comparePrice && p.comparePrice > p.price && (
                    <span style={{ color: 'var(--gray)', textDecoration: 'line-through', marginLeft: 6, fontSize: '0.8rem' }}>
                      ${p.comparePrice.toLocaleString()}
                    </span>
                  )}
                </td>
                <td style={p.stock <= 0 ? { color: '#ff4444', fontWeight: 700 } : {}}>
                  {p.stock <= 0 ? '⚠ OUT' : p.stock}
                </td>
                <td>
                  {p.featured && <span className="badge badge-warning" style={{ marginRight: 4 }}>Featured</span>}
                  {p.trending && <span className="badge badge-success" style={{ marginRight: 4 }}>Trending</span>}
                  {p.offer && <span className="badge badge-offer" style={{ marginRight: 4 }}>🏷️ Offer</span>}
                  {p.stock <= 0 && <span className="badge" style={{ background: '#ff4444', color: '#fff' }}>Sold Out</span>}
                </td>
                <td>
                  <button className="btn-icon" title="Edit" onClick={() => openEdit(p)}>✎</button>
                  <button className="btn-icon" title="Delete" onClick={() => deleteProduct(p._id)} style={{ color: 'var(--danger)' }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal">
            <div className="modal__header">
              <h3>{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowModal(false)} style={{ fontSize: '1.3rem' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal__body">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price ($)</label>
                    <input className="form-input" type="number" value={form.price} onChange={e => handlePriceChange(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Compare Price ($)</label>
                    <input className="form-input" type="number" value={form.comparePrice} onChange={e => setForm({...form, comparePrice: e.target.value})} />
                  </div>
                </div>

                {/* Discount Section — only shown when Offer is checked */}
                {form.offer && (
                  <div className="form-group" style={{ background: 'rgba(231, 76, 60, 0.08)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(231, 76, 60, 0.2)' }}>
                    <label className="form-label" style={{ color: '#e74c3c', fontWeight: 600 }}>🏷️ Discount Percentage (%)</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      max="99"
                      placeholder="e.g. 20 for 20% off"
                      value={form.discountPercent}
                      onChange={e => handleDiscountChange(e.target.value)}
                      style={{ borderColor: 'rgba(231, 76, 60, 0.3)' }}
                    />
                    {form.discountPercent && Number(form.price) > 0 && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--gray-light)', marginTop: 8 }}>
                        Original price will show as <strong style={{ color: 'var(--gold)' }}>${form.comparePrice}</strong> (struck through)
                        → Sale price <strong style={{ color: '#2ecc71' }}>${form.price}</strong>
                        = <strong style={{ color: '#e74c3c' }}>{form.discountPercent}% OFF</strong>
                      </p>
                    )}
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      <option value="jewelry">Jewelry</option>
                      <option value="clothing">Clothing</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subcategory</label>
                    <input className="form-input" value={form.subcategory} onChange={e => setForm({...form, subcategory: e.target.value})} placeholder="e.g. Necklaces, Rings" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input className="form-input" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
                  {Number(form.stock) <= 0 && form.stock !== '' && (
                    <p style={{ fontSize: '0.8rem', color: '#ff4444', marginTop: 4 }}>⚠ Product will appear as SOLD OUT on the website</p>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Material</label>
                    <input className="form-input" value={form.material} onChange={e => setForm({...form, material: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Weight</label>
                    <input className="form-input" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input className="form-input" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="diamond, gold, bridal" />
                </div>
                <div className="form-group">
                  <label className="form-label">Image URLs (comma-separated)</label>
                  <input className="form-input" value={form.images} onChange={e => setForm({...form, images: e.target.value})} placeholder="https://example.com/image.jpg" />
                </div>
                <div className="form-row" style={{ gap: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} /> ⭐ Featured
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.trending} onChange={e => setForm({...form, trending: e.target.checked})} /> 🔥 Trending
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#e74c3c' }}>
                    <input type="checkbox" checked={form.offer} onChange={e => setForm({...form, offer: e.target.checked})} /> 🏷️ Special Offer
                  </label>
                </div>
              </div>
              <div className="modal__footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ border: '1px solid var(--gray-dark)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'} Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
