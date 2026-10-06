import { useState, useRef, useCallback, useEffect } from "react";
import { Trash2, Copy, Plus, Play, ArrowUp, ArrowDown, Music, Scissors } from "lucide-react";
import { clone, beatsPerBar, pitchFrequency } from "../utils/index.js";

const VALID_PITCHES = [
  "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
  "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
  "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
  "rest"
];

const VALID_DURATIONS = [0.25, 0.5, 1, 1.5, 2, 3, 4];

function playTone(pitch, durationSec = 0.3) {
  if (pitch === "rest" || !pitch) return;
  const freq = pitchFrequency(pitch);
  if (!freq) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationSec + 0.05);
    setTimeout(() => ctx.close(), (durationSec + 0.1) * 1000);
  } catch {
    // AudioContext not available
  }
}

function buildNoteRows(section, totalBeats) {
  let beatCursor = 0;
  const rows = section.melody.map((note, noteIdx) => {
    const startBeat = beatCursor;
    beatCursor += Number(note.duration_beats || 1);
    return {
      note,
      noteIdx,
      startBeat,
      endBeat: beatCursor,
      leftPct: (startBeat / totalBeats) * 100,
      widthPct: (Math.max(0.25, note.duration_beats) / totalBeats) * 100,
    };
  });
  return { rows, beatCursor };
}

function TrimTimeline({ section, secIdx, totalBeats, onApplyTrim }) {
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(null); // 'left' | 'right' | null
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(section.melody.length - 1);
  const [hoverIdx, setHoverIdx] = useState(null);

  // Reset handles when section changes
  useEffect(() => {
    setTrimStart(0);
    setTrimEnd(Math.max(0, section.melody.length - 1));
  }, [section.melody.length]);

  const noteCount = section.melody.length;
  if (noteCount <= 1) return null;

  const { rows, beatCursor } = buildNoteRows(section, totalBeats);
  const capacity = section.bars * beatsPerBar(section.timeSignature || "4/4");

  function getNoteIndexFromX(clientX) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    // Find which note this falls into
    let accumulated = 0;
    for (let i = 0; i < rows.length; i++) {
      const endPct = (rows[i].endBeat / totalBeats);
      if (pct <= endPct) return i;
    }
    return rows.length - 1;
  }

  function handleMouseDown(handle) {
    setDragging(handle);
  }

  function handleMouseMove(e) {
    if (!dragging) {
      const idx = getNoteIndexFromX(e.clientX);
      setHoverIdx(idx);
      return;
    }
    const idx = getNoteIndexFromX(e.clientX);
    if (dragging === "left") {
      setTrimStart(Math.min(idx, trimEnd));
    } else {
      setTrimEnd(Math.max(idx, trimStart));
    }
  }

  function handleMouseUp() {
    setDragging(null);
  }

  function applyTrim() {
    if (trimStart === 0 && trimEnd === noteCount - 1) return;
    onApplyTrim(secIdx, trimStart, trimEnd);
  }

  const leftPct = rows[trimStart]?.leftPct ?? 0;
  const rightPct = rows[trimEnd]?.endBeat
    ? (rows[trimEnd].endBeat / totalBeats) * 100
    : 100;
  const keepWidth = rightPct - leftPct;

  return (
    <div className="trim-timeline-wrap">
      <div className="trim-timeline-header">
        <Scissors size={13} />
        <span>Drag handles to trim · Keep notes {trimStart + 1} → {trimEnd + 1} of {noteCount}</span>
        <button
          className="trim-apply-btn"
          onClick={applyTrim}
          disabled={trimStart === 0 && trimEnd === noteCount - 1}
        >
          Apply Trim
        </button>
      </div>
      <div
        className="trim-timeline"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHoverIdx(null); setDragging(null); }}
        onMouseUp={handleMouseUp}
      >
        {/* Background capacity bar */}
        <div
          className="trim-capacity-bar"
          style={{ width: `${Math.min(100, (beatCursor / capacity) * 100)}%` }}
        />

        {/* Note blocks */}
        {rows.map((row) => {
          const isKept = row.noteIdx >= trimStart && row.noteIdx <= trimEnd;
          const isHovered = hoverIdx === row.noteIdx;
          return (
            <div
              key={`trim-block-${row.noteIdx}`}
              className={`trim-note-block ${isKept ? "kept" : "cut"} ${isHovered ? "hovered" : ""}`}
              style={{
                left: `${row.leftPct}%`,
                width: `${row.widthPct}%`,
              }}
              title={`${row.note.pitch} · ${row.note.duration_beats} beat${row.note.duration_beats !== 1 ? "s" : ""}`}
            >
              <span className="trim-note-label">{row.note.pitch}</span>
            </div>
          );
        })}

        {/* Keep region highlight */}
        <div
          className="trim-keep-region"
          style={{ left: `${leftPct}%`, width: `${keepWidth}%` }}
        />

        {/* Left handle */}
        <div
          className={`trim-handle left ${dragging === "left" ? "dragging" : ""}`}
          style={{ left: `${leftPct}%` }}
          onMouseDown={() => handleMouseDown("left")}
          title={`Trim start: note ${trimStart + 1}`}
        >
          <div className="trim-handle-grip" />
        </div>

        {/* Right handle */}
        <div
          className={`trim-handle right ${dragging === "right" ? "dragging" : ""}`}
          style={{ left: `${rightPct}%` }}
          onMouseDown={() => handleMouseDown("right")}
          title={`Trim end: note ${trimEnd + 1}`}
        >
          <div className="trim-handle-grip" />
        </div>

        {/* Hover cursor line */}
        {hoverIdx !== null && !dragging && rows[hoverIdx] && (
          <div
            className="trim-hover-line"
            style={{ left: `${rows[hoverIdx].leftPct}%` }}
          />
        )}
      </div>

      <div className="trim-legend">
        <span className="trim-legend-kept">■ Kept</span>
        <span className="trim-legend-cut">■ Will be removed</span>
      </div>
    </div>
  );
}

