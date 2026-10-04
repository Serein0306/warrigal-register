import { useState } from 'react'

export default function MemberForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    dateOfBirth: initial?.dateOfBirth || '',
    gender: initial?.gender || '',
    school: initial?.school || '',
    phone: initial?.phone || '',
    email: initial?.email || '',
    address: initial?.address || '',
    medicalNotes: initial?.medicalNotes || '',
  })

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.dateOfBirth) return
    onSave(form)
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>{initial ? 'Edit member' : 'Add member'}</h3>
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
          <span>Date of birth *</span>
          <input
            className="input"
            type="date"
            required
            value={form.dateOfBirth}
            onChange={(e) => set('dateOfBirth', e.target.value)}
          />
        </label>
        <label className="field">
          <span>Gender</span>
          <select
            className="input"
            value={form.gender}
            onChange={(e) => set('gender', e.target.value)}
          >
            <option value="">—</option>
            <option value="M">M</option>
            <option value="F">F</option>
            <option value="X">X</option>
          </select>
        </label>
        <label className="field">
          <span>School</span>
          <input
            className="input"
            value={form.school}
            onChange={(e) => set('school', e.target.value)}
          />
        </label>
        <label className="field">
          <span>Phone</span>
          <input
            className="input"
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
          <span>Medical notes / allergies</span>
          <textarea
            className="input"
            rows="2"
            value={form.medicalNotes}
            onChange={(e) => set('medicalNotes', e.target.value)}
          />
        </label>
      </div>
      <div className="form__actions">
        <button type="submit" className="btn btn--primary">
          Save member
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
