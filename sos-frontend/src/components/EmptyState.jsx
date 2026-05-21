function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">+</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

export default EmptyState
