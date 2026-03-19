import { useState, useEffect } from 'react'
import axios from 'axios'
import { API } from '../config'

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState([])

  const fetchSubscribers = () => {
    axios.get(`${API}/subscribers`)
      .then(res => setSubscribers(res.data))
      .catch(err => console.error(err))
  }

  useEffect(() => { fetchSubscribers() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this subscriber?')) return
    try {
      await axios.delete(`${API}/subscribers/${id}`)
      fetchSubscribers()
    } catch (err) {
      alert('Error removing subscriber')
    }
  }

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Email,Date\n" + 
      subscribers.map(s => `${s.email},${new Date(s.createdAt).toLocaleDateString()}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      <h1 className="page-title">Subscribers</h1>
      <p className="page-subtitle">Manage newsletter subscribers</p>
      
      <div className="table-container">
        <div className="table-header">
          <h3>{subscribers.length} Subscribers</h3>
          <button className="btn btn-primary" onClick={exportCSV}>Export CSV</button>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Email</th><th>Date Subscribed</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {subscribers.map(s => (
              <tr key={s._id}>
                <td><strong>{s.email}</strong></td>
                <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn-icon" onClick={() => handleDelete(s._id)} style={{ color: 'var(--danger)' }}>✕</button>
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--gray)' }}>No subscribers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
