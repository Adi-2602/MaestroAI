import { useEffect, useMemo, useRef, useState } from "react";
import {
  composeSong,
  createProject,
  createDraft,
  createWorkspace,
  downloadExport,
  evaluateComposition,
  exportCompositionBlob,
  getCurrentUser,
  getDraft,
  getProvider,
  listProjects,
  listDrafts,
  listWorkspaces,
  logoutUser,
  refineSong,
  reviewCommercialReadiness,
  saveDraft,
  updateProject,
  validateComposition
} from "./api.js";
import {
  SESSION_STORAGE_KEY,
  defaultInput,
  STYLE_DEFAULTS
} from "./constants/index.js";
import {
  clone,
  loadSessionState,
  createManualComposition,
  localMetrics
} from "./utils/index.js";

import SplashScreen from "./components/SplashScreen.jsx";
import LandingAuth from "./components/LandingAuth.jsx";
import UserDashboard from "./components/UserDashboard.jsx";
import StudioHeader from "./components/StudioHeader.jsx";
import LeftRail from "./components/LeftRail.jsx";
import ArrangementPane from "./components/ArrangementPane.jsx";
import InspectorPane from "./components/InspectorPane.jsx";
import StudioModals from "./components/StudioModals.jsx";

function App() {
  const initialSession = useMemo(() => loadSessionState(SESSION_STORAGE_KEY), []);
  const [showSplash, setShowSplash] = useState(true);
  const [input, setInput] = useState(defaultInput);
  const [session, setSession] = useState(initialSession);
  const [provider, setProvider] = useState(null);
  const [draftId, setDraftId] = useState("");
  const [composition, setComposition] = useState(null);
  const [quality, setQuality] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [commercialReview, setCommercialReview] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioStopper, setAudioStopper] = useState(null);
  const [renderedAudio, setRenderedAudio] = useState(null);
  const [analysisStamp, setAnalysisStamp] = useState("");
  const [versions, setVersions] = useState(null);
  const [activeTier, setActiveTier] = useState("balanced");
  const qualityRequestRef = useRef(0);
  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [studioOpen, setStudioOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const [activeBrowserTab, setActiveBrowserTab] = useState("browser");
  const [activeDialog, setActiveDialog] = useState("");
  const [dialogInputText, setDialogInputText] = useState("");
  const [dialogTargetItem, setDialogTargetItem] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("maestro-studio-theme") || "dark");
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("maestro-studio-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const token = session?.token || "";
  const workspaceName = selectedWorkspace?.name || "";
  const projectName = selectedProject?.title || "";
  const hasWorkspace = Boolean(selectedWorkspace);
  const hasProject = Boolean(selectedProject);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [session]);

  useEffect(() => {
    if (!activeMenu) return;
    function handleDocumentClick(event) {
      if (!event.target.closest(".daw-menu")) {
        closeMenus();
      }
    }
    function handleDocumentKeyDown(event) {
      if (event.key === "Escape") {
        closeMenus();
      }
    }
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [activeMenu]);

  function closeMenus() {
    setActiveMenu("");
  }

  function toggleMenu(menu) {
    setActiveMenu((current) => (current === menu ? "" : menu));
  }

  function requireWorkspaceProject(action = "compose") {
    if (!hasWorkspace) {
      setError("Create a workspace first from File > New Workspace.");
      return false;
    }
    if (!hasProject) {
      setError(`Create a project first from File > New Project before you ${action}.`);
      return false;
    }
    return true;
  }

  function handleNewWorkspace() {
    setDialogInputText("");
    setActiveDialog("create-workspace");
    closeMenus();
  }

  async function submitCreateWorkspace(e) {
    e?.preventDefault();
    const name = dialogInputText.trim();
    if (!name) return;
    await runWithStatus("workspace-create", async () => {
      stopPreview();
      const workspace = await createWorkspace(token, name);
      setSelectedWorkspace(workspace);
      setProjects([]);
      setSelectedProject(null);
      setStudioOpen(false);
      setDraftId("");
      setComposition(null);
      setVersions(null);
      setRenderedAudio(null);
      setQuality(null);
      setEvaluation(null);
      setCommercialReview(null);
      setStatus(`Workspace "${workspace.name}" created. Now create a project.`);
      setError("");
      setActiveDialog("");
      setDialogInputText("");
      closeMenus();
      await refreshWorkspaces();
    });
  }

  function handleNewProject() {
    if (!hasWorkspace) {
      setError("Create a workspace first from File > New Workspace.");
      closeMenus();
      return;
    }
    setDialogInputText("");
    setActiveDialog("create-project");
    closeMenus();
  }

  async function submitCreateProject(e) {
    e?.preventDefault();
    const title = dialogInputText.trim();
    if (!title) return;
    await runWithStatus("project-create", async () => {
      stopPreview();
      const project = await createProject(token, selectedWorkspace.workspace_id, title);
      setSelectedProject(project);
      setStudioOpen(true);
      setDraftId("");
      setComposition(null);
      setVersions(null);
      setRenderedAudio(null);
      setQuality(null);
      setEvaluation(null);
      setCommercialReview(null);
      setInput((current) => ({ ...current, theme: title }));
      setStatus(`Project "${project.title}" created. Compose manually or generate with AI.`);
      setError("");
      setActiveDialog("");
      setDialogInputText("");
      closeMenus();
      await refreshProjects(selectedWorkspace.workspace_id);
    });
  }

  function handleRenameProject(projectToRename = selectedProject) {
    if (!projectToRename) {
      setError("Create or open a project before renaming it.");
      closeMenus();
      return;
    }
    setDialogInputText(projectToRename.title);
    setDialogTargetItem(projectToRename);
    setActiveDialog("rename-project");
    closeMenus();
  }

  async function submitRenameProject(e) {
    e?.preventDefault();
    const name = dialogInputText.trim();
    const projectToRename = dialogTargetItem || selectedProject;
    if (!name || !projectToRename) return;
    await runWithStatus("project-rename", async () => {
      const project = await updateProject(token, projectToRename.project_id, { title: name });
      if (selectedProject?.project_id === project.project_id) {
        setSelectedProject(project);
        if (composition) updateCompositionField("title", name);
      }
      setStatus(`Project renamed to "${name}".`);
      setActiveDialog("");
      setDialogInputText("");
      setDialogTargetItem(null);
      closeMenus();
      await refreshProjects(project.workspace_id);
    });
  }

  async function handleManualCompose() {
    if (!requireWorkspaceProject("compose manually")) return;
    await runWithStatus("manual-compose", async () => {
      stopPreview();
      const manual = createManualComposition(input, projectName);
      const record = await createDraft(token, manual);
      const project = await updateProject(token, selectedProject.project_id, { draft_id: record.draft_id, title: record.composition.title });
      setSelectedProject(project);
      setDraftId(record.draft_id);
      setComposition(record.composition);
      setVersions(null);
      setRenderedAudio(null);
      setStatus("Manual composition created and saved as an editable project.");
      setError("");
      closeMenus();
      await refreshQuality(record.composition);
      await refreshDrafts();
    });
  }

  function updateChordEvent(sectionIndex, eventIndex, newChord) {
    setRenderedAudio(null);
    setComposition((current) => {
      const next = clone(current);
      const sec = next.sections[sectionIndex];
      if (sec.chord_events && sec.chord_events[eventIndex]) {
        sec.chord_events[eventIndex].chord = newChord;
        sec.chords = sec.chord_events.map((e) => e.chord);
      } else if (sec.chords[eventIndex] !== undefined) {
        sec.chords[eventIndex] = newChord;
      }
      if (versions) setVersions((prev) => ({ ...prev, [activeTier]: next }));
      return next;
    });
  }

  async function handleSelectTier(tier) {
    if (!versions || !versions[tier]) return;
    setActiveTier(tier);
    setComposition(versions[tier]);
    setRenderedAudio(null);
    stopPreview();
    await refreshQuality(versions[tier]);
  }

  useEffect(() => {
    getProvider().then(setProvider).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!token) return;
    getCurrentUser(token)
      .then((user) => setSession((current) => ({ ...current, user })))
      .then(refreshWorkspaces)
      .then(refreshDrafts)
      .catch(() => setSession(null));
  }, [token]);

  useEffect(() => {
    return () => {
      if (renderedAudio?.url) URL.revokeObjectURL(renderedAudio.url);
    };
  }, [renderedAudio]);

  const metrics = useMemo(() => localMetrics(composition), [composition]);

  async function runWithStatus(action, fn) {
    setBusyAction(action);
    setError("");
    setStatus("");
    try {
      await fn();
    } catch (err) {
      setError(typeof err.message === "string" ? err.message : "Something went wrong.");
    } finally {
      setBusyAction("");
    }
  }

  function handleAuth(nextSession) {
    setSession(nextSession);
    setError("");
    setStatus("");
  }

  async function handleLogout() {
    stopPreview();
    if (token) {
      try {
        await logoutUser(token);
      } catch {
        // Clear local session even if server logout fails.
      }
    }
    setSession(null);
    setWorkspaces([]);
    setProjects([]);
    setSelectedWorkspace(null);
    setSelectedProject(null);
    setStudioOpen(false);
    setDraftId("");
    setComposition(null);
    setQuality(null);
    setEvaluation(null);
    setCommercialReview(null);
    setRenderedAudio(null);
  }

  async function refreshWorkspaces() {
    if (!token) return;
    setLoadingWorkspaces(true);
    try {
      const records = await listWorkspaces(token);
      setWorkspaces(records);
      setSelectedWorkspace((current) => current || records[0] || null);
      if (!selectedWorkspace && records[0]) {
        await refreshProjects(records[0].workspace_id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingWorkspaces(false);
    }
  }

  async function refreshProjects(workspaceId = selectedWorkspace?.workspace_id) {
    if (!token || !workspaceId) return;
    setLoadingProjects(true);
    try {
      const records = await listProjects(token, workspaceId);
      setProjects(records);
      setSelectedProject((current) => current || records[0] || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingProjects(false);
    }
  }

  async function selectWorkspace(workspace) {
    await saveCurrentIfPossible();
    stopPreview();
    setSelectedWorkspace(workspace);
    setSelectedProject(null);
    setStudioOpen(false);
    setDraftId("");
    setComposition(null);
    setVersions(null);
    setRenderedAudio(null);
    setQuality(null);
    setEvaluation(null);
    setCommercialReview(null);
    await refreshProjects(workspace.workspace_id);
  }

  async function selectProject(project) {
    await saveCurrentIfPossible();
    stopPreview();
    setSelectedProject(project);
    setVersions(null);
    setRenderedAudio(null);
    setQuality(null);
    setEvaluation(null);
    setCommercialReview(null);
    if (project.draft_id) {
      await openDraft(project.draft_id, project);
    } else {
      setDraftId("");
      setComposition(null);
      setStatus(`Project "${project.title}" selected. Compose manually or generate with AI.`);
    }
  }

  async function openProjectInStudio(project = selectedProject) {
    if (!project) {
      setError("Select or create a project first.");
      return;
    }
    await selectProject(project);
    setStudioOpen(true);
  }

  async function saveCurrentIfPossible() {
    if (!draftId || !composition) return true;
    try {
      const response = await saveDraft(token, draftId, composition);
      if (selectedProject) {
        const linkedProject = await updateProject(token, selectedProject.project_id, { title: response.composition.title, draft_id: draftId });
        setSelectedProject(linkedProject);
      }
      return true;
    } catch (err) {
      setError(typeof err.message === "string" ? err.message : "Could not save draft.");
      return false;
    }
  }

  async function returnToDashboard() {
    const saved = await saveCurrentIfPossible();
    if (saved) setStudioOpen(false);
  }

  async function refreshQuality(nextComposition = composition) {
    if (!nextComposition) return;
    const requestId = ++qualityRequestRef.current;
    const report = await validateComposition(nextComposition);
    if (requestId !== qualityRequestRef.current) return;
    const evalReport = await evaluateComposition(nextComposition);
    if (requestId !== qualityRequestRef.current) return;
    const commercialReport = await reviewCommercialReadiness(nextComposition);
    if (requestId !== qualityRequestRef.current) return;
    setQuality(report);
    setEvaluation(evalReport);
    setCommercialReview(commercialReport);
    setAnalysisStamp(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    return { report, evalReport, commercialReport };
  }

  async function handleAnalyze() {
    if (!composition) return;
    closeMenus();
    await runWithStatus("analyze", async () => {
      const result = await refreshQuality();
      const score = result?.evalReport?.overall_score ?? evaluation?.overall_score;
      setStatus(score ? `Analysis updated. Readiness score: ${score}/100.` : "Analysis updated.");
    });
  }

  async function refreshDrafts() {
    setLoadingDrafts(true);
    try {
      setDrafts(await listDrafts(token));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDrafts(false);
    }
  }

  async function openDraft(recordId, linkedProject = null) {
    await runWithStatus("open-draft", async () => {
      if (draftId && composition && recordId !== draftId) {
        const saved = await saveCurrentIfPossible();
        if (!saved) return;
      }
      try {
        const record = await getDraft(token, recordId);
        if (linkedProject) {
          setSelectedProject(linkedProject);
        } else if (selectedWorkspace && token) {
          const project = await createProject(token, selectedWorkspace.workspace_id, record.composition.title);
          const linked = await updateProject(token, project.project_id, { draft_id: record.draft_id });
          setSelectedProject(linked);
          await refreshProjects(selectedWorkspace.workspace_id);
        }
        setDraftId(record.draft_id);
        setComposition(record.composition);
        setVersions(null);
        setActiveTier("balanced");
        setRenderedAudio(null);
        setStatus("Draft opened.");
        await refreshQuality(record.composition);
      } catch (err) {
        const errMsg = String(err?.message || err || "").toLowerCase();
        if (errMsg.includes("404") || errMsg.includes("not found")) {
          setDraftId("");
          setComposition(null);
          if (linkedProject) {
            const unlinked = await updateProject(token, linkedProject.project_id, { draft_id: null });
            setSelectedProject(unlinked);
            await refreshProjects(linkedProject.workspace_id);
          }
          setStatus("Draft was not found or belongs to another user. Starting a fresh composition.");
        } else {
          throw err;
        }
      }
    });
  }

  async function handleGenerate() {
    if (!requireWorkspaceProject("compose")) return;
    closeMenus();
    setGenerationProgress({ agent: "Coordinator Agent", quote: "Analyzing structural references...", node: "reference" });
    await runWithStatus("generate", async () => {
      try {
        const response = await composeSong(token, input, (progress) => {
          setGenerationProgress(progress);
        });
        const nextComposition = { ...response.composition, title: projectName };
        const nextVersions = response.versions
          ? Object.fromEntries(
              Object.entries(response.versions).map(([tier, comp]) => [tier, { ...comp, title: projectName }])
            )
          : null;
        const linkedProject = await updateProject(token, selectedProject.project_id, { draft_id: response.draft_id, title: nextComposition.title });
        setSelectedProject(linkedProject);
        setDraftId(response.draft_id);
        setComposition(nextComposition);
        setVersions(nextVersions);
        setActiveTier("balanced");
        setRenderedAudio(null);
        setStatus(response.warnings?.length ? response.warnings.join(" ") : "Draft generated.");
        await refreshQuality(nextComposition);
        await refreshDrafts();
        await refreshProjects(selectedWorkspace.workspace_id);
      } finally {
        setGenerationProgress(null);
      }
    });
  }

  function handleStyleChange(style) {
    setInput((current) => {
      const prevStyleDefaults = STYLE_DEFAULTS[current.style] || {};
      const newDefaults = STYLE_DEFAULTS[style] || {};

      // Only overwrite BPM if the user hasn't manually changed it from the previous preset
      const userEditedBpm = current.tempo_bpm !== prevStyleDefaults.tempo_bpm;
      const nextBpm = userEditedBpm ? current.tempo_bpm : (newDefaults.tempo_bpm ?? current.tempo_bpm);

      // Only overwrite instrumentation if the user hasn't manually changed it from the previous preset
      const userEditedInstrumentation = current.instrumentation !== prevStyleDefaults.instrumentation;
      const nextInstrumentation = userEditedInstrumentation
        ? current.instrumentation
        : (newDefaults.instrumentation ?? current.instrumentation);

      // Only overwrite creativity if the user hasn't manually changed it from the previous preset
      const userEditedCreativity = current.creativity !== prevStyleDefaults.creativity;
      const nextCreativity = userEditedCreativity ? current.creativity : (newDefaults.creativity ?? current.creativity);

      return {
        ...current,
        style,
        tempo_bpm: nextBpm,
        instrumentation: nextInstrumentation,
        creativity: nextCreativity,
      };
    });
  }

  async function handleRefine(target) {
    if (!composition) return;
    closeMenus();
    await runWithStatus(target, async () => {
      const response = await refineSong(token, target, composition, `Optimize ${target} for ${composition.style} ${composition.mood}.`);
      if (selectedProject) {
        const linkedProject = await updateProject(token, selectedProject.project_id, { draft_id: response.draft_id, title: response.composition.title });
        setSelectedProject(linkedProject);
        await refreshProjects(linkedProject.workspace_id);
      }
      setDraftId(response.draft_id);
      setComposition(response.composition);
      setVersions(null);
      setActiveTier("balanced");
      setRenderedAudio(null);
      setStatus(response.warnings?.length ? response.warnings.join(" ") : `${target} regenerated.`);
      await refreshQuality(response.composition);
      await refreshDrafts();
    });
  }

  async function handleSave() {
    if (!draftId || !composition) return;
    closeMenus();
    await runWithStatus("save", async () => {
      const response = await saveDraft(token, draftId, composition);
      if (selectedProject) {
        const linkedProject = await updateProject(token, selectedProject.project_id, { title: response.composition.title, draft_id: draftId });
        setSelectedProject(linkedProject);
        await refreshProjects(linkedProject.workspace_id);
      }
      setComposition(response.composition);
      setStatus("Draft saved.");
      await refreshQuality(response.composition);
      await refreshDrafts();
    });
  }

  async function handleSaveAs() {
    if (!composition || !selectedWorkspace) return;
    closeMenus();
    const name = window.prompt("Save as project name", `${composition.title} Copy`);
    if (!name?.trim()) return;
    await runWithStatus("save-as", async () => {
      const nextComposition = { ...clone(composition), title: name.trim() };
      const record = await createDraft(token, nextComposition);
      const project = await createProject(token, selectedWorkspace.workspace_id, name.trim());
      const linkedProject = await updateProject(token, project.project_id, { draft_id: record.draft_id, title: name.trim() });
      setSelectedProject(linkedProject);
      setDraftId(record.draft_id);
      setComposition(record.composition);
      setVersions(null);
      setRenderedAudio(null);
      setStudioOpen(true);
      setStatus(`Saved as "${name.trim()}".`);
      await refreshQuality(record.composition);
      await refreshDrafts();
      await refreshProjects(selectedWorkspace.workspace_id);
    });
  }

  async function handleDownload(path, filename) {
    if (!composition) return;
    await runWithStatus(path, async () => {
      await downloadExport(path, composition, filename);
      setStatus("Export ready.");
    });
  }

  async function handleExportCurrent(path, extension) {
    if (!composition) return;
    closeMenus();
    const exportName = window.prompt("Rename before export", composition.title);
    if (!exportName?.trim()) return;
    await runWithStatus(path, async () => {
      const nextComposition = { ...composition, title: exportName.trim() };
      setComposition(nextComposition);
      if (draftId) {
        await saveDraft(token, draftId, nextComposition);
      }
      if (selectedProject) {
        const linkedProject = await updateProject(token, selectedProject.project_id, { title: exportName.trim(), draft_id: draftId || selectedProject.draft_id });
        setSelectedProject(linkedProject);
        await refreshProjects(linkedProject.workspace_id);
      }
      await downloadExport(path, nextComposition, `${exportName.trim()}.${extension}`);
      setStatus(`Export ready as "${exportName.trim()}".`);
    });
  }

  async function handleExportDraft(recordId, path, filename) {
    await runWithStatus(`export-${recordId}-${path}`, async () => {
      const record = await getDraft(token, recordId);
      const extension = filename.split(".").pop() || "wav";
      const exportName = window.prompt("Rename before export", record.composition.title);
      if (!exportName?.trim()) return;
      await downloadExport(path, { ...record.composition, title: exportName.trim() }, `${exportName.trim()}.${extension}`);
      setStatus(`Exported saved project "${exportName.trim()}".`);
    });
  }

  async function handleRenderAudio() {
    if (!composition) return;
    await runWithStatus("render-audio", async () => {
      const { blob, filename } = await exportCompositionBlob("/export/wav", composition, "composition.wav");
      const url = URL.createObjectURL(blob);
      setRenderedAudio({ url, filename });
      setStatus("Playable WAV rendered.");
    });
  }

  function updateCompositionField(field, value) {
    setRenderedAudio(null);
    setComposition((current) => {
      const next = { ...current, [field]: value };
      if (versions) {
        setVersions((prev) => ({ ...prev, [activeTier]: next }));
      }
      return next;
    });
  }

  function updateMixer(channelKey, field, value) {
    setRenderedAudio(null);
    setComposition((current) => {
      if (!current) return current;
      const next = clone(current);
      if (!next.mixer) {
        next.mixer = {
          drums: { volume: 74, pan: "C" },
          bass: { volume: 82, pan: "L8" },
          harmony: { volume: 68, pan: "R6" },
          melody: { volume: 88, pan: "C" },
          master: { volume: 78, pan: "C" }
        };
      }
      if (!next.mixer[channelKey]) {
        next.mixer[channelKey] = { volume: 80, pan: "C" };
      }
      next.mixer[channelKey][field] = value;
      if (versions) {
        setVersions((prev) => ({ ...prev, [activeTier]: next }));
      }
      return next;
    });
  }

  function updateSection(index, updater) {
    setRenderedAudio(null);
    setComposition((current) => {
      const next = clone(current);
      next.sections[index] = updater(next.sections[index]);
      next.lyrics = next.sections.flatMap((section) => section.lyric_lines);
      if (versions) {
        setVersions((prev) => ({ ...prev, [activeTier]: next }));
      }
      return next;
    });
  }

  function updateComposition(updater) {
    setRenderedAudio(null);
    setComposition((current) => {
      const next = updater(clone(current));
      if (versions) {
        setVersions((prev) => ({ ...prev, [activeTier]: next }));
      }
      return next;
    });
  }

  function stopPreview() {
    if (audioStopper) {
      audioStopper();
      setAudioStopper(null);
    }
    setIsPlaying(false);
  }

  async function playPreview() {
    if (!composition) return;
    if (isPlaying) {
      stopPreview();
      return;
    }
    await runWithStatus("preview-audio", async () => {
      const { blob, filename } = await exportCompositionBlob("/export/wav", composition, "composition.wav");
      const url = URL.createObjectURL(blob);
      const player = new Audio(url);
      player.onended = () => {
        setAudioStopper(null);
        setIsPlaying(false);
      };
      player.onerror = () => {
        setAudioStopper(null);
        setIsPlaying(false);
        setError("Rendered audio could not be played in this browser.");
      };
      setRenderedAudio({ url, filename });
      setAudioStopper(() => () => {
        player.pause();
        player.currentTime = 0;
      });
      await player.play();
      setIsPlaying(true);
      setStatus("SoundFont preview playing.");
    });
  }

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!session) {
    return <LandingAuth onAuth={handleAuth} />;
  }

  return (
    <>
      {!studioOpen ? (
        <UserDashboard
          session={session}
          workspaces={workspaces}
          projects={projects}
          drafts={drafts}
          selectedWorkspace={selectedWorkspace}
          selectedProject={selectedProject}
          busyAction={busyAction}
          onLogout={handleLogout}
          onCreateWorkspace={handleNewWorkspace}
          onCreateProject={handleNewProject}
          onSelectWorkspace={selectWorkspace}
          onOpenProject={openProjectInStudio}
          onRenameProject={handleRenameProject}
          theme={theme}
          onToggleTheme={toggleTheme}
          loadingWorkspaces={loadingWorkspaces}
          loadingProjects={loadingProjects}
          loadingDrafts={loadingDrafts}
        />
      ) : (
        <main className="studio-shell">
          <StudioHeader
            returnToDashboard={returnToDashboard}
            activeMenu={activeMenu}
            toggleMenu={toggleMenu}
            handleNewWorkspace={handleNewWorkspace}
            handleNewProject={handleNewProject}
            hasWorkspace={hasWorkspace}
            hasProject={hasProject}
            setActiveDialog={setActiveDialog}
            closeMenus={closeMenus}
            handleExportCurrent={handleExportCurrent}
            composition={composition}
            busyAction={busyAction}
            handleRenameProject={handleRenameProject}
            handleSave={handleSave}
            draftId={draftId}
            handleSaveAs={handleSaveAs}
            selectedWorkspace={selectedWorkspace}
            drafts={drafts}
            openDraft={openDraft}
            handleManualCompose={handleManualCompose}
            handleGenerate={handleGenerate}
            handleRefine={handleRefine}
            handleAnalyze={handleAnalyze}
            provider={provider}
            theme={theme}
            toggleTheme={toggleTheme}
            handleLogout={handleLogout}
          />

          <section className="studio-layout">
            <LeftRail
              activeBrowserTab={activeBrowserTab}
              setActiveBrowserTab={setActiveBrowserTab}
              session={session}
              workspaceName={workspaceName}
              projectName={projectName}
              workspaces={workspaces}
              handleNewWorkspace={handleNewWorkspace}
              busyAction={busyAction}
              selectedWorkspace={selectedWorkspace}
              selectWorkspace={selectWorkspace}
              projects={projects}
              handleNewProject={handleNewProject}
              hasWorkspace={hasWorkspace}
              selectedProject={selectedProject}
              selectProject={selectProject}
              input={input}
              setInput={setInput}
              handleStyleChange={handleStyleChange}
              handleGenerate={handleGenerate}
              hasProject={hasProject}
              drafts={drafts}
              refreshDrafts={refreshDrafts}
              draftId={draftId}
              openDraft={openDraft}
              composition={composition}
              handleManualCompose={handleManualCompose}
              handleRefine={handleRefine}
              generationProgress={generationProgress}
              provider={provider}
              handleAnalyze={handleAnalyze}
            />

            <ArrangementPane
              workspaceName={workspaceName}
              projectName={projectName}
              composition={composition}
              hasProject={hasProject}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              updateCompositionField={updateCompositionField}
              token={token}
              updateProject={updateProject}
              refreshProjects={refreshProjects}
              setError={setError}
              input={input}
              versions={versions}
              activeTier={activeTier}
              handleSelectTier={handleSelectTier}
              returnToDashboard={returnToDashboard}
              busyAction={busyAction}
              playPreview={playPreview}
              isPlaying={isPlaying}
              handleAnalyze={handleAnalyze}
              handleSave={handleSave}
              draftId={draftId}
              handleSaveAs={handleSaveAs}
              selectedWorkspace={selectedWorkspace}
              error={error}
              status={status}
              hasWorkspace={hasWorkspace}
              metrics={metrics}
              handleRefine={handleRefine}
              updateChordEvent={updateChordEvent}
              renderedAudio={renderedAudio}
              updateMixer={updateMixer}
              updateSection={updateSection}
              updateComposition={updateComposition}
            />

            <InspectorPane
              composition={composition}
              updateCompositionField={updateCompositionField}
              analysisStamp={analysisStamp}
              evaluation={evaluation}
              quality={quality}
              handleRenderAudio={handleRenderAudio}
              busyAction={busyAction}
              handleExportCurrent={handleExportCurrent}
              renderedAudio={renderedAudio}
              commercialReview={commercialReview}
            />
          </section>
        </main>
      )}

      <StudioModals
        activeDialog={activeDialog}
        setActiveDialog={setActiveDialog}
        dialogInputText={dialogInputText}
        setDialogInputText={setDialogInputText}
        setDialogTargetItem={setDialogTargetItem}
        selectedWorkspace={selectedWorkspace}
        workspaces={workspaces}
        selectWorkspace={selectWorkspace}
        selectedProject={selectedProject}
        projects={projects}
        selectProject={selectProject}
        input={input}
        setInput={setInput}
        handleStyleChange={handleStyleChange}
        drafts={drafts}
        openDraft={openDraft}
        handleExportDraft={handleExportDraft}
        busyAction={busyAction}
        submitCreateWorkspace={submitCreateWorkspace}
        submitCreateProject={submitCreateProject}
        submitRenameProject={submitRenameProject}
        generationProgress={generationProgress}
      />
    </>
  );
}

export default App;
