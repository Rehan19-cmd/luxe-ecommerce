import { useState, useEffect } from 'react'
import axios from 'axios'
import { API } from '../config'

export default function Homepage() {
  const [categories, setCategories] = useState([])
  const [showCatModal, setShowCatModal] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [catForm, setCatForm] = useState({ name: '', slug: '', image: '', description: '' })
  const [products, setProducts] = useState([])
  const [offerProducts, setOfferProducts] = useState([])

  const fetchCategories = () => axios.get(`${API}/categories`).then(r => setCategories(r.data || [])).catch(() => {})
  const fetchProducts = () => axios.get(`${API}/products`).then(r => {
    const all = r.data.products || []
    setProducts(all)
    setOfferProducts(all.filter(p => p.offer))
  }).catch(() => {})

  useEffect(() => { fetchCategories(); fetchProducts() }, [])

  const saveCat = async (e) => {
    e.preventDefault()
    try {
      if (editingCat) {
        await axios.put(`${API}/categories/${editingCat}`, catForm)
      } else {
        await axios.post(`${API}/categories`, catForm)
      }
      setShowCatModal(false)
      fetchCategories()
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message))
    }
  }

  const deleteCat = async (id) => {
    if (!window.confirm('Delete this category?')) return
    try {
      await axios.delete(`${API}/categories/${id}`)
      fetchCategories()
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message))
    }
  }

  const toggleOffer = async (p) => {
    try {
      await axios.put(`${API}/products/${p._id}`, { ...p, offer: !p.offer, tags: p.tags || [], images: p.images || [] })
      fetchProducts()
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message))
    }
  }

  return (
    <>
      <h1 className="page-title">Homepage Manager</h1>
      <p className="page-subtitle">Manage homepage sections, categories, and special offers</p>

      {/* ── Categories Section ── */}
      <div className="table-container" style={{ marginBottom: 32 }}>
        <div className="table-header">
          <h3>📂 Categories ({categories.length})</h3>
          <button className="btn btn-primary" onClick={() => { setEditingCat(null); setCatForm({ name: '', slug: '', image: '', description: '' }); setShowCatModal(true) }}>+ Add Category</button>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Image</th><th>Name</th><th>Slug</th><th>Description</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c._id}>
                <td>{c.image ? <img className="data-table__img" src={c.image} alt="" /> : '—'}</td>
                <td><strong>{c.name}</strong></td>
                <td><span className="badge badge-info">{c.slug}</span></td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description}</td>
                <td>
                  <button className="btn-icon" title="Edit" onClick={() => { setEditingCat(c._id); setCatForm({ name: c.name, slug: c.slug || '', image: c.image || '', description: c.description || '' }); setShowCatModal(true) }}>✎</button>
                  <button className="btn-icon" title="Delete" onClick={() => deleteCat(c._id)} style={{ color: 'var(--danger)' }}>✕</button>
                </td>
              </tr>
            ))}
            {!categories.length && <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--gray)' }}>No categories yet. Add one to get started.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* ── Offer Products Quick Toggle ── */}
      <div className="table-container">
        <div className="table-header">
          <h3>🏷️ Special Offers ({offerProducts.length} active)</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Toggle products as special offers — they'll appear on the homepage</span>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Offer Status</th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} style={{ opacity: p.offer ? 1 : 0.6 }}>
                <td>{p.images?.[0] ? <img className="data-table__img" src={p.images[0]} alt="" /> : '—'}</td>
                <td><strong>{p.name}</strong></td>
                <td><span className="badge badge-info">{p.category}</span></td>
                <td style={{ color: 'var(--gold)' }}>${p.price?.toLocaleString()}</td>
                <td>
                  <button
                    className={`btn ${p.offer ? 'btn-primary' : ''}`}
                    style={{ fontSize: '0.75rem', padding: '6px 16px', border: p.offer ? 'none' : '1px solid var(--gray-dark)' }}
                    onClick={() => toggleOffer(p)}
                  >
                    {p.offer ? '✓ Active Offer' : 'Make Offer'}
                  </button>
                </td>
              </tr>
            ))}
            {!products.length && <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--gray)' }}>No products yet. Add products first.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* ── Category Modal ── */}
      {showCatModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCatModal(false) }}>
          <div className="modal">
            <div className="modal__header">
              <h3>{editingCat ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowCatModal(false)} style={{ fontSize: '1.3rem' }}>&times;</button>
            </div>
            <form onSubmit={saveCat}>
              <div className="modal__body">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug (URL-friendly)</label>
                  <input className="form-input" value={catForm.slug} onChange={e => setCatForm({...catForm, slug: e.target.value})} placeholder="e.g. jewelry, clothing" />
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input className="form-input" value={catForm.image} onChange={e => setCatForm({...catForm, image: e.target.value})} placeholder="https://example.com/image.jpg" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})}></textarea>
                </div>
              </div>
              <div className="modal__footer">
                <button type="button" className="btn" onClick={() => setShowCatModal(false)} style={{ border: '1px solid var(--gray-dark)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCat ? 'Update' : 'Create'} Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
