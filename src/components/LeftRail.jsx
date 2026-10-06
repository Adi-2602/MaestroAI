import {
  Layers,
  FileMusic,
  SlidersHorizontal,
  Loader2,
  Wand2,
  History,
  RefreshCw,
  Activity,
  Sparkles,
  Gauge
} from "lucide-react";
import { STYLE_OPTIONS, MOOD_OPTIONS, MAJOR_KEY_OPTIONS, MINOR_KEY_OPTIONS, AGENTS } from "../constants/index.js";
import { formatTimestamp } from "../utils/index.js";

export default function LeftRail({
  activeBrowserTab,
  setActiveBrowserTab,
  session,
  workspaceName,
  projectName,
  workspaces,
  handleNewWorkspace,
  busyAction,
  selectedWorkspace,
  selectWorkspace,
  projects,
  handleNewProject,
  hasWorkspace,
  selectedProject,
  selectProject,
  input,
  setInput,
  handleStyleChange,
  handleGenerate,
  hasProject,
  drafts,
  refreshDrafts,
  draftId,
  openDraft,
  composition,
  handleManualCompose,
  handleRefine,
  generationProgress,
  provider,
  handleAnalyze
}) {
  return (
    <aside className="left-rail">
      <div className="browser-tabs" aria-label="Project browser sections">
        <button
          className={activeBrowserTab === "browser" ? "active" : ""}
          onClick={() => setActiveBrowserTab("browser")}
        >
          Browser
        </button>
        <button
          className={activeBrowserTab === "clips" ? "active" : ""}
          onClick={() => setActiveBrowserTab("clips")}
        >
          Clips
        </button>
        <button
          className={activeBrowserTab === "agents" ? "active" : ""}
          onClick={() => setActiveBrowserTab("agents")}
        >
          Agents
        </button>
      </div>
      <div className="project-context">
        <span>User</span>
        <strong>{session?.user?.name || "Logged in"}</strong>
        <span>Workspace</span>
        <strong>{workspaceName || "Create one from File"}</strong>
        <span>Project</span>
        <strong>{projectName || "Create one before composing"}</strong>
      </div>
      {activeBrowserTab === "browser" && (
        <>
          <div className="tool-card workspace-browser">
            <div className="card-heading">
              <span><Layers size={16} /> Workspaces</span>
              <button className="icon-button" onClick={handleNewWorkspace} disabled={Boolean(busyAction)} title="New workspace">+</button>
            </div>
            <div className="mini-list">
              {workspaces.length === 0 ? (
                <p>Create your first workspace.</p>
              ) : (
                workspaces.map((workspace) => (
                  <button
                    key={workspace.workspace_id}
                    className={workspace.workspace_id === selectedWorkspace?.workspace_id ? "active" : ""}
                    onClick={() => selectWorkspace(workspace)}
                  >
                    {workspace.name}
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="tool-card workspace-browser">
            <div className="card-heading">
              <span><FileMusic size={16} /> Projects</span>
              <button className="icon-button" onClick={handleNewProject} disabled={!hasWorkspace || Boolean(busyAction)} title="New project">+</button>
            </div>
            <div className="mini-list">
              {!hasWorkspace ? (
                <p>Select a workspace first.</p>
              ) : projects.length === 0 ? (
                <p>Create a project inside this workspace.</p>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.project_id}
                    className={project.project_id === selectedProject?.project_id ? "active" : ""}
                    onClick={() => selectProject(project)}
                  >
                    <strong>{project.title}</strong>
                    <span>{project.draft_id ? "music linked" : "empty project"}</span>
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="tool-card">
            <div className="card-heading"><SlidersHorizontal size={16} /> Composer Engine</div>
            <label>Style
              <select value={input.style} onChange={(event) => handleStyleChange(event.target.value)}>
                {STYLE_OPTIONS.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label>Mood
              <select value={input.mood} onChange={(event) => setInput({ ...input, mood: event.target.value })}>
                {MOOD_OPTIONS.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label>Theme
              <textarea rows="4" value={input.theme} onChange={(event) => setInput({ ...input, theme: event.target.value })} />
            </label>
            <label>Custom Lyrics (Optional)
              <textarea rows="3" placeholder="Enter your own lyrics..." value={input.custom_lyrics || ""} onChange={(event) => setInput({ ...input, custom_lyrics: event.target.value })} />
            </label>
            <div className="key-selector-group">
              <label className={`key-label major-label ${input.key.endsWith("major") ? "active" : ""}`}>
                <span className={`key-mode-tag major-tag ${input.key.endsWith("major") ? "active" : "inactive"}`}>♮ Major</span>
                <select
                  className={`key-select major-select ${input.key.endsWith("major") ? "active" : "inactive"}`}
                  value={input.key.endsWith("major") ? input.key : ""}
                  onChange={(event) => {
                    if (event.target.value) setInput({ ...input, key: event.target.value });
                  }}
                >
                  <option value="" disabled>— select —</option>
                  {MAJOR_KEY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.replace(" major", "")}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`key-label minor-label ${input.key.endsWith("minor") ? "active" : ""}`}>
                <span className={`key-mode-tag minor-tag ${input.key.endsWith("minor") ? "active" : "inactive"}`}>♭ Minor</span>
                <select
                  className={`key-select minor-select ${input.key.endsWith("minor") ? "active" : "inactive"}`}
                  value={input.key.endsWith("minor") ? input.key : ""}
                  onChange={(event) => {
                    if (event.target.value) setInput({ ...input, key: event.target.value });
                  }}
                >
                  <option value="" disabled>— select —</option>
                  {MINOR_KEY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.replace(" minor", "")}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="two-fields">
              <label>Tempo (BPM)
                <input type="number" min="45" max="220" value={input.tempo_bpm} onChange={(event) => setInput({ ...input, tempo_bpm: Number(event.target.value) })} />
              </label>
              <label>Time Signature
                <select value={input.time_signature} onChange={(event) => setInput({ ...input, time_signature: event.target.value })}>
                  <option value="4/4">4/4</option>
                  <option value="3/4">3/4</option>
                  <option value="6/8">6/8</option>
                  <option value="2/4">2/4</option>
                </select>
              </label>
            </div>
            <div className="two-fields">
              <label>Bars
                <input type="number" min="4" max="32" value={input.bars} onChange={(event) => setInput({ ...input, bars: Number(event.target.value) })} />
              </label>
              <label>Creativity
                <input type="number" min="0" max="1" step="0.05" value={input.creativity} onChange={(event) => setInput({ ...input, creativity: Number(event.target.value) })} />
              </label>
            </div>
            <label>Instrumentation
              <input value={input.instrumentation} onChange={(event) => setInput({ ...input, instrumentation: event.target.value })} />
            </label>
            <button className="primary-button" onClick={handleGenerate} disabled={!hasWorkspace || !hasProject || Boolean(busyAction)}>
              {busyAction === "generate" ? <Loader2 className="spin" size={18} /> : <Wand2 size={18} />}
              {!hasWorkspace ? "Create Workspace First" : !hasProject ? "Create Project First" : "Compose Track"}
            </button>
          </div>

          <div className="tool-card draft-browser">
            <div className="card-heading">
              <span><History size={16} /> Project Browser</span>
              <button className="icon-button" onClick={refreshDrafts} disabled={Boolean(busyAction)} title="Refresh drafts">
                <RefreshCw size={15} />
              </button>
            </div>
            <div className="draft-list">
              {drafts.length === 0 ? (
                <p>No drafts yet.</p>
              ) : (
                drafts.slice(0, 9).map((draft) => (
                  <button
                    key={draft.draft_id}
                    className={draft.draft_id === draftId ? "active" : ""}
                    onClick={() => openDraft(draft.draft_id)}
                    disabled={Boolean(busyAction)}
                  >
                    <strong>{draft.title}</strong>
                    <span>{draft.style} / {draft.mood}</span>
                    <small>{formatTimestamp(draft.updated_at)}</small>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {activeBrowserTab === "clips" && (
        <>
          <div className="tool-card">
            <div className="card-heading">
              <span><FileMusic size={16} /> Clips</span>
              <button
                className="icon-button"
                onClick={handleManualCompose}
                disabled={!hasWorkspace || !hasProject || Boolean(busyAction)}
                title="Create manual clip"
              >
                +
              </button>
            </div>
            <div className="clip-list">
              {!composition ? (
                <p>No clips yet. Create a manual composition or generate a track.</p>
              ) : (
                composition.sections.map((section, index) => (
                  <button key={`${section.name}-${index}`} type="button" className="clip-item">
                    <strong>{section.name || `Section ${index + 1}`}</strong>
                    <span>{section.bars || 0} bars / {(section.chords || []).join(" - ") || "No chords"}</span>
                    <small>{section.melody?.length || 0} notes / {section.lyric_lines?.length || 0} lyric lines</small>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="tool-card">
            <div className="card-heading"><Activity size={16} /> Clip Tools</div>
            <div className="rail-action-stack">
              <button onClick={handleManualCompose} disabled={!hasWorkspace || !hasProject || Boolean(busyAction)}>
                Manual Compose
              </button>
              <button onClick={() => handleRefine("arrangement")} disabled={!composition || Boolean(busyAction)}>
                Polish Arrangement
              </button>
              <button onClick={() => handleRefine("melody")} disabled={!composition || Boolean(busyAction)}>
                Regenerate Melody
              </button>
            </div>
          </div>
        </>
      )}

      {activeBrowserTab === "agents" && (
        <>
          <div className="tool-card">
            <div className="card-heading"><Sparkles size={16} /> Agents</div>
            <div className="agent-list">
              {AGENTS.map((agent) => (
                <div key={agent.id} className={generationProgress?.node === agent.id ? "agent-row active" : "agent-row"}>
                  <span>{agent.name}</span>
                  <small>{generationProgress?.node === agent.id ? "Working" : "Ready"}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="tool-card">
            <div className="card-heading"><Gauge size={16} /> Agent Control</div>
            <div className="agent-status-panel">
              <span>Provider</span>
              <strong>{provider?.model || "Loading provider"}</strong>
              <span>Architecture</span>
              <strong>{provider?.architecture?.replaceAll("_", " ") || "Not ready"}</strong>
              <span>Current Task</span>
              <strong>{generationProgress?.agent || busyAction || "Idle"}</strong>
            </div>
            <div className="rail-action-stack">
              <button onClick={handleGenerate} disabled={!hasWorkspace || !hasProject || Boolean(busyAction)}>
                AI Compose Track
              </button>
              <button onClick={handleAnalyze} disabled={!composition || Boolean(busyAction)}>
                Analyze Project
              </button>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
