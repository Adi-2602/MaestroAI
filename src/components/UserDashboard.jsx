import {
  Activity,
  ChevronRight,
  FileMusic,
  FolderPlus,
  History,
  Layers,
  LogOut,
  Moon,
  Music,
  Plus,
  Sun
} from "lucide-react";
import { formatTimestamp } from "../utils/index.js";

export default function UserDashboard({
  session,
  workspaces,
  projects,
  drafts,
  selectedWorkspace,
  selectedProject,
  busyAction,
  onLogout,
  onCreateWorkspace,
  onCreateProject,
  onSelectWorkspace,
  onOpenProject,
  onRenameProject,
  theme,
  onToggleTheme,
  loadingWorkspaces,
  loadingProjects,
  loadingDrafts
}) {
  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark"><Music size={22} /></div>
          <div className="brand-details">
            <h2>Maestro AI</h2>
            <span>Project Dashboard</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <Layers size={18} />
            <span>Dashboard</span>
          </button>
          <button className="nav-item" onClick={onCreateWorkspace} disabled={Boolean(busyAction)}>
            <FolderPlus size={18} />
            <span>New Workspace</span>
          </button>
          <button className="nav-item" onClick={onCreateProject} disabled={!selectedWorkspace || Boolean(busyAction)}>
            <FileMusic size={18} />
            <span>New Project</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-profile">
            <div className="profile-avatar">
              <strong>{(session?.user?.name || "U").slice(0, 1).toUpperCase()}</strong>
            </div>
            <div className="profile-info">
              <h4>{session?.user?.name || "Studio User"}</h4>
              <span>{session?.user?.email || "user@gmail.com"}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout} title="Logout">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="content-header">
          <div className="welcome-block">
            <h1>Welcome back, {session?.user?.name || "Artist"}! 👋</h1>
            <p>Your studio workstation is active. Choose a workspace or start a project below.</p>
          </div>
          <div className="header-status">
            <div className="session-active-badge">
              <Activity size={14} className="pulse-icon" />
              <span>Session Active</span>
            </div>
            <button
              className="dash-theme-toggle"
              onClick={onToggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon workspaces-icon">
              <Layers size={20} />
            </div>
            <div className="stat-data">
              <h3>{workspaces.length}</h3>
              <p>Workspaces</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon projects-icon">
              <FileMusic size={20} />
            </div>
            <div className="stat-data">
              <h3>{selectedWorkspace ? projects.length : 0}</h3>
              <p>Active Projects</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon drafts-icon">
              <History size={20} />
            </div>
            <div className="stat-data">
              <h3>{drafts.length}</h3>
              <p>Saved Drafts</p>
            </div>
          </div>
        </div>

        <div className="main-grid">
          {/* Workspaces Panel */}
          <section className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-title">
                <Layers size={18} />
                <h2>Workspaces</h2>
              </div>
              <button className="panel-action-btn" onClick={onCreateWorkspace} disabled={Boolean(busyAction)}>
                <Plus size={14} /> Create
              </button>
            </div>
            <div className="panel-list">
              {loadingWorkspaces ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="list-card workspace-card skeleton-item">
                    <div className="card-left">
                      <div className="folder-icon skeleton-element placeholder-icon"></div>
                      <div className="card-info">
                        <div className="skeleton-element text-line main-title"></div>
                        <div className="skeleton-element text-line sub-title"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : workspaces.length === 0 ? (
                <div className="empty-state">
                  <p>Create a workspace to start mapping projects.</p>
                </div>
              ) : (
                workspaces.map((workspace) => (
                  <button
                    key={workspace.workspace_id}
                    className={`list-card workspace-card ${workspace.workspace_id === selectedWorkspace?.workspace_id ? "active" : ""}`}
                    onClick={() => onSelectWorkspace(workspace)}
                  >
                    <div className="card-left">
                      <div className="folder-icon"><Layers size={16} /></div>
                      <div className="card-info">
                        <strong>{workspace.name}</strong>
                        <span>{formatTimestamp(workspace.updated_at)}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="chevron-icon" />
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Projects Panel */}
          <section className="dashboard-panel large">
            <div className="panel-header">
              <div className="panel-title">
                <FileMusic size={18} />
                <h2>{selectedWorkspace ? `${selectedWorkspace.name} Projects` : "Projects"}</h2>
              </div>
              <button
                className="panel-action-btn"
                onClick={onCreateProject}
                disabled={!selectedWorkspace || Boolean(busyAction)}
              >
                <Plus size={14} /> Create
              </button>
            </div>
            <div className="panel-list">
              {!selectedWorkspace ? (
                <div className="empty-state">
                  <p>Select or create a workspace first.</p>
                </div>
              ) : loadingProjects ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="list-card project-card skeleton-item">
                    <div className="project-card-left">
                      <div className="music-status-icon skeleton-element placeholder-icon"></div>
                      <div className="card-info">
                        <div className="skeleton-element text-line main-title"></div>
                        <div className="skeleton-element text-line sub-title"></div>
                      </div>
                    </div>
                    <div className="project-actions">
                      <div className="skeleton-element placeholder-button"></div>
                    </div>
                  </div>
                ))
              ) : projects.length === 0 ? (
                <div className="empty-state">
                  <p>Create a project inside this workspace.</p>
                </div>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.project_id}
                    className={`list-card project-card ${project.project_id === selectedProject?.project_id ? "active" : ""}`}
                  >
                    <div className="project-card-left">
                      <div className={`music-status-icon ${project.draft_id ? "has-music" : "empty"}`}>
                        <Music size={16} />
                      </div>
                      <div className="card-info">
                        <strong>{project.title}</strong>
                        <div className="project-meta">
                          <span className={`status-badge ${project.draft_id ? "linked" : "empty"}`}>
                            {project.draft_id ? "Music Linked" : "Empty Project"}
                          </span>
                          <span className="dot">•</span>
                          <span>Updated {formatTimestamp(project.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="project-actions">
                      <button className="action-btn text" onClick={() => onRenameProject(project)}>Rename</button>
                      <button className="primary-action-btn" onClick={() => onOpenProject(project)}>
                        Open Studio <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Recent Drafts */}
        <section className="dashboard-panel history-panel">
          <div className="panel-header">
            <div className="panel-title">
              <History size={18} />
              <h2>Recent Revisions &amp; Drafts</h2>
            </div>
            <span className="drafts-count">{drafts.length} drafts</span>
          </div>
          <div className="history-grid">
            {loadingDrafts ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="history-card skeleton-item">
                  <div className="history-card-header">
                    <div className="skeleton-element placeholder-icon"></div>
                    <div className="skeleton-element placeholder-tag"></div>
                  </div>
                  <div className="skeleton-element text-line main-title"></div>
                  <div className="skeleton-element text-line sub-title"></div>
                </div>
              ))
            ) : drafts.length === 0 ? (
              <div className="empty-state wide">
                <p>No drafts saved yet.</p>
              </div>
            ) : (
              drafts.slice(0, 8).map((draft) => (
                <div key={draft.draft_id} className="history-card">
                  <div className="history-card-header">
                    <Music size={14} />
                    <span className="style-tag">{draft.style}</span>
                    <span className="mood-tag">{draft.mood}</span>
                  </div>
                  <strong>{draft.title}</strong>
                  <span>{formatTimestamp(draft.updated_at)}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
