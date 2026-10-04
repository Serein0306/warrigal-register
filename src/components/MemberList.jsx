import { useMemo, useState } from 'react'
import {
  findMembers,
  addMember,
  updateMember,
  setMemberActive,
  getGuardianIdsForMember,
  getMemberRegistrationHistory,
  linkGuardianToMember,
  unlinkGuardianFromMember,
} from '../data/store.js'
import { isJunior, ageGroupLabel } from '../data/domain.js'
import MemberForm from './MemberForm.jsx'
import MemberDetail from './MemberDetail.jsx'

export default function MemberList({ refresh }) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(false)

  const members = useMemo(() => findMembers(query), [query])

  function handleSave(data, id) {
    if (id) updateMember(id, data)
    else addMember(data)
    setAdding(false)
    setEditing(false)
    refresh()
  }

  function handleToggleActive(member) {
    setMemberActive(member.id, !member.active)
    refresh()
  }

  const selected = members.find((m) => m.id === selectedId) || null

  if (selected) {
    if (editing) {
      return (
        <MemberForm
          initial={selected}
          onSave={(data) => handleSave(data, selected.id)}
          onCancel={() => setEditing(false)}
        />
      )
    }
    return (
      <MemberDetail
        member={selected}
        guardianIds={getGuardianIdsForMember(selected.id)}
        history={getMemberRegistrationHistory(selected.id)}
        onBack={() => setSelectedId(null)}
        onEdit={() => setEditing(true)}
        onToggleActive={() => handleToggleActive(selected)}
        onLinkGuardian={(guardianId) => {
          linkGuardianToMember(selected.id, guardianId)
          refresh()
        }}
        onUnlinkGuardian={(guardianId) => {
          unlinkGuardianFromMember(selected.id, guardianId)
          refresh()
        }}
      />
    )
  }

  return (
    <div className="panel">
      <div className="panel__toolbar">
        <h2>Members</h2>
        <input
          className="input input--search"
          type="search"
          placeholder="Search members by name…"
          value={query}
          aria-label="Search members"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => (adding ? setAdding(false) : setAdding(true))}
        >
          {adding ? 'Cancel' : '+ Add member'}
        </button>
      </div>

      {adding && (
        <MemberForm
          onSave={(data) => handleSave(data)}
          onCancel={() => setAdding(false)}
        />
      )}

      <ul className="list">
        {members.length === 0 && <p className="list__empty">No members match that search.</p>}
        {members.map((member) => (
          <li key={member.id} className="list__row">
            <button
              type="button"
              className="list__main"
              onClick={() => {
                setSelectedId(member.id)
                setEditing(false)
              }}
            >
              <span className="list__title">{member.name}</span>
              <span className="list__meta">
                DOB {member.dateOfBirth} · {ageGroupLabel(member)} ·{' '}
                {isJunior(member) ? 'Junior' : 'Senior'}
                {!member.active ? ' · Inactive' : ''}
              </span>
            </button>
            <button
              type="button"
              className="btn btn--small"
              onClick={() => handleToggleActive(member)}
            >
              {member.active ? 'Deactivate' : 'Reactivate'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
