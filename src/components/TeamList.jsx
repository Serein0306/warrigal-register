import { useState } from 'react'
import {
  getTeams,
  addTeam,
  updateTeam,
  removeTeam,
  getMembers,
  getRegistrations,
  getRoster,
  getPlacements,
  addPlayerToTeam,
  movePlayerToTeam,
  removePlayerFromTeam,
} from '../data/store.js'
import config from '../config/config.js'

export default function TeamList({ refresh }) {
  const [season, setSeason] = useState(config.currentSeason)
  const [ageGroup, setAgeGroup] = useState('all')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState(null)

  const teams = getTeams({
    season,
    ageGroup: ageGroup === 'all' ? undefined : ageGroup,
  })

  function flash(text) {
    setMessage(text)
    window.setTimeout(() => setMessage(null), 5000)
  }

  function handleAdd(data) {
    addTeam({ ...data, season })
    setAdding(false)
    refresh()
  }

  function handleRename(id, data) {
    updateTeam(id, data)
    setEditing(null)
    refresh()
  }

  function handleRemove(id) {
    removeTeam(id)
    flash('Team removed. Players and their registrations were not deleted.')
    refresh()
  }

  function handlePlace(teamId, memberId) {
    const result = addPlayerToTeam(teamId, memberId)
    if (!result.ok) flash(result.reason)
    refresh()
  }

  function handleMove(memberId, fromTeamId, toTeamId) {
    const result = movePlayerToTeam(memberId, fromTeamId, toTeamId)
    if (!result.ok) flash(result.reason)
    refresh()
  }

  function handleRemovePlayer(teamId, memberId) {
    removePlayerFromTeam(teamId, memberId)
    refresh()
  }

  return (
    <div className="panel">
      <div className="panel__toolbar">
        <h2>Teams &amp; Rosters — {season}</h2>
        <select
          className="input input--inline"
          aria-label="Season"
          value={season}
          onChange={(e) => setSeason(e.target.value)}
        >
          {['2026', '2025'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="input input--inline"
          aria-label="Age group filter"
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value)}
        >
          <option value="all">All age groups</option>
          <option value="U6">U6</option>
          <option value="U8">U8</option>
          <option value="U10">U10</option>
          <option value="U12">U12</option>
          <option value="U13">U13</option>
          <option value="U14">U14</option>
          <option value="U16">U16</option>
          <option value="U18">U18</option>
          <option value="Senior">Senior</option>
        </select>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => (adding ? setAdding(false) : setAdding(true))}
        >
          {adding ? 'Cancel' : '+ Create team'}
        </button>
      </div>

      {message && <p className="notice">{message}</p>}

      {adding && (
        <TeamForm
          onSave={handleAdd}
          onCancel={() => setAdding(false)}
        />
      )}

      {teams.length === 0 && <p className="list__empty">No teams for this season and age group.</p>}

      {teams.map((team) => (
        <RosterCard
          key={team.id}
          team={team}
          season={season}
          teams={teams}
          editing={editing === team.id}
          onEdit={() => setEditing(team.id)}
          onCancelEdit={() => setEditing(null)}
          onRename={(data) => handleRename(team.id, data)}
          onRemove={() => handleRemove(team.id)}
          onPlace={(memberId) => handlePlace(team.id, memberId)}
          onMove={(memberId, toTeamId) => handleMove(memberId, team.id, toTeamId)}
          onRemovePlayer={(memberId) => handleRemovePlayer(team.id, memberId)}
        />
      ))}
    </div>
  )
}

function TeamForm({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const [ageGroup, setAgeGroup] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) return
    onSave({ name, ageGroup })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>Create team</h3>
      <div className="form__grid">
        <label className="field">
          <span>Team name *</span>
          <input
            className="input"
            required
            placeholder="e.g. U13G Navy"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Age group</span>
          <input
            className="input"
            placeholder="e.g. U13"
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
          />
        </label>
      </div>
      <div className="form__actions">
        <button type="submit" className="btn btn--primary">
          Create team
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function RosterCard({
  team,
  season,
  teams,
  editing,
  onEdit,
  onCancelEdit,
  onRename,
  onRemove,
  onPlace,
  onMove,
  onRemovePlayer,
}) {
  const { rows } = getRoster(team.id)
  const placedIds = getPlacements(team.id).map((p) => p.memberId)
  const completeForSeason = getRegistrations({ season: team.season, status: 'complete' }).map(
    (r) => r.memberId,
  )
  const availablePlayers = getMembers().filter(
    (m) => m.active && !placedIds.includes(m.id) && completeForSeason.includes(m.id),
  )

  if (editing) {
    return (
      <div className="roster">
        <TeamForm
          initial={{ name: team.name, ageGroup: team.ageGroup }}
          onSave={onRename}
          onCancel={onCancelEdit}
        />
      </div>
    )
  }

  return (
    <div className="roster">
      <div className="roster__header">
        <h3>
          {team.name} <span className="chip">{team.ageGroup || '—'}</span>{' '}
          <span className="chip">{rows.length} players</span>
        </h3>
        <div className="roster__actions">
          <button type="button" className="btn btn--small" onClick={onEdit}>
            Rename
          </button>
          <button type="button" className="btn btn--small" onClick={onRemove}>
            Remove team
          </button>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>DOB</th>
            <th>Contact</th>
            <th className="table__actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan="5">Empty roster — add a registered player below.</td>
            </tr>
          )}
          {rows.map((row, index) => (
            <tr key={row.member.id}>
              <td>{index + 1}</td>
              <td>{row.member.name}</td>
              <td>{row.member.dateOfBirth}</td>
              <td>
                {row.contact.name} · {row.contact.phone}
              </td>
              <td className="table__actions">
                <select
                  className="input input--inline"
                  aria-label={`Move ${row.member.name}`}
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onMove(row.member.id, e.target.value)
                      e.target.value = ''
                    }
                  }}
                >
                  <option value="">Move to…</option>
                  {teams
                    .filter((t) => t.id !== team.id && t.season === season)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={() => onRemovePlayer(row.member.id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="roster__add">
        <select
          className="input"
          aria-label={`Add player to ${team.name}`}
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              onPlace(e.target.value)
              e.target.value = ''
            }
          }}
        >
          <option value="">Add a registered player…</option>
          {availablePlayers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <p className="panel__hint">
          Only players with a complete {season} registration can be placed.
        </p>
      </div>
    </div>
  )
}
