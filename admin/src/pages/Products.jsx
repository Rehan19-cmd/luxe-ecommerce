import { useState, useEffect } from 'react'
import axios from 'axios'
import { API, SERVER_URL } from '../config'

export default function Products() {
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  
  // New state for handling uploads
  const [selectedFiles, setSelectedFiles] = useState([])
  const [existingImages, setExistingImages] = useState([])
  
  const [form, setForm] = useState({ 
    name: '', description: '', price: '', comparePrice: '', 
    discountPercent: '', category: 'jewelry', subcategory: '', 
    tags: '', stock: '', material: '', weight: '', 
    featured: false, trending: false, offer: false 
  })

  const fetchProducts = () => axios.get(`${API}/products`).then(r => setProducts(r.data.products || [])).catch(err => console.error('Fetch error:', err))

  useEffect(() => { fetchProducts() }, [])

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', description: '', price: '', comparePrice: '', discountPercent: '', category: 'jewelry', subcategory: '', tags: '', stock: '', material: '', weight: '', featured: false, trending: false, offer: false })
    setSelectedFiles([])
    setExistingImages([])
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditing(p._id)
    const discount = p.comparePrice && p.comparePrice > p.price ? Math.round((1 - p.price / p.comparePrice) * 100) : ''
    setForm({ 
      name: p.name, description: p.description || '', price: p.price, 
      comparePrice: p.comparePrice || '', discountPercent: discount, 
      category: p.category, subcategory: p.subcategory || '', 
      tags: p.tags?.join(', ') || '', stock: p.stock, 
      material: p.material || '', weight: p.weight || '', 
      featured: p.featured, trending: p.trending, offer: p.offer || false 
    })
    setSelectedFiles([])
    setExistingImages(p.images || [])
    setShowModal(true)
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles([...selectedFiles, ...files])
  }

  const removeSelectedFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const removeExistingImage = (img) => {
    setExistingImages(existingImages.filter(i => i !== img))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('description', form.description)
    formData.append('price', form.price)
    formData.append('comparePrice', form.comparePrice || 0)
    formData.append('category', form.category)
    formData.append('subcategory', form.subcategory)
    formData.append('stock', form.stock || 0)
    formData.append('material', form.material)
    formData.append('weight', form.weight)
    formData.append('featured', form.featured)
    formData.append('trending', form.trending)
    formData.append('offer', form.offer)
    
    // Add tags
    const tagsArr = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    tagsArr.forEach(tag => formData.append('tags[]', tag))
    
    // Add existing images (that wasn't removed)
    existingImages.forEach(img => formData.append('images[]', img))
    
    // Add new files
    selectedFiles.forEach(file => {
      formData.append('images', file) // This matches the multer upload.array('images', 5)
    })

    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
      if (editing) {
        await axios.put(`${API}/products/${editing}`, formData, config)
      } else {
        await axios.post(`${API}/products`, formData, config)
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

  const getFullImgPath = (path) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `${SERVER_URL}${path}`
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
                <td>{p.images?.[0] ? <img className="data-table__img" src={getFullImgPath(p.images[0])} alt="" /> : '—'}</td>
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
                
                <div className="form-group">
                  <label className="form-label">Product Images</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {/* Existing Images */}
                    {existingImages.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid var(--gold)', borderRadius: '4px' }}>
                        <img src={getFullImgPath(img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        <button type="button" onClick={() => removeExistingImage(img)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}>&times;</button>
                      </div>
                    ))}
                    {/* New Selected Files */}
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid var(--primary)', borderRadius: '4px' }}>
                        <img src={URL.createObjectURL(file)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        <button type="button" onClick={() => removeSelectedFile(idx)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}>&times;</button>
                      </div>
                    ))}
                    {/* Add More Button */}
                    <label style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--gray-dark)', borderRadius: '4px', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--gray)' }}>
                      +
                      <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Upload high-quality jewelry & clothing photos. Multiple selection supported.</p>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price ($)</label>
                    <input className="form-input" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Compare Price ($)</label>
                    <input className="form-input" type="number" value={form.comparePrice} onChange={e => setForm({...form, comparePrice: e.target.value})} />
                  </div>
                </div>

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
