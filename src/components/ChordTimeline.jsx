import { useState } from "react";
import { beatsPerBar, chordTimelineBeats } from "../utils/index.js";

export default function ChordTimeline({ sections, timeSignature, onChordChange }) {
  const bpb = beatsPerBar(timeSignature);
  const [editKey, setEditKey] = useState(null); // "sectionIdx-eventIdx"

  function getEvents(section) {
    if (section.chord_events && section.chord_events.length > 0) return section.chord_events;
    return (section.chords || []).map((chord) => ({ chord, duration_beats: bpb }));
  }

  return (
    <div className="chord-timeline">
      {sections.map((section, si) => {
        const events = getEvents(section);
        const totalBeats = chordTimelineBeats(section, timeSignature);
        const rulerBars = Math.max(1, Math.ceil(totalBeats / bpb));
        return (
          <div key={si} className="chord-timeline-row">
            <div className="chord-timeline-section-label">{section.name}</div>
            <div className="chord-timeline-track">
              {events.map((evt, ei) => {
                const widthPct = Math.max(4, (evt.duration_beats / totalBeats) * 100);
                const key = `${si}-${ei}`;
                const isEditing = editKey === key;
                return (
                  <div
                    key={key}
                    className="chord-block"
                    style={{ width: `${widthPct}%` }}
                    onClick={() => setEditKey(key)}
                  >
                    {isEditing ? (
                      <input
                        className="chord-edit"
                        defaultValue={evt.chord}
                        autoFocus
                        onBlur={(e) => {
                          onChordChange(si, ei, e.target.value.trim() || evt.chord);
                          setEditKey(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === "Escape") e.target.blur();
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="chord-block-name">{evt.chord}</span>
                    )}
                    <span className="chord-block-dur">{evt.duration_beats}♩</span>
                  </div>
                );
              })}
            </div>
            <div className="beat-ruler">
              {Array.from({ length: rulerBars }).map((_, bi) => (
                <div key={bi} className="beat-bar">
                  {Array.from({ length: bpb }).map((_, beat) => (
                    <span key={beat}>{beat + 1}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
