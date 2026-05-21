import Navbar from './Navbar'
import Sidebar from './Sidebar'

function Layout({ children }) {
  return (
    <div className="mission-shell">
      <div className="mission-ambient mission-ambient-a" />
      <div className="mission-ambient mission-ambient-b" />
      <div className="mission-grid-overlay" />

      <Navbar />
      <Sidebar />

      <main className="mission-main">
        <div className="mission-stage">{children}</div>
      </main>
    </div>
  )
}

export default Layout
