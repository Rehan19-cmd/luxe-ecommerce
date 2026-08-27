import { useState, useEffect } from 'react'
import axios from 'axios'
import { API } from '../config'

export default function Settings() {
  const [settings, setSettings] = useState({
    subscriptionDiscountEnabled: false,
    discountPercent: 10,
    whatsappNumber: '',
    whatsappNumber2: '',
    whatsappNumber3: '',
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
            <label className="form-label">WhatsApp Number 1 (with country code, e.g. 15135550123)</label>
            <input className="form-input" value={settings.whatsappNumber || ''} onChange={e => setSettings({...settings, whatsappNumber: e.target.value})} placeholder="15135550123" />
          </div>
          <div className="form-group">
            <label className="form-label">WhatsApp Number 2 (optional)</label>
            <input className="form-input" value={settings.whatsappNumber2 || ''} onChange={e => setSettings({...settings, whatsappNumber2: e.target.value})} placeholder="15135550124" />
          </div>
          <div className="form-group">
            <label className="form-label">WhatsApp Number 3 (optional)</label>
            <input className="form-input" value={settings.whatsappNumber3 || ''} onChange={e => setSettings({...settings, whatsappNumber3: e.target.value})} placeholder="15135550125" />
          </div>
          <p style={{ fontSize: 12, color: 'var(--gray-light, #999)', marginTop: -8, marginBottom: 16 }}>
            When a visitor clicks "Chat on WhatsApp", a pre-filled chat opens for each number entered above.
          </p>
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
