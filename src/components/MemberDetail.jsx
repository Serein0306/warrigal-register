import { useState } from 'react'
import { getGuardians, guardianName } from '../data/store.js'
import { isJunior, ageGroupLabel } from '../data/domain.js'

export default function MemberDetail({
  member,
  guardianIds,
  history,
  onBack,
  onEdit,
  onToggleActive,
  onLinkGuardian,
  onUnlinkGuardian,
}) {
  const [linkMode, setLinkMode] = useState(false)
  const availableGuardians = getGuardians().filter((g) => !guardianIds.includes(g.id))
  const junior = isJunior(member)

  return (
    <div className="panel">
      <div className="panel__toolbar">
        <button type="button" className="btn" onClick={onBack}>
          ← Back
        </button>
        <h2>{member.name}</h2>
        <span className="chip">{ageGroupLabel(member)}</span>
        <button type="button" className="btn" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="btn btn--small" onClick={onToggleActive}>
          {member.active ? 'Deactivate' : 'Reactivate'}
        </button>
      </div>

      <dl className="details">
        <div>
          <dt>Date of birth</dt>
          <dd>{member.dateOfBirth}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{junior ? 'Junior (under 18)' : 'Senior'} · {member.active ? 'Active' : 'Inactive'}</dd>
        </div>
        <div>
          <dt>Contact</dt>
          <dd>
            {member.phone || '—'} {member.email ? `· ${member.email}` : ''}
          </dd>
        </div>
        <div>
          <dt>School</dt>
          <dd>{member.school || '—'}</dd>
        </div>
        <div>
          <dt>Medical notes</dt>
          <dd>{member.medicalNotes || '—'}</dd>
        </div>
      </dl>

      <h3>Linked guardians {junior ? '(required before registration can be completed)' : ''}</h3>
      <ul className="list">
        {guardianIds.length === 0 && (
          <p className="list__empty">
            {junior
              ? 'No guardian linked. This member cannot complete a registration until at least one guardian is linked.'
              : 'No guardians linked (seniors register in their own right).'}
          </p>
        )}
        {guardianIds.map((id) => (
          <li key={id} className="list__row">
            <span className="list__main">
              <span className="list__title">{guardianName(id)}</span>
            </span>
            <button
              type="button"
              className="btn btn--small"
              onClick={() => onUnlinkGuardian(id)}
            >
              Unlink
            </button>
          </li>
        ))}
      </ul>

      {linkMode && (
        <div className="link-form">
          <select
            className="input"
            aria-label="Select guardian to link"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onLinkGuardian(e.target.value)
                setLinkMode(false)
              }
            }}
          >
            <option value="">Choose a guardian…</option>
            {availableGuardians.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.phone})
              </option>
            ))}
          </select>
          <button type="button" className="btn" onClick={() => setLinkMode(false)}>
            Cancel
          </button>
        </div>
      )}
      {!linkMode && (
        <button type="button" className="btn" onClick={() => setLinkMode(true)}>
          + Link guardian
        </button>
      )}

      <h3>Registration history</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Season</th>
            <th>Age group</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {history.length === 0 && (
            <tr>
              <td colSpan="3">No registrations yet.</td>
            </tr>
          )}
          {history.map((r) => (
            <tr key={r.id}>
              <td>{r.season}</td>
              <td>{r.ageGroup || '—'}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
