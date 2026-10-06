import { AGENTS } from "../constants/index.js";

export default function AgentLoadingOverlay({ progress }) {
  if (!progress) return null;

  return (
    <div className="agent-loading-overlay">
      <div className="agent-circle-container">
        {AGENTS.map((agent, index) => {
          const isActive = progress.node === agent.id;
          const angle = (index / AGENTS.length) * Math.PI * 2 - Math.PI / 2;
          const radius = 140;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={agent.id}
              className={`agent-node ${isActive ? "active" : ""}`}
              style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
            >
              <div className="agent-dot" />
              <span className="agent-label">{agent.name}</span>
            </div>
          );
        })}
        <div className="agent-center-content">
          <h3>{progress.agent}</h3>
          <p>"{progress.quote}"</p>
        </div>
      </div>
    </div>
  );
}
