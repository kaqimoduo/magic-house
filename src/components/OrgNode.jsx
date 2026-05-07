function countTotal(node) {
  return node.headcount + (node.children?.reduce((sum, child) => sum + countTotal(child), 0) ?? 0);
}

export default function OrgNode({ node, depth = 0, collapsedMap, onToggle }) {
  const hasChildren = node.children && node.children.length > 0;
  const collapsed = collapsedMap[node.name] ?? false;
  const subtotal = countTotal(node);

  const handleToggle = () => {
    if (hasChildren) onToggle(node.name, !collapsed);
  };

  return (
    <>
      <tr className={`org-row depth-${depth} ${hasChildren ? 'group-row' : ''}`}>
        <td className="org-cell org-name-cell">
          <div className="org-name-wrap" style={{ paddingLeft: `${depth * 22 + 8}px` }}>
            <button className={`table-toggle ${!hasChildren ? 'hidden' : ''}`} onClick={handleToggle}>
              {hasChildren ? (collapsed ? '+' : '−') : ''}
            </button>
            <span className={`node-type ${hasChildren ? 'folder' : 'leaf'}`} />
            <strong>{node.name}</strong>
          </div>
        </td>
        <td className="org-cell">{node.owner}</td>
        <td className="org-cell org-number">{node.headcount}</td>
        <td className="org-cell">{node.level}</td>
        <td className="org-cell">{node.sequence}</td>
        <td className="org-cell">{node.role}</td>
      </tr>
      {!collapsed && hasChildren && node.children.map((child) => (
        <OrgNode key={child.name} node={child} depth={depth + 1} collapsedMap={collapsedMap} onToggle={onToggle} />
      ))}
      {hasChildren && !collapsed && (
        <tr className="subtotal-row">
          <td className="org-cell subtotal-label" colSpan={2}>{node.name} 小计</td>
          <td className="org-cell org-number subtotal-value">{subtotal}</td>
          <td className="org-cell" colSpan={3}></td>
        </tr>
      )}
    </>
  );
}
