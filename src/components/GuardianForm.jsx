import { useState } from 'react'

export default function GuardianForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    relationship: initial?.relationship || '',
    phone: initial?.phone || '',
    email: initial?.email || '',
    address: initial?.address || '',
    notes: initial?.notes || '',
  })

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim()) return
    onSave(form)
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>{initial ? 'Edit guardian' : 'Add guardian'}</h3>
      <div className="form__grid">
        <label className="field">
          <span>Full name *</span>
          <input
            className="input"
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </label>
        <label className="field">
          <span>Relationship</span>
          <input
            className="input"
            placeholder="e.g. Mother, Father, Grandmother"
            value={form.relationship}
            onChange={(e) => set('relationship', e.target.value)}
          />
        </label>
        <label className="field">
          <span>Mobile *</span>
          <input
            className="input"
            required
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </label>
        <label className="field field--wide">
          <span>Address</span>
          <input
            className="input"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
          />
        </label>
        <label className="field field--wide">
          <span>Notes</span>
          <textarea
            className="input"
            rows="2"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </label>
      </div>
      <div className="form__actions">
        <button type="submit" className="btn btn--primary">
          Save guardian
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
