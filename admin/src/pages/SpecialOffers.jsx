import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000/api'

export default function SpecialOffers() {
  const [products, setProducts] = useState([])
  const [offerProducts, setOfferProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/products`)
      const all = res.data.products || []
      setProducts(all)
      setOfferProducts(all.filter(p => p.offer))
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const toggleOffer = async (p) => {
    try {
      await axios.put(`${API}/products/${p._id}`, { ...p, offer: !p.offer, tags: p.tags || [], images: p.images || [] })
      fetchData()
    } catch (err) {
      alert('Error updating offer: ' + (err.response?.data?.error || err.message))
    }
  }

  return (
    <>
      <h1 className="page-title">Special Offers Management</h1>
      <p className="page-subtitle">Add or remove products from the Special Offers section on the homepage</p>

      <div className="table-container">
        <div className="table-header">
          <h3>🏷️ Active Offers ({offerProducts.length})</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Promo Badge</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offerProducts.map(p => (
              <tr key={p._id}>
                <td>{p.images?.[0] ? <img className="data-table__img" src={p.images[0]} alt="" /> : '—'}</td>
                <td><strong>{p.name}</strong></td>
                <td><span className="badge badge-info">{p.category}</span></td>
                <td style={{ color: 'var(--gold)' }}>${p.price?.toLocaleString()}</td>
                <td>
                    <span className="badge badge-offer">Active Offer</span>
                </td>
                <td>
                  <button className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => toggleOffer(p)}>
                    Remove from Offers
                  </button>
                </td>
              </tr>
            ))}
            {!offerProducts.length && !loading && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--gray)', padding: '40px' }}>
                  No active offers. Add one from the product list below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-container" style={{ marginTop: '40px' }}>
        <div className="table-header">
          <h3>📦 All Products</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>Choose products to feature as special offers</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.filter(p => !p.offer).map(p => (
              <tr key={p._id}>
                <td>{p.images?.[0] ? <img className="data-table__img" src={p.images[0]} alt="" /> : '—'}</td>
                <td><strong>{p.name}</strong></td>
                <td style={{ color: 'var(--gold)' }}>${p.price?.toLocaleString()}</td>
                <td>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--gray)' }}>Regular</span>
                </td>
                <td>
                  <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => toggleOffer(p)}>
                    + Make Special Offer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
