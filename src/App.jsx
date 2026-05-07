import { useMemo, useState } from 'react';
import VerticalOrgChart from './components/VerticalOrgChart';
import { orgData, portfolioProjects } from './data/mockData';

function flattenNames(node, result = []) {
  result.push(node.name);
  node.children?.forEach((child) => flattenNames(child, result));
  return result;
}

function countNodes(node) {
  return 1 + (node.children?.reduce((sum, child) => sum + countNodes(child), 0) ?? 0);
}

const portfolioSummary = {
  owner: '林清和',
  projectCount: portfolioProjects.length,
  totalHeadcount: portfolioProjects.reduce((sum, item) => sum + item.teamSize, 0),
  riskProjects: portfolioProjects.filter((item) => item.status === '风险').length,
  focusProjects: portfolioProjects.filter((item) => item.status === '关注').length,
  normalProjects: portfolioProjects.filter((item) => item.status === '正常').length
};

export default function App() {
  const [activeView, setActiveView] = useState('org');
  const allNodeNames = useMemo(() => flattenNames(orgData, []), []);
  const [collapsedMap, setCollapsedMap] = useState({});

  const setNodesCollapsed = (names, collapsed) => {
    setCollapsedMap((prev) => {
      const next = { ...prev };
      names.forEach((name) => {
        next[name] = collapsed;
      });
      return next;
    });
  };

  const toggleNode = (name, collapsed) => {
    setCollapsedMap((prev) => ({ ...prev, [name]: collapsed }));
  };

  const expandAll = () => setNodesCollapsed(allNodeNames, false);
  const collapseAll = () => setNodesCollapsed(orgData.children.map((item) => item.name), true);

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Portfolio Project Management</p>
          <h1>多项目管理系统</h1>
        </div>
        <div className="topbar-meta">
          <div className="sidebar-card compact-card">
            <span>业务负责人</span>
            <strong>{portfolioSummary.owner}</strong>
            <small>统筹 {portfolioSummary.projectCount} 个项目</small>
          </div>
        </div>
      </header>

      <nav className="top-tabs" aria-label="页面切换">
        <button className={`top-tab ${activeView === 'org' ? 'active' : ''}`} onClick={() => setActiveView('org')}>项目组织架构</button>
        <button className={`top-tab ${activeView === 'project' ? 'active' : ''}`} onClick={() => setActiveView('project')}>多项目进展追踪</button>
      </nav>

      <main className="main-content top-layout">
        {activeView === 'org' && (
          <section className="view-panel active">
            <header className="page-header sheet-header board-header">
              <div>
                <p className="eyebrow">Page 01</p>
                <h2>纵向树状组织架构</h2>
                <p>按业务负责人、项目、角色组的三层结构纵向展示，贴近组织架构看板风格。</p>
              </div>
            </header>

            <section className="board-toolbar">
              <div className="toolbar-group">
                <button className="tool-btn muted">↶ 撤销</button>
                <button className="tool-btn muted">↷ 重做</button>
                <button className="tool-btn" onClick={collapseAll}>− 缩小层级</button>
                <button className="tool-btn">100%</button>
                <button className="tool-btn" onClick={expandAll}>＋ 展开层级</button>
                <button className="tool-btn">⟲ 复位</button>
              </div>
              <div className="toolbar-group">
                <button className="tool-btn">▣ 适配全图</button>
                <button className="tool-btn">◔ 隐藏职级</button>
                <button className="tool-btn">⇅ 隐藏序列</button>
                <button className="tool-btn">🖼 导出PNG</button>
                <button className="tool-btn">🔗 分享链接</button>
                <button className="tool-btn primary-lite">重置默认</button>
              </div>
            </section>

            <section className="summary-grid compact-summary">
              <article className="summary-card"><span>项目数量</span><strong>{portfolioSummary.projectCount}</strong></article>
              <article className="summary-card"><span>总投入人数</span><strong>{portfolioSummary.totalHeadcount}</strong></article>
              <article className="summary-card"><span>组织节点</span><strong>{countNodes(orgData)}</strong></article>
            </section>

            <section className="org-canvas-board">
              <VerticalOrgChart data={orgData} collapsedMap={collapsedMap} onToggle={toggleNode} />
            </section>
          </section>
        )}

        {activeView === 'project' && (
          <section className="view-panel active">
            <header className="page-header">
              <div>
                <p className="eyebrow">Page 02</p>
                <h2>20 个项目进展追踪</h2>
                <p>统一查看项目负责人、进展、状态、周期、立项人与审批人，支持组合判断风险分布。</p>
              </div>
              <div className="header-actions header-actions-wrap">
                <div className="status-pill running">正常 {portfolioSummary.normalProjects} · 关注 {portfolioSummary.focusProjects} · 风险 {portfolioSummary.riskProjects}</div>
              </div>
            </header>

            <section className="summary-grid compact-summary">
              <article className="summary-card"><span>正常项目</span><strong>{portfolioSummary.normalProjects}</strong></article>
              <article className="summary-card"><span>关注项目</span><strong>{portfolioSummary.focusProjects}</strong></article>
              <article className="summary-card"><span>风险项目</span><strong>{portfolioSummary.riskProjects}</strong></article>
            </section>

            <section className="sheet-board project-sheet-board">
              <table className="org-table project-table portfolio-table">
                <thead>
                  <tr>
                    <th>项目编号</th>
                    <th>项目名称</th>
                    <th>项目负责人</th>
                    <th>团队规模</th>
                    <th>当前阶段</th>
                    <th>项目进度</th>
                    <th>项目状态</th>
                    <th>项目周期</th>
                    <th>立项人</th>
                    <th>审批人</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioProjects.map((project) => (
                    <tr key={project.code}>
                      <td className="org-cell">{project.code}</td>
                      <td className="org-cell"><strong>{project.name}</strong></td>
                      <td className="org-cell">{project.owner}</td>
                      <td className="org-cell org-number">{project.teamSize}</td>
                      <td className="org-cell">{project.stage}</td>
                      <td className="org-cell org-number">{project.progress}%</td>
                      <td className="org-cell"><span className={`inline-state ${project.status === '正常' ? 'done' : project.status === '关注' ? 'pending' : 'warning'}`}>{project.status}</span></td>
                      <td className="org-cell">{project.period}</td>
                      <td className="org-cell">{project.founder}</td>
                      <td className="org-cell">{project.approver}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </section>
        )}
      </main>
    </div>
  );
}
