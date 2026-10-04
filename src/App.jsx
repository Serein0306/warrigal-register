import { useState } from 'react'
import config from './config/config.js'
import Dashboard from './components/Dashboard.jsx'
import MemberList from './components/MemberList.jsx'
import GuardianList from './components/GuardianList.jsx'
import RegistrationList from './components/RegistrationList.jsx'
import TeamList from './components/TeamList.jsx'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'members', label: 'Members' },
  { id: 'guardians', label: 'Guardians' },
  { id: 'registrations', label: 'Registrations' },
  { id: 'teams', label: 'Teams & Rosters' },
]

export default function App() {
  const [tab, setTab] = useState('dashboard')
  // Tick is incremented after every store mutation so views re-read the data.
  const [, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)

  return (
    <main className="app">
      <header className="app__header">
        <h1>{config.appTitle} — Registration &amp; Rosters</h1>
        <p className="app__subtitle">
          One register of members, guardians and registrations; one place where teams are built.
        </p>
      </header>

      <nav className="tabs" role="tablist" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`tabs__tab${tab === t.id ? ' tabs__tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section className="tab-panel">
        {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
        {tab === 'members' && <MemberList refresh={refresh} />}
        {tab === 'guardians' && <GuardianList refresh={refresh} />}
        {tab === 'registrations' && <RegistrationList refresh={refresh} />}
        {tab === 'teams' && <TeamList refresh={refresh} />}
      </section>
    </main>
  )
}
