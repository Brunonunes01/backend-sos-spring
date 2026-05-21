function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="page-heading signal-header">
      <div className="signal-title-wrap">
        {eyebrow && <div className="page-kicker signal-kicker">{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-subtitle">{description}</p>}
      </div>

      {actions && <div className="page-actions">{actions}</div>}
    </div>
  )
}

export default PageHeader
