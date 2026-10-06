export const STYLE_OPTIONS = ["Lo-fi", "Pop", "Rock", "EDM", "Jazz", "R&B", "Folk", "Cinematic"];
export const MOOD_OPTIONS = ["Relaxed", "Sad", "Melancholic", "Hopeful", "Energetic", "Dreamy", "Dark", "Romantic"];
export const MAJOR_KEY_OPTIONS = [
  "C major", "G major", "D major", "A major", "E major", "B major",
  "F major", "Bb major", "Eb major", "Ab major", "Db major", "F# major"
];
export const MINOR_KEY_OPTIONS = [
  "A minor", "E minor", "B minor", "F# minor", "C# minor", "G# minor",
  "D minor", "G minor", "C minor", "F minor", "Bb minor", "Eb minor"
];
// Keep backward-compat alias
export const KEY_OPTIONS = [...MAJOR_KEY_OPTIONS, ...MINOR_KEY_OPTIONS];

export const SESSION_STORAGE_KEY = "maestro-studio-session";
export const WORKSPACE_STORAGE_KEY = "maestro-studio-workspace";

export const AGENTS = [
  { id: "reference", name: "Coordinator" },
  { id: "lyricist", name: "Lyricist" },
  { id: "sentiment", name: "Sentiment" },
  { id: "theorist", name: "Theorist" },
  { id: "composer", name: "Composer" },
  { id: "improvisor", name: "Improvisor" },
  { id: "director", name: "Director" }
];

export const STYLE_DEFAULTS = {
  "Lo-fi": { tempo_bpm: 78, instrumentation: "warm piano, soft bass, brushed drums", creativity: 0.75 },
  Pop: { tempo_bpm: 112, instrumentation: "bright synth bass, punchy drums, layered vocal hook", creativity: 0.72 },
  Rock: { tempo_bpm: 128, instrumentation: "driven electric guitars, live drums, bass riff", creativity: 0.78 },
  EDM: { tempo_bpm: 126, instrumentation: "four-on-floor kick, sidechain synths, risers, drop bass", creativity: 0.8 },
  Jazz: { tempo_bpm: 116, instrumentation: "piano voicings, walking bass, brushed drums, muted horn lead", creativity: 0.82 },
  "R&B": { tempo_bpm: 88, instrumentation: "electric keys, deep groove bass, soft drums, vocal stacks", creativity: 0.78 },
  Folk: { tempo_bpm: 96, instrumentation: "acoustic guitar, warm bass, light percussion, harmony vocal", creativity: 0.68 },
  Cinematic: { tempo_bpm: 72, instrumentation: "strings, low pulse, wide pads, percussion swells", creativity: 0.8 }
};

export const defaultInput = {
  style: "Lo-fi",
  mood: "Relaxed",
  theme: "Rainy night in a quiet city",
  key: "A minor",
  tempo_bpm: 78,
  bars: 8,
  time_signature: "4/4",
  creativity: 0.75,
  instrumentation: "warm piano, soft bass, brushed drums",
  custom_lyrics: ""
};

export const DRUM_OPTIONS = [
  { value: "acoustic_drums", label: "Acoustic Kit" },
  { value: "electric_drums", label: "Electronic Kit" },
  { value: "808_drums", label: "TR-808 Kit" },
  { value: "brush_drums", label: "Jazz Brushes" },
  { value: "orchestral_timpani", label: "Timpani & Cymbal" },
  { value: "tabla_drums", label: "Tabla (Indian Percussion)" },
  { value: "bongo_drums", label: "Bongo & Conga" },
];

export const BASS_OPTIONS = [
  { value: "electric_bass", label: "Electric Bass" },
  { value: "acoustic_bass", label: "Acoustic Bass" },
  { value: "slap_bass", label: "Slap Bass" },
  { value: "synth_bass", label: "Synth Bass" },
  { value: "sub_bass", label: "Sub Bass" }
];

export const HARMONY_OPTIONS = [
  { value: "piano", label: "Acoustic Piano" },
  { value: "electric_piano", label: "Rhodes E-Piano" },
  { value: "acoustic_guitar", label: "Acoustic Guitar" },
  { value: "electric_guitar", label: "Clean E-Guitar" },
  { value: "distorted_guitar", label: "Distorted Guitar" },
  { value: "synth_pad", label: "Synth Pad" },
  { value: "church_organ", label: "Church Organ" },
  { value: "flute", label: "Flute (Harmony)" }
];

export const MELODY_OPTIONS = [
  { value: "piano_lead", label: "Acoustic Piano" },
  { value: "flute_lead", label: "Expressive Flute" },
  { value: "violin_lead", label: "Violin Lead" },
  { value: "electric_guitar", label: "Clean E-Guitar" },
  { value: "distorted_guitar", label: "Distorted Guitar" },
  { value: "sine_lead", label: "Sine Synth" },
  { value: "saw_lead", label: "Saw Synth" },
  { value: "square_lead", label: "Square Synth" },
  { value: "vocal_lead", label: "Vocal Synth" }
];
