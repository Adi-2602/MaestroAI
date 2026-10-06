import {
  beatsPerBar,
  sectionBeats,
  melodyToText,
  parseMelody,
  splitLines,
  splitChords,
  chordEventsFromChords
} from "../utils/index.js";

export default function SectionEditor({ section, index, composition, updateSection }) {
  const capacity = section.bars * beatsPerBar(composition.time_signature);
  const used = sectionBeats(section);
  const fill = Math.min(100, Math.round((used / capacity) * 100));

  return (
    <section className="section-editor">
      <div className="section-editor-head">
        <input value={section.name} onChange={(event) => updateSection(index, (current) => ({ ...current, name: event.target.value }))} />
        <label>Bars
          <input type="number" min="1" max="16" value={section.bars} onChange={(event) => updateSection(index, (current) => ({ ...current, bars: Number(event.target.value) }))} />
        </label>
      </div>
      <div className="section-meter">
        <span>{used.toFixed(1).replace(".0", "")}/{capacity.toFixed(1).replace(".0", "")} beats</span>
        <div><i style={{ width: `${fill}%` }} /></div>
      </div>
      <label>Chords
        <div className="chip-editor">
          {(section.chords || section.chord_events?.map((e) => e.chord) || []).map((chord, chordIndex) => (
            <input
              key={`${chord}-${chordIndex}`}
              value={chord}
              onChange={(event) => updateSection(index, (current) => {
                const nextChord = event.target.value;
                const next = { ...current, chords: [...current.chords] };
                next.chords[chordIndex] = nextChord;
                next.chord_events = current.chord_events?.length
                  ? current.chord_events.map((evt, evtIndex) => (
                      evtIndex === chordIndex ? { ...evt, chord: nextChord } : evt
                    ))
                  : chordEventsFromChords(next.chords, composition.time_signature);
                return next;
              })}
            />
          ))}
        </div>
        <input className="compact-input" value={(section.chords || section.chord_events?.map((e) => e.chord) || []).join(" - ")} onChange={(event) => updateSection(index, (current) => {
          const chords = splitChords(event.target.value);
          return { ...current, chords, chord_events: chordEventsFromChords(chords, composition.time_signature) };
        })} />
      </label>
      <div className="editor-grid">
        <label>Melody
          <textarea rows="4" value={melodyToText(section.melody)} onChange={(event) => updateSection(index, (current) => ({ ...current, melody: parseMelody(event.target.value) }))} />
        </label>
        <label>Lyrics (use [Chord] tags for inline chords)
          <textarea
            rows="4"
            value={
              (section.lyric_chord_lines && section.lyric_chord_lines.length > 0)
                ? section.lyric_chord_lines.join("\n")
                : (section.lyric_lines || []).join("\n")
            }
            onChange={(event) => {
              const val = event.target.value;
              const lines = splitLines(val);
              const hasBrackets = val.includes("[");
              updateSection(index, (current) => ({
                ...current,
                lyric_chord_lines: hasBrackets ? lines : [],
                lyric_lines: lines.map((line) => line.replace(/\[[^\]]+\]/g, ""))
              }));
            }}
          />
        </label>
      </div>
    </section>
  );
}
