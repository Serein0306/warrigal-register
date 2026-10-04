import { memberName } from '../data/store.js'

export default function GuardianDetail({ guardian, juniors, onBack, onEdit }) {
  return (
    <div className="panel">
      <div className="panel__toolbar">
        <button type="button" className="btn" onClick={onBack}>
          ← Back
        </button>
        <h2>{guardian.name}</h2>
        <button type="button" className="btn" onClick={onEdit}>
          Edit
        </button>
      </div>

      <dl className="details">
        <div>
          <dt>Relationship</dt>
          <dd>{guardian.relationship || '—'}</dd>
        </div>
        <div>
          <dt>Mobile</dt>
          <dd>{guardian.phone}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{guardian.email || '—'}</dd>
        </div>
        <div>
          <dt>Address</dt>
          <dd>{guardian.address || '—'}</dd>
        </div>
        <div>
          <dt>Notes</dt>
          <dd>{guardian.notes || '—'}</dd>
        </div>
      </dl>

      <h3>Linked juniors</h3>
      <ul className="list">
        {juniors.length === 0 && <p className="list__empty">No juniors linked to this guardian.</p>}
        {juniors.map((id) => (
          <li key={id} className="list__row">
            <span className="list__title">{memberName(id)}</span>
          </li>
        ))}
      </ul>
      <p className="panel__hint">
        Updating this guardian&apos;s mobile updates it for every linked junior at once.
      </p>
    </div>
  )
}
