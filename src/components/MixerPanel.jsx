import { DRUM_OPTIONS, BASS_OPTIONS, HARMONY_OPTIONS, MELODY_OPTIONS } from "../constants/index.js";
import { getStyleDefaultInstruments } from "../utils/index.js";

export default function MixerPanel({ composition, onVolumeChange, onPanChange, onInstrumentChange }) {
  const styleDefaults = getStyleDefaultInstruments(composition?.style);
  const mixer = composition?.mixer || {
    drums: { volume: 74, pan: "C", instrument: styleDefaults.drums },
    bass: { volume: 82, pan: "L8", instrument: styleDefaults.bass },
    harmony: { volume: 68, pan: "R6", instrument: styleDefaults.harmony },
    melody: { volume: 88, pan: "C", instrument: styleDefaults.melody },
    master: { volume: 78, pan: "C", instrument: "master" }
  };

  const channels = [
    { 
      name: "Drums", 
      key: "drums", 
      level: mixer.drums?.volume ?? 74, 
      pan: mixer.drums?.pan ?? "C", 
      instrument: mixer.drums?.instrument ?? styleDefaults.drums,
      options: DRUM_OPTIONS,
      color: "cyan" 
    },
    { 
      name: "Bass", 
      key: "bass", 
      level: mixer.bass?.volume ?? 82, 
      pan: mixer.bass?.pan ?? "L8", 
      instrument: mixer.bass?.instrument ?? styleDefaults.bass,
      options: BASS_OPTIONS,
      color: "lime" 
    },
    { 
      name: "Harmony", 
      key: "harmony", 
      level: mixer.harmony?.volume ?? 68, 
      pan: mixer.harmony?.pan ?? "R6", 
      instrument: mixer.harmony?.instrument ?? styleDefaults.harmony,
      options: HARMONY_OPTIONS,
      color: "violet" 
    },
    { 
      name: "Melody", 
      key: "melody", 
      level: mixer.melody?.volume ?? 88, 
      pan: mixer.melody?.pan ?? "C", 
      instrument: mixer.melody?.instrument ?? styleDefaults.melody,
      options: MELODY_OPTIONS,
      color: "amber" 
    },
    { 
      name: "Master", 
      key: "master", 
      level: mixer.master?.volume ?? 78, 
      pan: mixer.master?.pan ?? "C", 
      instrument: "master",
      options: null,
      color: "master" 
    }
  ];

  return (
    <section className="mixer-panel">
      <div className="section-toolbar">
        <h2>Mixer</h2>
        <div className="map-legend">
          <span>{composition?.sections?.length || 0} sections</span>
          <span>{composition?.tempo_bpm || 120} BPM</span>
        </div>
      </div>
      <div className="mixer-strips">
        {channels.map((channel) => (
          <div className={`mixer-strip ${channel.color}`} key={channel.key}>
            <strong>{channel.name}</strong>
            {channel.options && (
              <select
                className="mixer-inst-select"
                value={channel.instrument}
                onChange={(e) => onInstrumentChange(channel.key, e.target.value)}
                title={`${channel.name} Instrument`}
              >
                {channel.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            <div className="mixer-fader-area">
              <span className="mixer-vol-label">{channel.level}</span>
              <div className="mixer-fader-wrapper">
                <div className="mixer-fader-track">
                  <div className="mixer-meter-fill" style={{ height: `${channel.level}%` }} />
                </div>
                <input
                  type="range"
                  className="mixer-fader-input"
                  min="0"
                  max="100"
                  step="1"
                  value={channel.level}
                  onChange={(e) => onVolumeChange(channel.key, Number(e.target.value))}
                  title={`${channel.name} volume: ${channel.level}`}
                />
              </div>
            </div>
            <select
              className="mixer-pan-select"
              value={channel.pan}
              onChange={(e) => onPanChange(channel.key, e.target.value)}
              title={`${channel.name} Pan`}
            >
              <option value="L10">L10</option>
              <option value="L8">L8</option>
              <option value="L6">L6</option>
              <option value="L4">L4</option>
              <option value="L2">L2</option>
              <option value="C">C</option>
              <option value="R2">R2</option>
              <option value="R4">R4</option>
              <option value="R6">R6</option>
              <option value="R8">R8</option>
              <option value="R10">R10</option>
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}
