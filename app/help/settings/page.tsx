import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Settings help",
  description: "Guides for lifecycle, templates, gates, roles, exports, and local storage in the workspace.",
};

const sections = [
  {
    title: "Lifecycle configuration",
    body: "Phases, milestones, and transition rules define how work moves through the model. Edit the active lifecycle from Settings → Lifecycle; unlock structural edits when the UI requires it.",
  },
  {
    title: "Template registry",
    body: "Templates bind artifact types to phases and outputs. Keep schema versions accurate so exports and traceability stay aligned.",
  },
  {
    title: "Gate rules",
    body: "Gates capture approvals and required evidence counts. Each rule should list approver roles and at least one evidence requirement.",
  },
  {
    title: "Roles and permissions",
    body: "Roles bundle module permissions. Prefer least privilege; use export-related permissions only where reporting is required.",
  },
  {
    title: "Export settings",
    body: "Formats, package contents, redaction, and naming patterns control evidence bundles. Run a test export before changing production defaults.",
  },
  {
    title: "Local storage",
    body: "Paths, retention, cache, and backup preferences apply to this workspace host. Validate paths and export configuration before destructive resets.",
  },
];

export default function HelpSettingsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 text-slate-800">
      <p className="text-sm font-semibold text-slate-500">
        <Link href="/settings/lifecycle" className="text-blue-600 hover:underline">
          ← Back to settings
        </Link>
      </p>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Settings documentation</h1>
      <p className="mt-2 text-slate-600">
        Short guides for each settings area. For full organizational policy, follow your internal governance library.
      </p>
      <ol className="mt-8 space-y-8">
        {sections.map((s, i) => (
          <li key={s.title} className="scroll-mt-8">
            <h2 className="text-lg font-semibold text-slate-900">
              {i + 1}. {s.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{s.body}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
