import {
  getMembers,
  getGuardians,
  getRegistrations,
  getTeams,
} from '../data/store.js'
import { isJunior } from '../data/domain.js'
import config from '../config/config.js'

export default function Dashboard({ onNavigate }) {
  const members = getMembers()
  const guardians = getGuardians()
  const registrations = getRegistrations({ season: config.currentSeason })
  const teams = getTeams({ season: config.currentSeason })

  const juniors = members.filter(isJunior).length
  const seniors = members.length - juniors
  const complete = registrations.filter((r) => r.status === 'complete').length
  const started = registrations.filter((r) => r.status === 'started').length

  // Totals by age group (for the club president).
  const byAgeGroup = registrations.reduce((acc, r) => {
    acc[r.ageGroup || 'Unknown'] = (acc[r.ageGroup || 'Unknown'] || 0) + 1
    return acc
  }, {})

  return (
    <div className="dashboard">
      <h2>Season {config.currentSeason} at a glance</h2>
      <div className="dashboard__cards">
        <div className="card">
          <div className="card__value">{members.length}</div>
          <div className="card__label">Members ({juniors} juniors / {seniors} seniors)</div>
        </div>
        <div className="card">
          <div className="card__value">{registrations.length}</div>
          <div className="card__label">Registrations ({complete} complete, {started} started)</div>
        </div>
        <div className="card">
          <div className="card__value">{teams.length}</div>
          <div className="card__label">Teams this season</div>
        </div>
        <div className="card">
          <div className="card__value">{guardians.length}</div>
          <div className="card__label">Guardian records</div>
        </div>
      </div>

      <h3>Registrations by age group</h3>
      <div className="dashboard__agegroups">
        {Object.entries(byAgeGroup).length === 0 && <p>No registrations yet.</p>}
        {Object.entries(byAgeGroup)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([group, count]) => (
            <span key={group} className="chip">
              {group}: {count}
            </span>
          ))}
      </div>

      <div className="dashboard__actions">
        <button type="button" className="btn" onClick={() => onNavigate('members')}>
          Manage members
        </button>
        <button type="button" className="btn" onClick={() => onNavigate('registrations')}>
          Manage registrations
        </button>
        <button type="button" className="btn" onClick={() => onNavigate('teams')}>
          Build team rosters
        </button>
      </div>
    </div>
  )
}
