function Navbar() {
  const usuarioRaw = localStorage.getItem('usuario')
  let usuario

  try {
    usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null
  } catch {
    usuario = null
  }

  const nomeUsuario = usuario?.nome || 'Usuário'
  const iniciais = nomeUsuario
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()

  const agora = new Date()
  const dataFmt = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(agora)
  const horaFmt = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(agora)

  return (
    <header className="command-bar">
      <div className="command-brand">
        <span className="brand-mark">SOS</span>
        <div>
          <span className="topbar-title">Mission Control</span>
          <span className="topbar-subtitle">Operação técnica em tempo real</span>
        </div>
      </div>

      <div className="command-center-meta">
        <span className="meta-chip">{dataFmt}</span>
        <span className="meta-chip">{horaFmt}</span>
        <span className="user-pill">
          <span className="user-avatar">{iniciais || 'U'}</span>
          <span className="text-truncate">{nomeUsuario}</span>
        </span>
      </div>
    </header>
  )
}

export default Navbar