export default function NoteEditor({ composition, updateComposition }) {
  const [expandedSection, setExpandedSection] = useState(0);
  const [previewing, setPreviewing] = useState(null);
  const previewTimeout = useRef(null);

  const bpb = beatsPerBar(composition?.time_signature || "4/4");

  const handlePlayNote = useCallback((pitch, id) => {
    playTone(pitch, 0.4);
    setPreviewing(id);
    if (previewTimeout.current) clearTimeout(previewTimeout.current);
    previewTimeout.current = setTimeout(() => setPreviewing(null), 400);
  }, []);

  if (!composition || !composition.sections) return null;

  function updateNote(sectionIndex, noteIndex, changes) {
    updateComposition((current) => {
      const next = clone(current);
      const sec = next.sections[sectionIndex];
      if (!sec || !sec.melody[noteIndex]) return current;
      sec.melody[noteIndex] = { ...sec.melody[noteIndex], ...changes };
      return next;
    });
  }

  function deleteNote(sectionIndex, noteIndex) {
    updateComposition((current) => {
      const next = clone(current);
      const sec = next.sections[sectionIndex];
      if (!sec || !sec.melody[noteIndex]) return current;
      sec.melody.splice(noteIndex, 1);
      if (sec.melody.length === 0) {
        sec.melody = [{ pitch: "C4", duration_beats: 1, lyric_syllable: null }];
      }
      return next;
    });
  }

  function addNote(sectionIndex, noteIndex, after = true) {
    updateComposition((current) => {
      const next = clone(current);
      const sec = next.sections[sectionIndex];
      if (!sec) return current;
      const insertIndex = after ? noteIndex + 1 : noteIndex;
      const newNote = { pitch: "C4", duration_beats: 1, lyric_syllable: null };
      sec.melody.splice(insertIndex, 0, newNote);
      return next;
    });
  }

  function duplicateNote(sectionIndex, noteIndex) {
    updateComposition((current) => {
      const next = clone(current);
      const sec = next.sections[sectionIndex];
      if (!sec || !sec.melody[noteIndex]) return current;
      sec.melody.splice(noteIndex + 1, 0, clone(sec.melody[noteIndex]));
      return next;
    });
  }

  function moveNote(sectionIndex, noteIndex, direction) {
    const newIndex = noteIndex + direction;
    if (newIndex < 0) return;
    updateComposition((current) => {
      const next = clone(current);
      const sec = next.sections[sectionIndex];
      if (!sec || !sec.melody[noteIndex] || newIndex >= sec.melody.length) return current;
      const [moved] = sec.melody.splice(noteIndex, 1);
      sec.melody.splice(newIndex, 0, moved);
      return next;
    });
  }

  function applyTrim(sectionIndex, keepStart, keepEnd) {
    updateComposition((current) => {
      const next = clone(current);
      const sec = next.sections[sectionIndex];
      if (!sec || sec.melody.length <= 1) return current;
      const start = Math.max(0, keepStart);
      const end = Math.min(sec.melody.length - 1, keepEnd);
      if (start > end) return current;
      sec.melody = sec.melody.slice(start, end + 1);
      return next;
    });
  }

  return (
    <section className="note-editor-panel">
      <div className="section-toolbar">
        <h2><Music size={17} /> Note Editor</h2>
        <div className="map-legend">
          <span>Edit pitch, duration, start/end</span>
        </div>
      </div>

      <div className="note-editor-sections">
        {composition.sections.map((section, secIdx) => {
          const isOpen = expandedSection === secIdx;
          const totalBeats = Math.max(
            section.bars * bpb,
            section.melody.reduce((sum, n) => sum + Number(n.duration_beats || 1), 0)
          );
          const { rows, beatCursor } = buildNoteRows(section, totalBeats);
          const capacity = section.bars * bpb;

          return (
            <div key={`sec-${secIdx}`} className="note-editor-section">
              <button
                className={`note-editor-section-header ${isOpen ? "open" : ""}`}
                onClick={() => setExpandedSection(isOpen ? -1 : secIdx)}
              >
                <span className="section-title">{section.name}</span>
                <span className="section-meta">
                  {section.melody.length} notes · {beatCursor.toFixed(1).replace(".0", "")} / {capacity.toFixed(1).replace(".0", "")} beats
                </span>
                <span className="section-chevron">{isOpen ? "▾" : "▸"}</span>
              </button>

              {isOpen && (
                <div className="note-editor-body">
                  {/* Mini timeline bar (read-only overview) */}
                  <div className="note-mini-timeline">
                    <div className="note-mini-timeline-bar" style={{ width: `${Math.min(100, (beatCursor / capacity) * 100)}%` }} />
                    {rows.map((row) => (
                      <div
                        key={`bar-${row.noteIdx}`}
                        className="note-mini-block"
                        style={{
                          left: `${row.leftPct}%`,
                          width: `${row.widthPct}%`,
                        }}
                        title={`${row.note.pitch} (${row.note.duration_beats} beats)`}
                      />
                    ))}
                  </div>

                  {/* Visual drag-to-trim timeline */}
                  <TrimTimeline
                    section={section}
                    secIdx={secIdx}
                    totalBeats={totalBeats}
                    onApplyTrim={applyTrim}
                  />

                  {/* Add note at end */}
                  <div className="note-trim-controls">
                    <button
                      className="trim-btn accent"
                      onClick={() => addNote(secIdx, section.melody.length - 1, true)}
                      title="Add note at end"
                    >
                      <Plus size={13} /> Add Note at End
                    </button>
                  </div>

                  {/* Note table */}
                  <div className="note-table-wrap">
                    <table className="note-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Start</th>
                          <th>Pitch</th>
                          <th>Duration</th>
                          <th>Lyric</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => {
                          const id = `${secIdx}-${row.noteIdx}`;
                          const isPlaying = previewing === id;
                          return (
                            <tr key={id} className={isPlaying ? "playing" : ""}>
                              <td className="note-index">{row.noteIdx + 1}</td>
                              <td className="note-start">{row.startBeat.toFixed(1).replace(".0", "")}</td>
                              <td className="note-pitch-cell">
                                <select
                                  value={row.note.pitch || "C4"}
                                  onChange={(e) => updateNote(secIdx, row.noteIdx, { pitch: e.target.value })}
                                  className="note-pitch-select"
                                >
                                  {VALID_PITCHES.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="note-duration-cell">
                                <select
                                  value={row.note.duration_beats || 1}
                                  onChange={(e) => updateNote(secIdx, row.noteIdx, { duration_beats: Number(e.target.value) })}
                                  className="note-duration-select"
                                >
                                  {VALID_DURATIONS.map((d) => (
                                    <option key={d} value={d}>
                                      {d === 0.25 ? "1/4" : d === 0.5 ? "1/2" : d === 1.5 ? "1 1/2" : d === 3 ? "3" : d.toString()} beat{d !== 1 ? "s" : ""}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="note-lyric-cell">
                                <input
                                  type="text"
                                  value={row.note.lyric_syllable || ""}
                                  onChange={(e) => updateNote(secIdx, row.noteIdx, { lyric_syllable: e.target.value || null })}
                                  placeholder="-"
                                  className="note-lyric-input"
                                />
                              </td>
                              <td className="note-actions">
                                <button
                                  className="note-action-btn play"
                                  onClick={() => handlePlayNote(row.note.pitch, id)}
                                  title="Preview note"
                                >
                                  <Play size={13} />
                                </button>
                                <button
                                  className="note-action-btn"
                                  onClick={() => moveNote(secIdx, row.noteIdx, -1)}
                                  disabled={row.noteIdx === 0}
                                  title="Move up"
                                >
                                  <ArrowUp size={13} />
                                </button>
                                <button
                                  className="note-action-btn"
                                  onClick={() => moveNote(secIdx, row.noteIdx, 1)}
                                  disabled={row.noteIdx === section.melody.length - 1}
                                  title="Move down"
                                >
                                  <ArrowDown size={13} />
                                </button>
                                <button
                                  className="note-action-btn"
                                  onClick={() => duplicateNote(secIdx, row.noteIdx)}
                                  title="Duplicate note"
                                >
                                  <Copy size={13} />
                                </button>
                                <button
                                  className="note-action-btn add"
                                  onClick={() => addNote(secIdx, row.noteIdx, true)}
                                  title="Add note after"
                                >
                                  <Plus size={13} />
                                </button>
                                <button
                                  className="note-action-btn delete"
                                  onClick={() => deleteNote(secIdx, row.noteIdx)}
                                  disabled={section.melody.length <= 1}
                                  title="Delete note"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="note-editor-footer">
        <p>
          💡 <strong>Tip:</strong> Drag the trim handles on the timeline to set which notes to keep.
          Click <strong>Preview</strong> in the transport bar to hear changes, then <strong>Save</strong>.
        </p>
      </div>
    </section>
  );
}
