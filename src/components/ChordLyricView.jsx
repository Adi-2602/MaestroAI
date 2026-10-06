export default function ChordLyricView({ sections }) {
  function parseChordLine(line) {
    if (!line) return [];
    const tokens = [];
    const regex = /\[([^\]]+)\]([^\[]*)/g;
    let match;
    let lastIndex = 0;

    if (!line.includes("[")) {
      return [{ chord: null, text: line }];
    }

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        const leadingText = line.substring(lastIndex, match.index);
        if (leadingText) {
          tokens.push({ chord: null, text: leadingText });
        }
      }
      tokens.push({ chord: match[1], text: match[2] });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      const trailingText = line.substring(lastIndex);
      if (trailingText) {
        tokens.push({ chord: null, text: trailingText });
      }
    }
    return tokens;
  }

  return (
    <div className="chord-lyric-view">
      {sections.map((section, si) => {
        const hasChordLyrics = section.lyric_chord_lines && section.lyric_chord_lines.length > 0;
        const linesToRender = hasChordLyrics ? section.lyric_chord_lines : (section.lyric_lines || []);

        return (
          <div key={si} className="chord-lyric-section">
            <h3 className="chord-lyric-section-title">{section.name}</h3>
            <div className="chord-lyric-lines">
              {linesToRender.length === 0 ? (
                <p className="chord-lyric-empty">(No lyrics for this section)</p>
              ) : (
                linesToRender.map((line, li) => {
                  const tokens = parseChordLine(line);
                  return (
                    <div key={li} className="chord-lyric-line">
                      {tokens.map((tok, ti) => (
                        <div key={ti} className="chord-lyric-token">
                          {tok.chord && (
                            <span className="chord-lyric-chord">{tok.chord}</span>
                          )}
                          <span className="chord-lyric-word">
                            {tok.text || "\u00A0"}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
