export default function ArrangementMap({ composition }) {
  const totalBars = Math.max(1, composition.sections.reduce((sum, section) => sum + section.bars, 0));
  return (
    <section className="arrangement-map">
      <div className="section-toolbar">
        <h2>Arrangement Map</h2>
        <div className="map-legend">
          <span>Sections</span>
          <span>Bars</span>
          <span>Harmony</span>
        </div>
      </div>
      <div className="section-lanes">
        {composition.sections.map((section, index) => {
          const widthPct = Math.max(14, (section.bars / totalBars) * 100);
          const chordCount = section.chord_events?.length || section.chords?.length || 0;
          const lyricCount = section.lyric_lines?.length || section.lyric_chord_lines?.length || 0;
          return (
            <div className="section-lane" key={`${section.name}-${index}`} style={{ width: `${widthPct}%` }}>
              <strong>{section.name}</strong>
              <span>{section.bars} bars</span>
              <i>{chordCount} chords / {lyricCount} lines</i>
            </div>
          );
        })}
      </div>
    </section>
  );
}
