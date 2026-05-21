import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../services/authService'

function Sidebar() {
  const navigate = useNavigate()
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/clientes', label: 'Clientes', icon: 'clients' },
    { to: '/categorias', label: 'Categorias', icon: 'categories' },
    { to: '/servicos', label: 'Serviços', icon: 'services' },
    { to: '/orcamentos', label: 'Orçamentos', icon: 'orders' },
    { to: '/ordens', label: 'Ordens', icon: 'orders' }
  ]

  function sair() {
    logout()
    navigate('/')
  }

  return (
    <section className="command-dock">
      <nav className="command-dock-track">
        {links.map((link) => (
          <NavLink to={link.to} className="dock-link" key={link.to}>
            <span className={`sidebar-icon nav-glyph nav-glyph-${link.icon}`} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-action command-exit" onClick={sair}>
        Encerrar Sessão
      </button>
    </section>
  )
}

export default Sidebar
