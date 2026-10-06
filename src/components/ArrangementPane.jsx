import {
  Activity,
  Layers,
  Music,
  Waves,
  Pause,
  Play,
  ShieldCheck,
  Save,
  Loader2,
  Sparkles,
  RefreshCw
} from "lucide-react";
import ArrangementMap from "./ArrangementMap.jsx";
import ChordTimeline from "./ChordTimeline.jsx";
import PianoRoll from "./PianoRoll.jsx";
import ChordLyricView from "./ChordLyricView.jsx";
import MixerPanel from "./MixerPanel.jsx";
import SectionEditor from "./SectionEditor.jsx";
import NoteEditor from "./NoteEditor.jsx";

export default function ArrangementPane({
  workspaceName,
  projectName,
  composition,
  hasProject,
  selectedProject,
  setSelectedProject,
  updateCompositionField,
  token,
  updateProject,
  refreshProjects,
  setError,
  input,
  versions,
  activeTier,
  handleSelectTier,
  returnToDashboard,
  busyAction,
  playPreview,
  isPlaying,
  handleAnalyze,
  handleSave,
  draftId,
  handleSaveAs,
  selectedWorkspace,
  error,
  status,
  hasWorkspace,
  metrics,
  handleRefine,
  updateChordEvent,
  renderedAudio,
  updateMixer,
  updateSection,
  updateComposition
}) {
  return (
    <section className="arrangement-pane">
      <div className="transport-bar">
        <div className="transport-main">
          <div className="title-block">
            <p>{workspaceName || "No workspace"} / {projectName || "No project"}</p>
            <input
              value={composition?.title || projectName || "Untitled composition"}
              disabled={!hasProject}
              onChange={(event) => {
                if (selectedProject && event.target.value.trim().length >= 2) {
                  setSelectedProject({ ...selectedProject, title: event.target.value });
                }
                if (composition) updateCompositionField("title", event.target.value);
              }}
              onBlur={(event) => {
                if (selectedProject && event.target.value.trim().length >= 2) {
                  updateProject(token, selectedProject.project_id, { title: event.target.value.trim() })
                    .then((project) => {
                      setSelectedProject(project);
                      refreshProjects(project.workspace_id);
                    })
                    .catch((err) => setError(err.message));
                }
              }}
            />
          </div>
          <div className="transport-readout">
            <span><strong>{composition?.tempo_bpm || input.tempo_bpm}</strong><small>BPM</small></span>
            <span><strong>{composition?.key || input.key}</strong><small>Key</small></span>
            <span><strong>{composition?.time_signature || input.time_signature}</strong><small>Meter</small></span>
          </div>
        </div>
        {versions && (
          <div className="tier-selector-tabs">
            <button
              className={activeTier === "safe" ? "active" : ""}
              onClick={() => handleSelectTier("safe")}
            >
              Safe
            </button>
            <button
              className={activeTier === "balanced" ? "active" : ""}
              onClick={() => handleSelectTier("balanced")}
            >
              Balanced
            </button>
            <button
              className={activeTier === "wild" ? "active" : ""}
              onClick={() => handleSelectTier("wild")}
            >
              Wild
            </button>
          </div>
        )}
        <div className="transport-actions">
          <button onClick={() => { returnToDashboard(); }} disabled={Boolean(busyAction)}>
            <Layers size={17} />
            Dashboard
          </button>
          <button onClick={playPreview} disabled={!composition || Boolean(busyAction)}>
            {busyAction === "preview-audio" ? <Loader2 className="spin" size={17} /> : isPlaying ? <Pause size={17} /> : <Play size={17} />}
            {busyAction === "preview-audio" ? "Rendering" : isPlaying ? "Stop" : "Preview"}
          </button>
          <button onClick={handleAnalyze} disabled={!composition || Boolean(busyAction)}>
            {busyAction === "analyze" ? <Loader2 className="spin" size={17} /> : <ShieldCheck size={17} />}
            Analyze
          </button>
          <button onClick={handleSave} disabled={!composition || !draftId || Boolean(busyAction)}>
            <Save size={17} />
            Save
          </button>
          <button onClick={handleSaveAs} disabled={!composition || !selectedWorkspace || Boolean(busyAction)}>
            <Save size={17} />
            Save As
          </button>
        </div>
      </div>

      {error && <div className="message error" style={{ whiteSpace: "pre-wrap" }}>{error}</div>}
      {status && <div className="message status">{status}</div>}

      {!composition ? (
        <div className="empty-workspace">
          <div className="empty-score-grid" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, index) => <span key={index} />)}
          </div>
          <Sparkles size={40} />
          <h2>{hasWorkspace && hasProject ? "Start a composition draft" : "Create workspace and project"}</h2>
          <p>
            {hasWorkspace && hasProject
              ? `${input.style} / ${input.mood} / ${input.key} / ${input.tempo_bpm} BPM`
              : "Use File > New Workspace, then File > New Project before composing."}
          </p>
        </div>
      ) : (
        <div className="arrangement-stack">
          <div className="overview-strip">
            <div><Activity size={17} /><strong>{metrics.sections}</strong><span>sections</span></div>
            <div><Layers size={17} /><strong>{metrics.bars}</strong><span>bars</span></div>
            <div><Music size={17} /><strong>{metrics.chords}</strong><span>chords</span></div>
            <div><Waves size={17} /><strong>{metrics.notes}</strong><span>notes</span></div>
          </div>

          <ArrangementMap composition={composition} />

          <section className="timeline-card">
            <div className="section-toolbar">
              <h2>Playlist Timeline</h2>
              <button onClick={() => handleRefine("chords")} disabled={Boolean(busyAction)}>
                {busyAction === "chords" ? <Loader2 className="spin" size={15} /> : <RefreshCw size={15} />}
                Chords
              </button>
            </div>
            <ChordTimeline
              sections={composition.sections}
              timeSignature={composition.time_signature}
              onChordChange={updateChordEvent}
            />
          </section>

          <PianoRoll composition={composition} />

          <NoteEditor composition={composition} updateComposition={updateComposition} />

          <section className="chord-lyric-card">
            <h2>Chords & Lyrics</h2>
            <ChordLyricView sections={composition.sections} />
          </section>

          <section className="refine-row">
            <button onClick={() => handleRefine("melody")} disabled={Boolean(busyAction)}>
              {busyAction === "melody" ? <Loader2 className="spin" size={16} /> : <Waves size={16} />}
              Regenerate Melody
            </button>
            <button onClick={() => handleRefine("lyrics")} disabled={Boolean(busyAction)}>
              {busyAction === "lyrics" ? <Loader2 className="spin" size={16} /> : <Sparkles size={16} />}
              Regenerate Lyrics
            </button>
            <button onClick={() => handleRefine("arrangement")} disabled={Boolean(busyAction)}>
              {busyAction === "arrangement" ? <Loader2 className="spin" size={16} /> : <Layers size={16} />}
              Polish Arrangement
            </button>
          </section>

          <MixerPanel 
            composition={composition} 
            renderedAudio={renderedAudio} 
            onVolumeChange={(channelKey, val) => updateMixer(channelKey, "volume", val)}
            onPanChange={(channelKey, val) => updateMixer(channelKey, "pan", val)}
            onInstrumentChange={(channelKey, val) => updateMixer(channelKey, "instrument", val)}
          />

          {composition.sections.map((section, index) => (
            <SectionEditor
              key={`${section.name}-${index}`}
              section={section}
              index={index}
              composition={composition}
              updateSection={updateSection}
            />
          ))}
        </div>
      )}
    </section>
  );
}
