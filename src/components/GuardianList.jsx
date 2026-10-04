import { useState } from 'react'
import {
  getGuardians,
  addGuardian,
  updateGuardian,
  getMemberIdsForGuardian,
} from '../data/store.js'
import GuardianForm from './GuardianForm.jsx'
import GuardianDetail from './GuardianDetail.jsx'

export default function GuardianList({ refresh }) {
  const [selectedId, setSelectedId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(false)

  const guardians = getGuardians()

  function handleSave(data, id) {
    if (id) updateGuardian(id, data)
    else addGuardian(data)
    setAdding(false)
    setEditing(false)
    refresh()
  }

  const selected = guardians.find((g) => g.id === selectedId) || null

  if (selected) {
    if (editing) {
      return (
        <GuardianForm
          initial={selected}
          onSave={(data) => handleSave(data, selected.id)}
          onCancel={() => setEditing(false)}
        />
      )
    }
    return (
      <GuardianDetail
        guardian={selected}
        juniors={getMemberIdsForGuardian(selected.id)}
        onBack={() => setSelectedId(null)}
        onEdit={() => setEditing(true)}
      />
    )
  }

  return (
    <div className="panel">
      <div className="panel__toolbar">
        <h2>Guardians</h2>
        <p className="panel__hint">
          A guardian record is held once and linked to every junior they are responsible for.
        </p>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => (adding ? setAdding(false) : setAdding(true))}
        >
          {adding ? 'Cancel' : '+ Add guardian'}
        </button>
      </div>

      {adding && <GuardianForm onSave={handleSave} onCancel={() => setAdding(false)} />}

      <ul className="list">
        {guardians.length === 0 && <p className="list__empty">No guardians yet.</p>}
        {guardians.map((guardian) => (
          <li key={guardian.id} className="list__row">
            <button
              type="button"
              className="list__main"
              onClick={() => {
                setSelectedId(guardian.id)
                setEditing(false)
              }}
            >
              <span className="list__title">{guardian.name}</span>
              <span className="list__meta">
                {guardian.relationship || 'Guardian'} · {guardian.phone} ·{' '}
                {getMemberIdsForGuardian(guardian.id).length} linked{' '}
                {getMemberIdsForGuardian(guardian.id).length === 1 ? 'junior' : 'juniors'}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
