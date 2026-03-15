import { useState, useEffect } from 'react'
import axios from 'axios'
import { API } from '../config'

export default function Sellers() {
  const [sellers, setSellers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', brand: '', email: '', phone: '', description: '', type: 'both' })

  const fetch = () => axios.get(`${API}/sellers`).then(r => setSellers(r.data || []))
  useEffect(() => { fetch() }, [])

  const openNew = () => { setEditing(null); setForm({ name: '', brand: '', email: '', phone: '', description: '', type: 'both' }); setShowModal(true) }
  const openEdit = (s) => { setEditing(s._id); setForm({ name: s.name, brand: s.brand, email: s.email, phone: s.phone, description: s.description, type: s.type }); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) await axios.put(`${API}/sellers/${editing}`, form)
      else await axios.post(`${API}/sellers`, form)
      setShowModal(false); fetch()
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)) }
  }

  const deleteSeller = async (id) => {
    if (!window.confirm('Delete this seller?')) return
    await axios.delete(`${API}/sellers/${id}`); fetch()
  }

  return (
    <>
      <h1 className="page-title">Sellers</h1>
      <p className="page-subtitle">Manage jewelry designers and fashion houses</p>

      <div className="table-container">
        <div className="table-header">
          <h3>{sellers.length} Sellers</h3>
          <button className="btn btn-primary" onClick={openNew}>+ Add Seller</button>
        </div>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Brand</th><th>Type</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead>
          <tbody>
            {sellers.map(s => (
              <tr key={s._id}>
                <td><strong>{s.name}</strong></td>
                <td>{s.brand || '—'}</td>
                <td><span className="badge badge-info">{s.type}</span></td>
                <td style={{ color: 'var(--gray)' }}>{s.email || '—'}</td>
                <td style={{ color: 'var(--gray)' }}>{s.phone || '—'}</td>
                <td>
                  <button className="btn-icon" title="Edit" onClick={() => openEdit(s)}>✎</button>
                  <button className="btn-icon" title="Delete" onClick={() => deleteSeller(s._id)} style={{ color: 'var(--danger)' }}>✕</button>
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
              <h3>{editing ? 'Edit Seller' : 'Add Seller'}</h3>
              <button onClick={() => setShowModal(false)} style={{ fontSize: '1.3rem' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal__body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input className="form-input" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="jewelry">Jewelry</option>
                    <option value="clothing">Clothing</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                </div>
              </div>
              <div className="modal__footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ border: '1px solid var(--gray-dark)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'} Seller</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
