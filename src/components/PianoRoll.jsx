export default function PianoRoll({ composition }) {
  const rows = ["C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4", "B3", "A3"];
  const notes = [];
  let cursor = 0;
  composition.sections.forEach((section) => {
    section.melody.forEach((item) => {
      const duration = Number(item.duration_beats || 1);
      if (item.pitch && item.pitch !== "rest") {
        const row = rows.findIndex((pitch) => pitch[0] === item.pitch[0] && pitch.at(-1) === item.pitch.at(-1));
        notes.push({
          pitch: item.pitch,
          left: cursor,
          width: Math.max(0.75, duration),
          row: row >= 0 ? row : 5
        });
      }
      cursor += duration;
    });
  });
  const totalBeats = Math.max(8, cursor);

  return (
    <section className="piano-roll-panel">
      <div className="section-toolbar">
        <h2>Piano Roll</h2>
        <div className="map-legend">
          <span>Melody</span>
          <span>Grid</span>
        </div>
      </div>
      <div className="piano-roll">
        <div className="piano-keys">
          {rows.map((row) => <span key={row}>{row}</span>)}
        </div>
        <div className="piano-grid">
          {rows.map((row) => <span key={row} />)}
          {notes.map((item, index) => (
            <button
              key={`${item.pitch}-${index}`}
              className="midi-note"
              style={{
                left: `${(item.left / totalBeats) * 100}%`,
                width: `${(item.width / totalBeats) * 100}%`,
                top: `${item.row * 10}%`
              }}
              title={item.pitch}
            >
              {item.pitch}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
