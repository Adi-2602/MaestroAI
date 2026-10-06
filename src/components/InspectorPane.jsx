import { Gauge, ShieldCheck, Download, BadgeCheck } from "lucide-react";
import ScoreBar from "./ScoreBar.jsx";

export default function InspectorPane({
  composition,
  updateCompositionField,
  analysisStamp,
  evaluation,
  quality,
  handleRenderAudio,
  busyAction,
  handleExportCurrent,
  renderedAudio,
  commercialReview
}) {
  return (
    <aside className="inspector-pane">
      <div className="tool-card compact-meta">
        <div className="card-heading"><Gauge size={16} /> Channel Rack</div>
        {composition ? (
          <div className="meta-grid">
            <label>Style<input value={composition.style} onChange={(event) => updateCompositionField("style", event.target.value)} /></label>
            <label>Mood<input value={composition.mood} onChange={(event) => updateCompositionField("mood", event.target.value)} /></label>
            <label>Key<input value={composition.key} onChange={(event) => updateCompositionField("key", event.target.value)} /></label>
            <label>BPM<input type="number" value={composition.tempo_bpm} onChange={(event) => updateCompositionField("tempo_bpm", Number(event.target.value))} /></label>
          </div>
        ) : (
          <p className="muted-copy">Generate or open a draft to inspect it.</p>
        )}
      </div>

      <div className="tool-card evaluation-card">
        <div className="card-heading">
          <span><ShieldCheck size={16} /> Mastering Meter</span>
          {analysisStamp && <small className="analysis-stamp">{analysisStamp}</small>}
        </div>
        {evaluation ? (
          <>
            <div className="score-dial">
              <strong>{evaluation.overall_score}</strong>
              <span>readiness</span>
            </div>
            <ScoreBar label="Chords" value={evaluation.chord_validity} />
            <ScoreBar label="Key fit" value={evaluation.melody_key_fit} />
            <ScoreBar label="Duration" value={evaluation.duration_fit} />
            <ScoreBar label="Style" value={evaluation.style_adherence} />
            <ScoreBar label="Lyrics" value={evaluation.lyrics_score} />
            <ScoreBar label="Export" value={evaluation.export_readiness} />
            <ScoreBar label="Safety" value={evaluation.commercial_safety} />
            <div className="recommendations">
              {evaluation.recommendations.map((item, index) => <p key={`${item}-${index}`}>{item}</p>)}
            </div>
          </>
        ) : (
          <p className="muted-copy">Analysis appears after generation or draft open.</p>
        )}
      </div>

      {quality?.warnings?.length > 0 && (
        <div className="tool-card warning-card">
          <div className="card-heading">Warnings</div>
          {quality.warnings.map((warning, index) => <p key={`${warning}-${index}`}>{warning}</p>)}
        </div>
      )}

      <div className="tool-card">
        <div className="card-heading"><Download size={16} /> Render Rack</div>
        <div className="export-grid">
          <button onClick={handleRenderAudio} disabled={!composition || Boolean(busyAction)}>
            {busyAction === "render-audio" ? "Rendering" : "Render Player"}
          </button>
          <button onClick={() => handleExportCurrent("/export/wav", "wav")} disabled={!composition || Boolean(busyAction)}>WAV</button>
          <button onClick={() => handleExportCurrent("/export/stems", "zip")} disabled={!composition || Boolean(busyAction)}>Stems</button>
          <button onClick={() => handleExportCurrent("/export/mp3", "mp3")} disabled={!composition || Boolean(busyAction)}>MP3</button>
          <button onClick={() => handleExportCurrent("/export/midi", "mid")} disabled={!composition || Boolean(busyAction)}>MIDI</button>
          <button onClick={() => handleExportCurrent("/export/musicxml", "musicxml")} disabled={!composition || Boolean(busyAction)}>MusicXML</button>
          <button onClick={() => handleExportCurrent("/export/notation", "txt")} disabled={!composition || Boolean(busyAction)}>Notation</button>
          <button onClick={() => handleExportCurrent("/export/package", "zip")} disabled={!composition || Boolean(busyAction)}>ZIP Pack</button>
        </div>
        {renderedAudio && (
          <div className="audio-render">
            <span>{renderedAudio.filename}</span>
            <audio controls src={renderedAudio.url} />
          </div>
        )}
      </div>

      {commercialReview && (
        <div className="tool-card commercial-card">
          <div className="card-heading"><BadgeCheck size={16} /> Release Check</div>
          <ScoreBar label="Safety" value={commercialReview.score} />
          {[...commercialReview.warnings, ...commercialReview.notes].slice(0, 5).map((item, index) => (
            <p key={`${item}-${index}`}>{item}</p>
          ))}
        </div>
      )}

      {composition && (
        <div className="tool-card notes-card">
          <h2>Plugin Notes</h2>
          <div className="note-list">{composition.style_notes.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>
          {composition.drum_pattern?.length > 0 && (
            <>
              <h2>Drums</h2>
              <div className="note-list">{composition.drum_pattern.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>
            </>
          )}
          {composition.bassline?.length > 0 && (
            <>
              <h2>Bass</h2>
              <div className="note-list">{composition.bassline.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>
            </>
          )}
          {composition.mix_notes?.length > 0 && (
            <>
              <h2>Mix</h2>
              <div className="note-list">{composition.mix_notes.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>
            </>
          )}
          <h2>Originality</h2>
          <div className="note-list">{composition.originality_notes.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>
          {composition.agent_trace?.length > 0 && (
            <>
              <h2>Agent Trace</h2>
              <div className="agent-trace">{composition.agent_trace.map((item, index) => <p key={`${item}-${index}`}>{item}</p>)}</div>
            </>
          )}
          <p className="disclaimer">{composition.disclaimer}</p>
        </div>
      )}
    </aside>
  );
}
