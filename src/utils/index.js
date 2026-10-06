// --- Generic Utilities ---

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function splitLines(value) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

export function splitChords(value) {
  return value.split(/\s*(?:-|,|\|)\s*/).map((item) => item.trim()).filter(Boolean);
}

export function formatTimestamp(value) {
  if (!value) return "";
  return new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// --- Session / Workspace Storage ---

export function loadSessionState(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

export function loadWorkspaceState(key) {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || "{}");
    return {
      workspaceName: stored.workspaceName || "",
      projectName: stored.projectName || ""
    };
  } catch {
    return { workspaceName: "", projectName: "" };
  }
}

// --- Music / Composition Helpers ---

export function beatsPerBar(timeSignature = "4/4") {
  const [top, bottom] = timeSignature.split("/").map(Number);
  return top * (4 / bottom);
}

export function chordEventsFromChords(chords, timeSignature = "4/4") {
  const duration = beatsPerBar(timeSignature);
  return chords.map((chord) => ({ chord, duration_beats: duration }));
}

export function parseMelody(value) {
  return value.split(/\s+/).map((token) => token.trim()).filter(Boolean).map((token) => {
    const [pitch, duration = "1"] = token.split(":");
    return { pitch, duration_beats: Number(duration), lyric_syllable: null };
  });
}

export function melodyToText(melody) {
  return melody.map((item) => `${item.pitch}:${item.duration_beats}`).join(" ");
}

export function sectionBeats(section) {
  return section.melody.reduce((sum, item) => sum + Number(item.duration_beats || 0), 0);
}

export function chordEventBeats(section) {
  return (section.chord_events || []).reduce((sum, item) => sum + Number(item.duration_beats || 0), 0);
}

export function chordTimelineBeats(section, timeSignature = "4/4") {
  const bpb = beatsPerBar(timeSignature);
  return Math.max(section.bars * bpb, chordEventBeats(section));
}

export function localMetrics(composition) {
  if (!composition) return { sections: 0, bars: 0, chords: 0, notes: 0, lyrics: 0 };
  return {
    sections: composition.sections.length,
    bars: composition.sections.reduce((sum, section) => sum + section.bars, 0),
    chords: composition.sections.reduce((sum, section) => sum + (section.chords?.length || section.chord_events?.length || 0), 0),
    notes: composition.sections.reduce((sum, section) => sum + section.melody.length, 0),
    lyrics: composition.lyrics.length
  };
}

