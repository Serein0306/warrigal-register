import { useState } from 'react'

export default function RegistrationForm({ members, season, onSave, onCancel }) {
  const [memberId, setMemberId] = useState('')
  const [ageGroup, setAgeGroup] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (!memberId) return
    onSave({ memberId, ageGroup })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>New registration — {season}</h3>
      <div className="form__grid">
        <label className="field field--wide">
          <span>Member *</span>
          <select className="input" required value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            <option value="">Choose a member…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Age group</span>
          <input
            className="input"
            placeholder="e.g. U13, U8, Senior"
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
          />
        </label>
      </div>
      <div className="form__actions">
        <button type="submit" className="btn btn--primary">
          Create registration
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <p className="panel__hint">
        New registrations start with status &quot;started&quot;. Completing a registration for a
        member under 18 requires at least one linked guardian.
      </p>
    </form>
  )
}
