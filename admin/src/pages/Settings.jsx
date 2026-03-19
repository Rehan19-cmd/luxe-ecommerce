import { useState, useEffect } from 'react'
import axios from 'axios'
import { API } from '../config'

export default function Settings() {
  const [settings, setSettings] = useState({
    subscriptionDiscountEnabled: false,
    discountPercent: 10,
    whatsappNumber: '',
    whatsappMessage: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axios.get(`${API}/site-settings`)
      .then(res => {
        if (res.data) setSettings(res.data)
      })
      .catch(err => console.error(err))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await axios.put(`${API}/site-settings`, settings)
      alert('Settings saved successfully!')
    } catch (err) {
      alert('Error saving settings')
    }
    setSaving(false)
  }

  return (
    <>
      <h1 className="page-title">Site Settings</h1>
      <p className="page-subtitle">Manage global configuration</p>
      
      <div className="table-container" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          
          <h3 style={{ marginBottom: 16, color: 'var(--gold)' }}>WhatsApp Integration</h3>
          <div className="form-group">
            <label className="form-label">WhatsApp Number (with country code, e.g. 15135550123)</label>
            <input className="form-input" value={settings.whatsappNumber || ''} onChange={e => setSettings({...settings, whatsappNumber: e.target.value})} placeholder="15135550123" />
          </div>
          <div className="form-group">
            <label className="form-label">Default Message</label>
            <input className="form-input" value={settings.whatsappMessage || ''} onChange={e => setSettings({...settings, whatsappMessage: e.target.value})} placeholder="Hi, I'm interested in..." />
          </div>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h3 style={{ marginBottom: 16, color: 'var(--gold)' }}>Newsletter & Discounts</h3>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" checked={settings.subscriptionDiscountEnabled} onChange={e => setSettings({...settings, subscriptionDiscountEnabled: e.target.checked})} id="discountToggle" />
            <label htmlFor="discountToggle" style={{ cursor: 'pointer' }}>Enable Subscription Discount</label>
          </div>
          {settings.subscriptionDiscountEnabled && (
            <div className="form-group">
              <label className="form-label">Discount Percentage (%)</label>
              <input className="form-input" type="number" value={settings.discountPercent} onChange={e => setSettings({...settings, discountPercent: e.target.value})} min="1" max="100" />
            </div>
          )}

          <div style={{ marginTop: 30 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
