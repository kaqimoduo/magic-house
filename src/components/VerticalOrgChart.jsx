import { useRef, useState } from 'react';

function roleColor(name, depth) {
  if (depth === 0) return 'blue';
  if (depth === 1) {
    const colors = ['green', 'blue', 'purple', 'orange'];
    const hash = Array.from(name).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }
  return 'light';
}

function avatarText(name) {
  return name.slice(0, 1);
}

function countTotal(node) {
  return node.headcount + (node.children?.reduce((sum, child) => sum + countTotal(child), 0) ?? 0);
}

function EditableMeta({ node, path, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draftRole, setDraftRole] = useState(node.role);
  const [draftSequence, setDraftSequence] = useState(node.sequence);

  const save = () => {
    onUpdate(path, { role: draftRole, sequence: draftSequence });
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="org-card-bottom editable-meta" onDoubleClick={() => setEditing(true)}>
        <span>{node.role}</span>
        <small>{node.sequence} · {node.level} · 团队 {node.headcount} 人</small>
      </div>
    );
  }

  return (
    <div className="org-card-bottom editable-form">
      <input value={draftRole} onChange={(e) => setDraftRole(e.target.value)} placeholder="职位名称" />
      <input value={draftSequence} onChange={(e) => setDraftSequence(e.target.value)} placeholder="序列" />
      <div className="edit-actions">
        <button className="mini-btn" onClick={() => setEditing(false)}>取消</button>
        <button className="mini-btn primary" onClick={save}>保存</button>
      </div>
    </div>
  );
}

function OrgCard({ node, depth, path, collapsed = false, onToggle, onUpdate }) {
  const total = countTotal(node);
  const tone = roleColor(node.name, depth);
  const hasChildren = !!node.children?.length;

  return (
    <div className={`org-card tone-${tone} depth-${depth}`}>
      <div className="org-card-top">
        <div className="org-person">
          <div className="org-avatar">{avatarText(node.owner)}</div>
          <div>
            <strong>{node.owner}</strong>
            <p>{node.name}</p>
            <small>{node.level}</small>
          </div>
        </div>
        <div className="org-card-actions">
          <button className="card-more-btn">⋯</button>
          {hasChildren && (
            <button className="org-collapse-btn" onClick={() => onToggle(path)}>
              {collapsed ? '+' : '−'}
            </button>
          )}
        </div>
      </div>
      <EditableMeta node={node} path={path} onUpdate={onUpdate} />
      <span className="org-badge floating">{total}</span>
    </div>
  );
}

function RoleNode({ node, path, collapsedMap, onToggle, onUpdate }) {
  const collapsed = collapsedMap[path] ?? false;
  const hasChildren = !!node.children?.length;

  return (
    <div className="role-node-wrap">
      <OrgCard node={node} depth={2} path={path} collapsed={collapsed} onToggle={onToggle} onUpdate={onUpdate} />
      {!collapsed && hasChildren && (
        <div className="role-children">
          {node.children.map((child, index) => (
            <RoleNode
              key={`${child.name}-${child.owner}-${index}`}
              node={child}
              path={`${path}.children.${index}`}
              collapsedMap={collapsedMap}
              onToggle={onToggle}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectBranch({ project, index, collapsedMap, onToggle, onUpdate }) {
  const path = `children.${index}`;
  const collapsed = collapsedMap[path] ?? false;
  const hasChildren = !!project.children?.length;

  return (
    <div className="project-branch">
      <div className="branch-link vertical" />
      <OrgCard node={project} depth={1} path={path} collapsed={collapsed} onToggle={onToggle} onUpdate={onUpdate} />
      {!collapsed && hasChildren && (
        <>
          <div className="branch-link vertical short" />
          <div className="role-stack clean-stack">
            {project.children.map((role, roleIndex) => (
              <RoleNode
                key={`${role.name}-${role.owner}-${roleIndex}`}
                node={role}
                path={`${path}.children.${roleIndex}`}
                collapsedMap={collapsedMap}
                onToggle={onToggle}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function VerticalOrgChart({ data, collapsedMap, onToggle, onUpdate, zoom, zoomOrigin, onWheelZoom, pan, onPanChange }) {
  const rootCollapsed = collapsedMap.root ?? false;
  const boardRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 });

  const handleWheel = (event) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    onWheelZoom(event.deltaY, { x, y });
  };

  const handlePointerDown = (event) => {
    if (event.target.closest('button, input')) return;
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      baseX: pan.x,
      baseY: pan.y
    };
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current.active) return;
    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;
    onPanChange({ x: dragRef.current.baseX + deltaX, y: dragRef.current.baseY + deltaY });
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  return (
    <div
      ref={boardRef}
      className="vertical-org-board zoomable pannable"
      style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="vertical-org-root">
        <OrgCard node={data} depth={0} path="root" collapsed={rootCollapsed} onToggle={onToggle} onUpdate={onUpdate} />
      </div>
      {!rootCollapsed && (
        <>
          <div className="root-connector" />
          <div className="project-grid simple-grid">
            {data.children.map((project, index) => (
              <ProjectBranch
                key={project.name}
                project={project}
                index={index}
                collapsedMap={collapsedMap}
                onToggle={onToggle}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