export function pitchFrequency(pitch) {
  if (!pitch || pitch === "rest") return null;
  const match = pitch.match(/^([A-G])([#b]?)(-?\d)$/);
  if (!match) return null;
  const [, letter, accidental, octaveRaw] = match;
  const semitoneMap = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const accidentalOffset = accidental === "#" ? 1 : accidental === "b" ? -1 : 0;
  const midi = (Number(octaveRaw) + 1) * 12 + semitoneMap[letter] + accidentalOffset;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function chordRootFrequency(chord) {
  const match = chord?.match(/^([A-G])([#b]?)/);
  if (!match) return null;
  return pitchFrequency(`${match[1]}${match[2]}2`);
}

export function chordPowerFrequencies(chord) {
  const match = chord?.match(/^([A-G])([#b]?)/);
  if (!match) return [];
  const root = pitchFrequency(`${match[1]}${match[2]}3`);
  if (!root) return [];
  return [root, root * 1.5, root * 2];
}

export function styleFamily(composition) {
  const text = [
    composition?.style,
    composition?.mood,
    ...(composition?.style_notes || [])
  ].join(" ").toLowerCase();
  if (text.includes("rock") || text.includes("guitar") || text.includes("riff")) return "rock";
  if (text.includes("edm") || text.includes("drop") || text.includes("sidechain")) return "edm";
  if (text.includes("jazz") || text.includes("swing")) return "jazz";
  return "lo-fi";
}

export function getStyleDefaultInstruments(styleStr) {
  const style = (styleStr || "").trim().toLowerCase();

  let family = "lo-fi";
  if (style.includes("rock") || style.includes("punk") || style.includes("metal") || style.includes("grunge") || style.includes("guitar")) {
    family = "rock";
  } else if (style.includes("edm") || style.includes("house") || style.includes("techno") || style.includes("rave") || style.includes("electronic")) {
    family = "edm";
  } else if (style.includes("jazz") || style.includes("swing") || style.includes("bebop")) {
    family = "jazz";
  } else if (style.includes("folk") || style.includes("acoustic") || style.includes("country") || style.includes("bluegrass")) {
    family = "folk";
  } else if (style.includes("cinematic") || style.includes("strings") || style.includes("orchestral") || style.includes("epic") || style.includes("classical")) {
    family = "cinematic";
  } else if (style.includes("r&b") || style.includes("rnb") || style.includes("groove") || style.includes("soul") || style.includes("hip hop") || style.includes("trap")) {
    family = "r&b";
  } else if (style.includes("pop") || style.includes("radio") || style.includes("catchy") || style.includes("hook")) {
    family = "pop";
  } else if (style.includes("chill") || style.includes("lofi") || style.includes("lo-fi") || style.includes("vinyl") || style.includes("mellow") || style.includes("relaxed")) {
    family = "lo-fi";
  }

  const defaults = {
    rock: { drums: "acoustic_drums", bass: "electric_bass", harmony: "distorted_guitar", melody: "electric_guitar" },
    edm: { drums: "electronic_drums", bass: "synth_bass", harmony: "synth_pad", melody: "piano_lead" },
    jazz: { drums: "brush_drums", bass: "acoustic_bass", harmony: "piano", melody: "piano_lead" },
    folk: { drums: "acoustic_drums", bass: "acoustic_bass", harmony: "acoustic_guitar", melody: "violin_lead" },
    cinematic: { drums: "orchestral_timpani", bass: "acoustic_bass", harmony: "synth_pad", melody: "violin_lead" },
    "r&b": { drums: "808_drums", bass: "electric_bass", harmony: "electric_piano", melody: "vocal_lead" },
    "lo-fi": { drums: "808_drums", bass: "sub_bass", harmony: "electric_piano", melody: "piano_lead" },
    pop: { drums: "electronic_drums", bass: "electric_bass", harmony: "piano", melody: "piano_lead" },
  };

  return defaults[family] || defaults["lo-fi"];
}

export function createManualComposition(input, title) {
  const safeTitle = (title || input.theme || "Untitled Project").trim().slice(0, 80);
  const chords = input.key.includes("minor") ? ["Am", "F", "C", "G"] : ["C", "G", "Am", "F"];
  const melody = input.key.includes("minor")
    ? ["A4", "C5", "E5", "G4", "F4", "E4", "C4", "A3"]
    : ["C4", "E4", "G4", "B4", "A4", "G4", "E4", "C4"];
  const lyricLine = input.custom_lyrics?.trim() || input.theme || "Write your lyric line here";
  return {
    title: safeTitle.length >= 2 ? safeTitle : "New Project",
    style: input.style,
    mood: input.mood,
    key: input.key,
    tempo_bpm: input.tempo_bpm,
    time_signature: input.time_signature,
    sections: [
      {
        name: "Intro",
        bars: input.bars,
        chord_events: chordEventsFromChords(chords, input.time_signature),
        chords,
        melody: melody.map((pitch) => ({ pitch, duration_beats: 1, lyric_syllable: null })),
        lyric_lines: splitLines(lyricLine).slice(0, 4),
        lyric_chord_lines: [`[${chords[0]}]${lyricLine}`]
      }
    ],
    mixer: {
      drums: { volume: 74, pan: "C", instrument: "acoustic_drums" },
      bass: { volume: 82, pan: "L8", instrument: "electric_bass" },
      harmony: { volume: 68, pan: "R6", instrument: "piano" },
      melody: { volume: 88, pan: "C", instrument: "piano_lead" },
      master: { volume: 78, pan: "C", instrument: "master" }
    },
    lyrics: splitLines(lyricLine).slice(0, 4),
    style_notes: ["Manual project starter. Edit chords, melody, lyrics, and arrangement directly."],
    originality_notes: ["User-created manual draft. Review before release."],
    drum_pattern: ["Add drums in the section editor or regenerate arrangement."],
    bassline: ["Follow the chord roots until a bassline is generated."],
    mix_notes: ["Balance channel levels before export."],
    commercial_notes: [],
    agent_trace: ["Manual composition created inside Maestro AI."],
    disclaimer: "Generated or manually edited music may resemble existing works. Review and clear rights before commercial use."
  };
}
