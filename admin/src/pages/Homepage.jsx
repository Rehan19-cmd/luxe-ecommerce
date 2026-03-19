import { useState, useEffect } from 'react'
import axios from 'axios'
import { API } from '../config'

export default function Homepage() {
  const [products, setProducts] = useState([])
  const [saving, setSaving] = useState({})

  const fetchProducts = () => axios.get(`${API}/products`)
    .then(r => setProducts(r.data.products || []))
    .catch(() => {})

  useEffect(() => { fetchProducts() }, [])

  const toggleFlag = async (p, flag) => {
    setSaving(s => ({ ...s, [p._id + flag]: true }))
    try {
      await axios.put(`${API}/products/${p._id}`, {
        ...p,
        [flag]: !p[flag],
        tags: p.tags || [],
        images: p.images || [],
      })
      fetchProducts()
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message))
    }
    setSaving(s => ({ ...s, [p._id + flag]: false }))
  }

  const FlagTable = ({ title, emoji, flag, desc }) => {
    const active = products.filter(p => p[flag])
    return (
      <div className="table-container" style={{ marginBottom: 32 }}>
        <div className="table-header">
          <div>
            <h3>{emoji} {title} ({active.length} active)</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{desc}</span>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>{title}</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} style={{ opacity: p[flag] ? 1 : 0.55 }}>
                <td>{p.images?.[0] ? <img className="data-table__img" src={p.images[0]} alt="" /> : '—'}</td>
                <td><strong>{p.name}</strong></td>
                <td><span className="badge badge-info">{p.category}</span></td>
                <td style={{ color: 'var(--gold)' }}>${p.price?.toLocaleString()}</td>
                <td>
                  <button
                    className={`btn ${p[flag] ? 'btn-primary' : ''}`}
                    style={{ fontSize: '0.75rem', padding: '6px 18px', border: p[flag] ? 'none' : '1px solid var(--gray-dark)', opacity: saving[p._id + flag] ? 0.5 : 1 }}
                    onClick={() => toggleFlag(p, flag)}
                    disabled={!!saving[p._id + flag]}
                  >
                    {saving[p._id + flag] ? '...' : p[flag] ? `✓ Active` : `Enable`}
                  </button>
                </td>
              </tr>
            ))}
            {!products.length && (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--gray)' }}>No products yet. Add products first.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <>
      <h1 className="page-title">Homepage Manager</h1>
      <p className="page-subtitle">Control which products appear in the Special Offers, New Arrivals, and Most Sold sections on the homepage. Toggle each product on or off per section below.</p>

      <FlagTable
        title="Special Offers"
        emoji="🏷️"
        flag="offer"
        desc="Products shown in the Special Offers carousel on the homepage."
      />
      <FlagTable
        title="New Arrivals"
        emoji="✨"
        flag="newArrival"
        desc="Products shown in the New Arrivals carousel on the homepage."
      />
      <FlagTable
        title="Most Sold"
        emoji="🔥"
        flag="mostSold"
        desc="Products shown in the Most Sold carousel on the homepage."
      />
    </>
  )
}
