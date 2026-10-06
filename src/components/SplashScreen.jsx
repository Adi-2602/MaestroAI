import { Music } from "lucide-react";

export default function SplashScreen() {
  return (
    <main className="splash-screen" aria-label="Loading Maestro AI">
      <div className="splash-orb">
        <div className="splash-ring" />
        <div className="brand-mark splash-mark"><Music size={34} /></div>
      </div>
      <div className="splash-title">
        <h1>Maestro AI</h1>
        <p>Preparing your composition workspace</p>
      </div>
      <div className="splash-bars" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, index) => <span key={index} />)}
      </div>
    </main>
  );
}
