import { useState, useEffect } from 'react'
import axios from 'axios'
import { API } from '../config'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API}/dashboard`)
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ color: 'var(--gray)' }}>Loading dashboard...</p>
  if (!data) return <p style={{ color: 'var(--gray)' }}>Unable to connect to backend. Make sure the server is running on port 5000.</p>

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const maxRevenue = Math.max(...(data.monthlyRevenue?.map(m => m.revenue) || [1]), 1)

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Welcome back. Here's your store overview.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__label">Total Revenue</div>
          <div className="stat-card__value">${data.totalRevenue?.toLocaleString() || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Total Orders</div>
          <div className="stat-card__value">{data.totalOrders || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Products</div>
          <div className="stat-card__value">{data.totalProducts || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Sellers</div>
          <div className="stat-card__value">{data.totalSellers || 0}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card__title">Monthly Revenue</div>
          <div className="bar-chart">
            {data.monthlyRevenue?.length ? data.monthlyRevenue.map((m, i) => (
              <div className="bar-chart__bar" key={i}>
                <div className="bar-chart__value">${(m.revenue / 1000).toFixed(1)}k</div>
                <div className="bar-chart__fill" style={{ height: `${(m.revenue / maxRevenue) * 160}px` }} />
                <div className="bar-chart__label">{months[m._id.month - 1]}</div>
              </div>
            )) : <p style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>No revenue data yet</p>}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card__title">Orders by Status</div>
          <div style={{ padding: '10px 0' }}>
            {data.ordersByStatus?.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(201,168,76,0.06)' }}>
                <span className={`badge badge-${s._id === 'delivered' ? 'success' : s._id === 'cancelled' ? 'danger' : s._id === 'shipped' ? 'info' : 'warning'}`}>{s._id}</span>
                <span style={{ color: 'var(--white)', fontWeight: 500 }}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="table-container">
          <div className="table-header"><h3>Most Sold Products</h3></div>
          <table className="data-table">
            <thead><tr><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
            <tbody>
              {data.mostSold?.map((p, i) => (
                <tr key={i}>
                  <td>{p._id}</td>
                  <td>{p.totalQty}</td>
                  <td style={{ color: 'var(--gold)' }}>${p.revenue?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-container">
          <div className="table-header"><h3>Recent Orders</h3></div>
          <table className="data-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {data.recentOrders?.slice(0, 5).map((o, i) => (
                <tr key={i}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{o.orderNumber || o._id?.slice(-6)}</td>
                  <td>{o.customer?.name}</td>
                  <td style={{ color: 'var(--gold)' }}>${o.totalAmount?.toLocaleString()}</td>
                  <td><span className={`badge badge-${o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'danger' : o.status === 'shipped' ? 'info' : 'warning'}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
