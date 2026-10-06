import { Music, Sun, Moon } from "lucide-react";

export default function StudioHeader({
  returnToDashboard,
  activeMenu,
  toggleMenu,
  handleNewWorkspace,
  handleNewProject,
  hasWorkspace,
  hasProject,
  setActiveDialog,
  closeMenus,
  handleExportCurrent,
  composition,
  busyAction,
  handleRenameProject,
  handleSave,
  draftId,
  handleSaveAs,
  selectedWorkspace,
  drafts,
  openDraft,
  handleManualCompose,
  handleGenerate,
  handleRefine,
  handleAnalyze,
  provider,
  theme,
  toggleTheme,
  handleLogout
}) {
  return (
    <header className="topbar">
      <div
        className="brand-lockup clickable-brand"
        title="Return to Dashboard"
        onClick={() => { returnToDashboard(); }}
      >
        <div className="brand-mark"><Music size={22} /></div>
        <div>
          <h1>Maestro AI</h1>
          <p>AI composition workstation</p>
        </div>
      </div>
      <nav className="daw-menu" aria-label="Studio navigation">
        <div className="menu-item">
          <button className={activeMenu === "file" ? "active" : ""} onClick={() => toggleMenu("file")}>File</button>
          {activeMenu === "file" && (
            <div className="menu-popover">
              <button onClick={() => { returnToDashboard(); closeMenus(); }}>Dashboard</button>
              <button onClick={handleNewWorkspace}>New Workspace</button>
              <button onClick={handleNewProject} disabled={!hasWorkspace}>New Project</button>
              <button onClick={() => { setActiveDialog("open"); closeMenus(); }}>Open Saved Project</button>
              <button onClick={() => { setActiveDialog("settings"); closeMenus(); }}>Settings</button>
              <span />
              <button onClick={() => handleExportCurrent("/export/wav", "wav")} disabled={!composition || Boolean(busyAction)}>Export Current WAV</button>
              <button onClick={() => { setActiveDialog("export-old"); closeMenus(); }}>Export Old Music</button>
            </div>
          )}
        </div>
        <div className="menu-item">
          <button className={activeMenu === "edit" ? "active" : ""} onClick={() => toggleMenu("edit")}>Edit</button>
          {activeMenu === "edit" && (
            <div className="menu-popover wide">
              <button onClick={() => { setActiveDialog("open"); closeMenus(); }}>Select Old Saved Project</button>
              <button onClick={handleRenameProject} disabled={!hasProject}>Rename Project Title</button>
              <button onClick={handleSave} disabled={!composition || !draftId || Boolean(busyAction)}>Save Current Project</button>
              <button onClick={handleSaveAs} disabled={!composition || !selectedWorkspace || Boolean(busyAction)}>Save As</button>
              <span />
              {drafts.slice(0, 5).map((draft) => (
                <button key={draft.draft_id} onClick={() => { openDraft(draft.draft_id); closeMenus(); }}>
                  {draft.title}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="menu-item">
          <button className={activeMenu === "compose" ? "active" : ""} onClick={() => toggleMenu("compose")}>Compose</button>
          {activeMenu === "compose" && (
            <div className="menu-popover">
              <button onClick={handleManualCompose} disabled={!hasWorkspace || !hasProject || Boolean(busyAction)}>Manual Compose</button>
              <button onClick={handleGenerate} disabled={!hasWorkspace || !hasProject || Boolean(busyAction)}>AI Compose Track</button>
              <button onClick={() => handleRefine("melody")} disabled={!composition || Boolean(busyAction)}>Regenerate Melody</button>
              <button onClick={() => handleRefine("lyrics")} disabled={!composition || Boolean(busyAction)}>Regenerate Lyrics</button>
            </div>
          )}
        </div>
        <div className="menu-item">
          <button className={activeMenu === "arrange" ? "active" : ""} onClick={() => toggleMenu("arrange")}>Arrange</button>
          {activeMenu === "arrange" && (
            <div className="menu-popover">
              <button onClick={() => handleRefine("arrangement")} disabled={!composition || Boolean(busyAction)}>Polish Arrangement</button>
              <button onClick={() => handleRefine("chords")} disabled={!composition || Boolean(busyAction)}>Regenerate Chords</button>
              <button onClick={handleAnalyze} disabled={!composition || Boolean(busyAction)}>Analyze Project</button>
            </div>
          )}
        </div>
      </nav>
      <div className="top-status">
        <span>{provider?.model || "Loading provider"}</span>
        {provider?.architecture && <span>{provider.architecture.replaceAll("_", " ")}</span>}
        {provider?.audio_engine && <span>{provider.audio_engine.replaceAll("_", " ")}</span>}
        <strong className={provider?.api_key_configured ? "ok" : "warn"}>
          {provider?.api_key_configured ? "NIM ready" : "key missing"}
        </strong>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title="Toggle Theme"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--soft)",
            display: "flex",
            alignItems: "center",
            padding: "6px",
            cursor: "pointer",
            marginLeft: "8px",
            marginRight: "8px"
          }}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="status-logout" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}
