function SideDrawer({ children, open, title, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <aside className="drawer-panel" aria-label={title} onClick={(event) => event.stopPropagation()}>
        {children}
      </aside>
    </div>
  );
}

export default SideDrawer;
