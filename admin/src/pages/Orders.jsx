import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000/api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('')

  const fetchOrders = () => {
    const params = filter ? { status: filter } : {}
    axios.get(`${API}/orders`, { params }).then(r => setOrders(r.data.orders || []))
  }

  useEffect(() => { fetchOrders() }, [filter])

  const updateStatus = async (id, status) => {
    await axios.put(`${API}/orders/${id}`, { status })
    fetchOrders()
  }

  const updatePayment = async (id, paymentStatus) => {
    await axios.put(`${API}/orders/${id}`, { paymentStatus })
    fetchOrders()
  }

  const statusColors = { pending: 'warning', confirmed: 'info', shipped: 'info', delivered: 'success', cancelled: 'danger' }
  const payColors = { unpaid: 'danger', paid: 'success', refunded: 'warning' }

  return (
    <>
      <h1 className="page-title">Orders</h1>
      <p className="page-subtitle">Track and manage customer orders</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : ''}`} onClick={() => setFilter(s)}
            style={filter !== s ? { border: '1px solid var(--gray-dark)', color: 'var(--gray)' } : {}}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="table-container">
        <div className="table-header"><h3>{orders.length} Orders</h3></div>
        <table className="data-table">
          <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id}>
                <td style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{o.orderNumber || o._id?.slice(-8)}</td>
                <td>
                  <div><strong>{o.customer?.name}</strong></div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>{o.customer?.email}</div>
                </td>
                <td>{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</td>
                <td style={{ color: 'var(--gold)', fontWeight: 500 }}>${o.totalAmount?.toLocaleString()}</td>
                <td><span className={`badge badge-${statusColors[o.status] || 'warning'}`}>{o.status}</span></td>
                <td><span className={`badge badge-${payColors[o.paymentStatus] || 'warning'}`}>{o.paymentStatus}</span></td>
                <td>
                  <select className="form-select" value={o.status} onChange={e => updateStatus(o._id, e.target.value)}
                    style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem' }}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select className="form-select" value={o.paymentStatus} onChange={e => updatePayment(o._id, e.target.value)}
                    style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem', marginLeft: 6 }}>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
