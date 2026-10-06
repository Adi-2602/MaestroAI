import { STYLE_OPTIONS } from "../constants/index.js";
import { formatTimestamp } from "../utils/index.js";
import AgentLoadingOverlay from "./AgentLoadingOverlay.jsx";

export default function StudioModals({
  activeDialog,
  setActiveDialog,
  dialogInputText,
  setDialogInputText,
  setDialogTargetItem,
  selectedWorkspace,
  workspaces,
  selectWorkspace,
  selectedProject,
  projects,
  selectProject,
  input,
  setInput,
  handleStyleChange,
  drafts,
  openDraft,
  handleExportDraft,
  busyAction,
  submitCreateWorkspace,
  submitCreateProject,
  submitRenameProject,
  generationProgress
}) {
  if (!activeDialog && !(busyAction === "generate" && generationProgress)) {
    return null;
  }

  return (
    <>
      {activeDialog && (
        <div className="studio-modal-backdrop" onClick={() => { setActiveDialog(""); setDialogInputText(""); setDialogTargetItem(null); }}>
          <section className="studio-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <h2>
                {activeDialog === "settings" && "Workspace Settings"}
                {activeDialog === "open" && "Open Saved Project"}
                {activeDialog === "export-old" && "Export Old Music"}
                {activeDialog === "create-workspace" && "Create Workspace"}
                {activeDialog === "create-project" && "Create Project"}
                {activeDialog === "rename-project" && "Rename Project"}
              </h2>
              <button className="icon-button" onClick={() => { setActiveDialog(""); setDialogInputText(""); setDialogTargetItem(null); }}>x</button>
            </div>

            {activeDialog === "settings" && (
              <div className="settings-grid">
                <label>Workspace Name
                  <select value={selectedWorkspace?.workspace_id || ""} onChange={(event) => {
                    const workspace = workspaces.find((item) => item.workspace_id === event.target.value);
                    if (workspace) selectWorkspace(workspace);
                  }}>
                    <option value="">Create a workspace</option>
                    {workspaces.map((workspace) => <option key={workspace.workspace_id} value={workspace.workspace_id}>{workspace.name}</option>)}
                  </select>
                </label>
                <label>Project Title
                  <select value={selectedProject?.project_id || ""} onChange={(event) => {
                    const project = projects.find((item) => item.project_id === event.target.value);
                    if (project) selectProject(project);
                  }}>
                    <option value="">Create a project</option>
                    {projects.map((project) => <option key={project.project_id} value={project.project_id}>{project.title}</option>)}
                  </select>
                </label>
                <label>Default Style
                  <select value={input.style} onChange={(event) => handleStyleChange(event.target.value)}>
                    {STYLE_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label>Default BPM
                  <input type="number" min="45" max="220" value={input.tempo_bpm} onChange={(event) => setInput({ ...input, tempo_bpm: Number(event.target.value) })} />
                </label>
                <p className="modal-note">Create a workspace first, then a project. Compose and edit actions are enabled only after both exist.</p>
              </div>
            )}

            {activeDialog === "open" && (
              <div className="modal-list">
                {drafts.length === 0 ? (
                  <p className="muted-copy">No saved projects yet.</p>
                ) : (
                  drafts.map((draft) => (
                    <button key={draft.draft_id} onClick={() => { openDraft(draft.draft_id); setActiveDialog(""); }}>
                      <strong>{draft.title}</strong>
                      <span>{draft.style} / {draft.mood} / {formatTimestamp(draft.updated_at)}</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {activeDialog === "export-old" && (
              <div className="modal-list export-old-list">
                {drafts.length === 0 ? (
                  <p className="muted-copy">No old saved music found.</p>
                ) : (
                  drafts.map((draft) => (
                    <div className="old-export-row" key={draft.draft_id}>
                      <div>
                        <strong>{draft.title}</strong>
                        <span>{draft.style} / {draft.mood} / {formatTimestamp(draft.updated_at)}</span>
                      </div>
                      <button onClick={() => handleExportDraft(draft.draft_id, "/export/wav", `${draft.title}.wav`)} disabled={Boolean(busyAction)}>WAV</button>
                      <button onClick={() => handleExportDraft(draft.draft_id, "/export/mp3", `${draft.title}.mp3`)} disabled={Boolean(busyAction)}>MP3</button>
                      <button onClick={() => handleExportDraft(draft.draft_id, "/export/midi", `${draft.title}.mid`)} disabled={Boolean(busyAction)}>MIDI</button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeDialog === "create-workspace" && (
              <form onSubmit={submitCreateWorkspace} className="modal-form">
                <div className="settings-grid">
                  <label style={{ gridColumn: "span 2" }}>Workspace Name
                    <input
                      type="text"
                      autoFocus
                      required
                      placeholder="My Music Workspace"
                      value={dialogInputText}
                      onChange={(e) => setDialogInputText(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: "#101820",
                        border: "1px solid #303c47",
                        color: "#ffffff",
                        borderRadius: "6px",
                        marginTop: "6px"
                      }}
                    />
                  </label>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "12px", borderTop: "1px solid #33404a", background: "#10161c" }}>
                  <button type="button" className="action-btn text" onClick={() => { setActiveDialog(""); setDialogInputText(""); }} style={{ minHeight: "34px", padding: "0 12px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "var(--soft)", borderRadius: "6px" }}>Cancel</button>
                  <button type="submit" className="primary-action-btn" style={{ minHeight: "34px", padding: "0 12px", background: "linear-gradient(135deg, var(--teal), var(--teal-2))", border: "1px solid #82fff7", color: "#061214", borderRadius: "6px", fontWeight: "700" }}>Create</button>
                </div>
              </form>
            )}

            {activeDialog === "create-project" && (
              <form onSubmit={submitCreateProject} className="modal-form">
                <div className="settings-grid">
                  <label style={{ gridColumn: "span 2" }}>Project Title
                    <input
                      type="text"
                      autoFocus
                      required
                      placeholder="New Song Project"
                      value={dialogInputText}
                      onChange={(e) => setDialogInputText(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: "#101820",
                        border: "1px solid #303c47",
                        color: "#ffffff",
                        borderRadius: "6px",
                        marginTop: "6px"
                      }}
                    />
                  </label>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "12px", borderTop: "1px solid #33404a", background: "#10161c" }}>
                  <button type="button" className="action-btn text" onClick={() => { setActiveDialog(""); setDialogInputText(""); }} style={{ minHeight: "34px", padding: "0 12px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "var(--soft)", borderRadius: "6px" }}>Cancel</button>
                  <button type="submit" className="primary-action-btn" style={{ minHeight: "34px", padding: "0 12px", background: "linear-gradient(135deg, var(--teal), var(--teal-2))", border: "1px solid #82fff7", color: "#061214", borderRadius: "6px", fontWeight: "700" }}>Create</button>
                </div>
              </form>
            )}

            {activeDialog === "rename-project" && (
              <form onSubmit={submitRenameProject} className="modal-form">
                <div className="settings-grid">
                  <label style={{ gridColumn: "span 2" }}>New Project Title
                    <input
                      type="text"
                      autoFocus
                      required
                      value={dialogInputText}
                      onChange={(e) => setDialogInputText(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: "#101820",
                        border: "1px solid #303c47",
                        color: "#ffffff",
                        borderRadius: "6px",
                        marginTop: "6px"
                      }}
                    />
                  </label>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "12px", borderTop: "1px solid #33404a", background: "#10161c" }}>
                  <button type="button" className="action-btn text" onClick={() => { setActiveDialog(""); setDialogInputText(""); setDialogTargetItem(null); }} style={{ minHeight: "34px", padding: "0 12px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "var(--soft)", borderRadius: "6px" }}>Cancel</button>
                  <button type="submit" className="primary-action-btn" style={{ minHeight: "34px", padding: "0 12px", background: "linear-gradient(135deg, var(--teal), var(--teal-2))", border: "1px solid #82fff7", color: "#061214", borderRadius: "6px", fontWeight: "700" }}>Rename</button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
      {busyAction === "generate" && generationProgress && (
        <AgentLoadingOverlay progress={generationProgress} />
      )}
    </>
  );
}
