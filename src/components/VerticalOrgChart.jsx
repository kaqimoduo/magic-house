import { useState } from 'react';

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

function OrgCard({ node, depth, collapsible = false, collapsed = false, onToggle }) {
  const total = countTotal(node);
  const tone = roleColor(node.name, depth);

  return (
    <div className={`org-card tone-${tone} depth-${depth}`}>
      <div className="org-card-top">
        <div className="org-person">
          <div className="org-avatar">{avatarText(node.owner)}</div>
          <div>
            <strong>{node.owner}</strong>
            <p>{node.name}</p>
            <small>{node.sequence}</small>
          </div>
        </div>
        <div className="org-card-actions">
          <button className="card-more-btn">⋯</button>
          {collapsible && (
            <button className="org-collapse-btn" onClick={onToggle}>
              {collapsed ? '+' : '−'}
            </button>
          )}
        </div>
      </div>
      <div className="org-card-bottom">
        <span>{node.role}</span>
        <small>{node.level} · 团队 {node.headcount} 人</small>
      </div>
      <span className="org-badge floating">{total}</span>
    </div>
  );
}

function RoleStack({ roles, color }) {
  const [expanded, setExpanded] = useState(false);
  const visibleRoles = expanded ? roles : roles.slice(0, 3);
  const hiddenCount = Math.max(0, roles.length - 3);

  return (
    <div className={`role-stack tone-${color}`}>
      <div className="role-stack-label">{roles.reduce((sum, role) => sum + role.headcount, 0)} 人</div>
      {visibleRoles.map((role) => (
        <div className="role-stack-item" key={`${role.name}-${role.owner}`}>
          <div className="role-stack-title">
            <div className="role-title-left">
              <span className="role-dot" />
              <strong>{role.owner}</strong>
            </div>
            <button className="card-more-btn subtle">⋯</button>
          </div>
          <div className="role-stack-meta role-stack-meta-block">
            <span>{role.name}</span>
            <small>{role.sequence} · {role.role}</small>
          </div>
        </div>
      ))}
      {hiddenCount > 0 && !expanded && (
        <button className="show-more-btn" onClick={() => setExpanded(true)}>展开其余 {hiddenCount} 个角色组</button>
      )}
      {hiddenCount > 0 && expanded && (
        <button className="show-more-btn" onClick={() => setExpanded(false)}>收起角色组</button>
      )}
    </div>
  );
}

function ProjectBranch({ project, collapsedMap, onToggle }) {
  const collapsed = collapsedMap[project.name] ?? false;
  const hasChildren = project.children && project.children.length > 0;
  const tone = roleColor(project.name, 1);

  return (
    <div className={`project-branch tone-${tone}`}>
      <div className="branch-link vertical" />
      <OrgCard
        node={project}
        depth={1}
        collapsible={hasChildren}
        collapsed={collapsed}
        onToggle={() => onToggle(project.name, !collapsed)}
      />
      {!collapsed && hasChildren && (
        <>
          <div className="branch-link vertical short" />
          <RoleStack roles={project.children} color={tone} />
        </>
      )}
    </div>
  );
}

export default function VerticalOrgChart({ data, collapsedMap, onToggle }) {
  return (
    <div className="vertical-org-board">
      <div className="vertical-org-root">
        <OrgCard node={data} depth={0} />
      </div>
      <div className="root-connector" />
      <div className="project-grid">
        {data.children.map((project) => (
          <ProjectBranch key={project.name} project={project} collapsedMap={collapsedMap} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}
