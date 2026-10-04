import { useState } from 'react'
import {
  getRegistrations,
  getMembers,
  addRegistration,
  completeRegistration,
  withdrawRegistration,
  memberName,
} from '../data/store.js'
import config from '../config/config.js'

export default function RegistrationList({ refresh }) {
  const [season, setSeason] = useState(config.currentSeason)
  const [status, setStatus] = useState('all')
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState(null)

  const registrations = getRegistrations({ season, status: status === 'all' ? undefined : status })
  const members = getMembers()

  function flash(text) {
    setMessage(text)
    window.setTimeout(() => setMessage(null), 5000)
  }

  function handleAdd({ memberId, ageGroup }) {
    try {
      addRegistration({ memberId, season, ageGroup })
      flash('Registration created (status: started).')
    } catch (error) {
      flash(error.message)
    }
    setAdding(false)
    refresh()
  }

  function handleComplete(id) {
    const result = completeRegistration(id)
    if (!result.ok) {
      flash(result.reason)
    } else {
      flash('Registration completed.')
    }
    refresh()
  }

  function handleWithdraw(id) {
    withdrawRegistration(id)
    flash('Registration withdrawn; any team placements for the season were removed.')
    refresh()
  }

  return (
    <div className="panel">
      <div className="panel__toolbar">
        <h2>Registrations — {season}</h2>
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
          aria-label="Status filter"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="started">Started</option>
          <option value="complete">Complete</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => (adding ? setAdding(false) : setAdding(true))}
        >
          {adding ? 'Cancel' : '+ New registration'}
        </button>
      </div>

      {message && <p className="notice">{message}</p>}

      {adding && (
        <RegistrationForm members={members} season={season} onSave={handleAdd} onCancel={() => setAdding(false)} />
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Member</th>
            <th>Season</th>
            <th>Age group</th>
            <th>Status</th>
            <th className="table__actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {registrations.length === 0 && (
            <tr>
              <td colSpan="5">No registrations match the filters.</td>
            </tr>
          )}
          {registrations.map((r) => {
            return (
              <tr key={r.id}>
                <td>{memberName(r.memberId)}</td>
                <td>{r.season}</td>
                <td>{r.ageGroup || '—'}</td>
                <td>{r.status}</td>
                <td className="table__actions">
                  {r.status === 'started' && (
                    <>
                      <button
                        type="button"
                        className="btn btn--small btn--primary"
                        onClick={() => handleComplete(r.id)}
                      >
                        Complete
                      </button>
                      <button
                        type="button"
                        className="btn btn--small"
                        onClick={() => handleWithdraw(r.id)}
                      >
                        Withdraw
                      </button>
                    </>
                  )}
                  {r.status === 'complete' && (
                    <button
                      type="button"
                      className="btn btn--small"
                      onClick={() => handleWithdraw(r.id)}
                    >
                      Withdraw
                    </button>
                  )}
                  {r.status === 'withdrawn' && <span className="muted">—</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
