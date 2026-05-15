"use client";

import { useEffect, useRef, useState } from "react";
import { GripVertical, Plus, X } from "lucide-react";

import { Badge, SectionHeader, settingsStatusBadgeMap } from "@/components/settings/shared";
import { Button } from "@/components/ui/button";
import { emptyPhaseExtended } from "@/lib/lifecycle-settings-defaults";
import { cn } from "@/lib/utils";
import type {
  GateRuleSetting,
  LifecycleConfigurationBlock,
  LifecycleMilestone,
  LifecyclePhaseSetting,
  LifecycleTransitionRule,
  TemplateRegistryItem,
} from "@/types/settings.types";

function parseCommaList(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function SettingsDialog({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) node.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="w-[min(100vw-2rem,520px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40"
      aria-labelledby="lifecycle-dialog-title"
    >
      <div className="flex max-h-[min(90vh,720px)] flex-col">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 id="lifecycle-dialog-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        <footer className="flex shrink-0 justify-end gap-2 border-t border-slate-100 px-5 py-4">{footer}</footer>
      </div>
    </dialog>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        props.className,
      )}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[88px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        props.className,
      )}
    />
  );
}

export function LifecycleConfigurationPanel({
  lifecycleConfiguration,
  gateRules,
  templateRegistry,
  onPatchLifecycle,
}: {
  lifecycleConfiguration: LifecycleConfigurationBlock;
  gateRules: GateRuleSetting[];
  templateRegistry: TemplateRegistryItem[];
  onPatchLifecycle: (recipe: (c: LifecycleConfigurationBlock) => LifecycleConfigurationBlock) => void;
}) {
  const { phases, lastUpdatedLabel, configurationEditUnlocked, milestones, transitionRules } = lifecycleConfiguration;
  const [activeTab, setActiveTab] = useState("lifecycle-phases");

  const [unlockOpen, setUnlockOpen] = useState(false);
  const [unlockReason, setUnlockReason] = useState("");

  const [addPhaseOpen, setAddPhaseOpen] = useState(false);
  const [phaseDraft, setPhaseDraft] = useState({
    name: "",
    description: "",
    keyDeliverables: "",
    requiredArtifactIds: "",
    requiredEvidenceCount: "0",
    entryCriteria: "",
    exitCriteria: "",
    relatedGateCode: "",
    requiredTemplates: "",
  });

  const [drawerPhaseId, setDrawerPhaseId] = useState<string | null>(null);
  const [editModalPhaseId, setEditModalPhaseId] = useState<string | null>(null);

  const [reorderPhaseId, setReorderPhaseId] = useState<string | null>(null);
  const [reorderTarget, setReorderTarget] = useState(1);

  const [addMilestoneOpen, setAddMilestoneOpen] = useState(false);
  const [milestoneDraft, setMilestoneDraft] = useState({
    name: "",
    phaseNumber: 1,
    description: "",
    completionCriteria: "",
    requiredArtifactIds: "",
    requiredEvidenceCount: "0",
  });

  const [addTransitionOpen, setAddTransitionOpen] = useState(false);
  const [transitionDraft, setTransitionDraft] = useState({
    fromPhaseNumber: 1,
    toPhaseNumber: 2,
    triggerCondition: "",
    requiredGateCode: "",
    requiredArtifactIds: "",
    requiredEvidenceCount: "0",
    blockingConditions: "",
  });

  const [deactivatePhaseId, setDeactivatePhaseId] = useState<string | null>(null);
  const [deactivateReason, setDeactivateReason] = useState("");

  const [drawerDraft, setDrawerDraft] = useState<LifecyclePhaseSetting | null>(null);
  const [editDraft, setEditDraft] = useState<LifecyclePhaseSetting | null>(null);

  useEffect(() => {
    if (!drawerPhaseId) {
      setDrawerDraft(null);
      return;
    }
    const p = phases.find((x) => x.id === drawerPhaseId);
    setDrawerDraft(p ? { ...p } : null);
  }, [drawerPhaseId, phases]);

  useEffect(() => {
    if (!editModalPhaseId) {
      setEditDraft(null);
      return;
    }
    const p = phases.find((x) => x.id === editModalPhaseId);
    setEditDraft(p ? { ...p } : null);
  }, [editModalPhaseId, phases]);

  const reorderPhase = reorderPhaseId ? phases.find((p) => p.id === reorderPhaseId) : undefined;
  const deactivatePhase = deactivatePhaseId ? phases.find((p) => p.id === deactivatePhaseId) : undefined;

  const templatesForPhase = (phaseNumber: number) =>
    templateRegistry.filter((t) => t.phaseNumber === phaseNumber).map((t) => t.templateCode);

  const gatesAffectedByPhase = (phaseNumber: number) =>
    gateRules.filter((g) => g.relatedPhaseNumber === phaseNumber || g.unlocksPhaseNumber === phaseNumber);

  const setUnlocked = (next: boolean) => {
    onPatchLifecycle((c) => ({ ...c, configurationEditUnlocked: next }));
  };

  const openUnlockOrToggleLock = () => {
    if (configurationEditUnlocked) {
      setUnlocked(false);
      return;
    }
    setUnlockReason("");
    setUnlockOpen(true);
  };

  const confirmUnlock = () => {
    setUnlocked(true);
    setUnlockOpen(false);
    setUnlockReason("");
  };

  const submitAddPhase = () => {
    if (!phaseDraft.name.trim()) return;
    onPatchLifecycle((c) => {
      const nextNumber = c.phases.length > 0 ? Math.max(...c.phases.map((p) => p.phaseNumber)) + 1 : 1;
      const nextId = `phase-${Date.now()}`;
      const nextPhase: LifecyclePhaseSetting = {
        id: nextId,
        phaseNumber: nextNumber,
        name: phaseDraft.name.trim(),
        description: phaseDraft.description.trim() || "New lifecycle phase",
        keyDeliverables: parseCommaList(phaseDraft.keyDeliverables).length
          ? parseCommaList(phaseDraft.keyDeliverables)
          : ["Define deliverables"],
        requiredArtifactIds: parseCommaList(phaseDraft.requiredArtifactIds),
        status: "draft",
        canEdit: true,
        canReorder: true,
        extended: {
          ...emptyPhaseExtended(),
          entryCriteria: phaseDraft.entryCriteria.trim(),
          exitCriteria: phaseDraft.exitCriteria.trim(),
          requiredEvidenceCount: Math.max(0, Number.parseInt(phaseDraft.requiredEvidenceCount, 10) || 0),
          relatedGateCode: phaseDraft.relatedGateCode.trim(),
          requiredTemplateIds: parseCommaList(phaseDraft.requiredTemplates),
        },
      };
      return {
        ...c,
        phases: [...c.phases, nextPhase],
        totalPhases: c.phases.length + 1,
      };
    });
    setAddPhaseOpen(false);
    setPhaseDraft({
      name: "",
      description: "",
      keyDeliverables: "",
      requiredArtifactIds: "",
      requiredEvidenceCount: "0",
      entryCriteria: "",
      exitCriteria: "",
      relatedGateCode: "",
      requiredTemplates: "",
    });
  };

  const applyReorder = () => {
    if (!reorderPhase) return;
    const ordered = [...phases].sort((a, b) => a.phaseNumber - b.phaseNumber);
    const idx = ordered.findIndex((p) => p.id === reorderPhase.id);
    if (idx < 0) return;
    const targetIdx = Math.min(Math.max(0, reorderTarget - 1), ordered.length - 1);
    if (idx === targetIdx) {
      setReorderPhaseId(null);
      return;
    }
    const next = [...ordered];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    const renumbered = next.map((p, i) => ({ ...p, phaseNumber: i + 1, id: `phase-${i + 1}` }));
    onPatchLifecycle((c) => ({ ...c, phases: renumbered }));
    setReorderPhaseId(null);
  };

  const submitMilestone = () => {
    if (!milestoneDraft.name.trim()) return;
    const row: LifecycleMilestone = {
      id: `milestone-${Date.now()}`,
      name: milestoneDraft.name.trim(),
      phaseNumber: milestoneDraft.phaseNumber,
      description: milestoneDraft.description.trim(),
      completionCriteria: milestoneDraft.completionCriteria.trim(),
      requiredArtifactIds: parseCommaList(milestoneDraft.requiredArtifactIds),
      requiredEvidenceCount: Math.max(0, Number.parseInt(milestoneDraft.requiredEvidenceCount, 10) || 0),
    };
    onPatchLifecycle((c) => ({ ...c, milestones: [...c.milestones, row] }));
    setAddMilestoneOpen(false);
    setMilestoneDraft({
      name: "",
      phaseNumber: 1,
      description: "",
      completionCriteria: "",
      requiredArtifactIds: "",
      requiredEvidenceCount: "0",
    });
  };

  const submitTransition = () => {
    const row: LifecycleTransitionRule = {
      id: `transition-${Date.now()}`,
      fromPhaseNumber: transitionDraft.fromPhaseNumber,
      toPhaseNumber: transitionDraft.toPhaseNumber,
      triggerCondition: transitionDraft.triggerCondition.trim(),
      requiredGateCode: transitionDraft.requiredGateCode.trim(),
      requiredArtifactIds: parseCommaList(transitionDraft.requiredArtifactIds),
      requiredEvidenceCount: Math.max(0, Number.parseInt(transitionDraft.requiredEvidenceCount, 10) || 0),
      blockingConditions: transitionDraft.blockingConditions.trim(),
    };
    onPatchLifecycle((c) => ({ ...c, transitionRules: [...c.transitionRules, row] }));
    setAddTransitionOpen(false);
    setTransitionDraft({
      fromPhaseNumber: 1,
      toPhaseNumber: 2,
      triggerCondition: "",
      requiredGateCode: "",
      requiredArtifactIds: "",
      requiredEvidenceCount: "0",
      blockingConditions: "",
    });
  };

  const confirmDeactivate = () => {
    if (!deactivatePhase) return;
    onPatchLifecycle((c) => ({
      ...c,
      phases: c.phases.map((p) =>
        p.id === deactivatePhase.id ? { ...p, status: "inactive" as const } : p,
      ),
    }));
    setDeactivatePhaseId(null);
    setDeactivateReason("");
  };

  const saveDrawerPhase = (next: LifecyclePhaseSetting) => {
    onPatchLifecycle((c) => ({
      ...c,
      phases: c.phases.map((p) => (p.id === next.id ? next : p)),
    }));
    setDrawerPhaseId(null);
  };

  const saveEditModal = () => {
    if (!editDraft) return;
    onPatchLifecycle((c) => ({
      ...c,
      phases: c.phases.map((p) => (p.id === editDraft.id ? editDraft : p)),
    }));
    setEditModalPhaseId(null);
  };

  const phaseSelectOptions = phases.map((p) => (
    <option key={p.id} value={p.phaseNumber}>
      {p.phaseNumber}: {p.name}
    </option>
  ));

  const gateOptions = gateRules.map((g) => (
    <option key={g.id} value={g.gateCode}>
      {g.gateCode} — {g.gateName}
    </option>
  ));

  const lockedHint = !configurationEditUnlocked;

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <SectionHeader
        title="Lifecycle Configuration"
        description="Configure phases, milestones, artifacts, and lifecycle behavior."
        actionLabel={configurationEditUnlocked ? "Lock editing" : "Edit Configuration"}
        onActionClick={openUnlockOrToggleLock}
      />
      {lockedHint ? (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Configuration editing is locked. Use <strong>Edit Configuration</strong> to review impact and unlock.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Lifecycle configuration tabs">
        {[
          ["lifecycle-phases", "Lifecycle Phases"],
          ["milestones", "Milestones"],
          ["artifacts", "Artifacts"],
          ["transitions", "Transitions"],
          ["general-rules", "General Rules"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`lifecycle-tab-${id}`}
            aria-selected={activeTab === id}
            aria-controls={`lifecycle-tabpanel-${id}`}
            onClick={() => setActiveTab(id)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
              activeTab === id
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "lifecycle-phases" ? (
        <div
          role="tabpanel"
          id="lifecycle-tabpanel-lifecycle-phases"
          aria-labelledby="lifecycle-tab-lifecycle-phases"
          className="mt-4 flex flex-1 flex-col"
        >
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-900">
            Define and manage lifecycle phases and their order. Click a row to open the phase drawer.
          </div>
          <div className="mt-4 overflow-x-auto">
            {phases.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p>No lifecycle phases are configured.</p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-3"
                  disabled={!configurationEditUnlocked}
                  onClick={() => setAddPhaseOpen(true)}
                >
                  Add First Phase
                </Button>
              </div>
            ) : (
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="pb-2">#</th>
                    <th className="pb-2">Phase Name</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2">Key Deliverables</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {phases.map((phase) => (
                    <tr
                      key={phase.id}
                      className={cn(
                        "border-t border-slate-100",
                        configurationEditUnlocked ? "cursor-pointer hover:bg-slate-50/80" : "",
                      )}
                      onClick={() => {
                        setDrawerPhaseId(phase.id);
                      }}
                    >
                      <td className="py-2 font-semibold text-slate-700">{phase.phaseNumber}</td>
                      <td className="py-2 font-semibold text-slate-900">{phase.name}</td>
                      <td className="py-2 text-slate-600">{phase.description}</td>
                      <td className="py-2 text-slate-600">{phase.keyDeliverables.join(", ")}</td>
                      <td className="py-2">
                        <Badge {...settingsStatusBadgeMap[phase.status]} />
                      </td>
                      <td className="py-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setDrawerPhaseId(phase.id)}
                            className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            disabled={!configurationEditUnlocked}
                            onClick={() => setEditModalPhaseId(phase.id)}
                            className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Edit ${phase.name}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={!configurationEditUnlocked || !phase.canReorder}
                            onClick={() => {
                              setReorderPhaseId(phase.id);
                              setReorderTarget(phase.phaseNumber);
                            }}
                            className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Reorder ${phase.name}`}
                          >
                            <GripVertical className="size-3.5 text-slate-400" aria-hidden />
                            Reorder
                          </button>
                          <button
                            type="button"
                            disabled={!configurationEditUnlocked || phase.status === "inactive"}
                            onClick={() => setDeactivatePhaseId(phase.id)}
                            className="rounded border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-800 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Deactivate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="mt-auto flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!configurationEditUnlocked}
              onClick={() => setAddPhaseOpen(true)}
            >
              <Plus className="size-3.5" aria-hidden />
              Add Phase
            </Button>
            <p className="text-xs text-slate-500">Last updated: {lastUpdatedLabel}</p>
          </div>
        </div>
      ) : activeTab === "milestones" ? (
        <div
          role="tabpanel"
          id="lifecycle-tabpanel-milestones"
          aria-labelledby="lifecycle-tab-milestones"
          className="mt-4 space-y-4"
        >
          <p className="text-sm text-slate-600">
            Milestones anchor delivery checkpoints to phases. Add milestones here; they persist with Save in the action
            bar.
          </p>
          {milestones.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No milestones yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {milestones.map((m) => (
                <li key={m.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <span className="font-semibold text-slate-900">{m.name}</span>
                  <span className="text-slate-500"> — Phase {m.phaseNumber}</span>
                  <p className="mt-1 text-xs text-slate-600">{m.description}</p>
                </li>
              ))}
            </ul>
          )}
          <Button
            type="button"
            size="sm"
            disabled={!configurationEditUnlocked}
            onClick={() => {
              setMilestoneDraft((d) => ({ ...d, phaseNumber: phases[0]?.phaseNumber ?? 1 }));
              setAddMilestoneOpen(true);
            }}
          >
            <Plus className="size-3.5" aria-hidden />
            Add Milestone
          </Button>
        </div>
      ) : activeTab === "transitions" ? (
        <div
          role="tabpanel"
          id="lifecycle-tabpanel-transitions"
          aria-labelledby="lifecycle-tab-transitions"
          className="mt-4 space-y-4"
        >
          <p className="text-sm text-slate-600">
            Transition rules describe how work moves between phases and which gates or evidence are required.
          </p>
          {transitionRules.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No transition rules yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {transitionRules.map((t) => (
                <li key={t.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <span className="font-semibold text-slate-900">
                    Phase {t.fromPhaseNumber} → Phase {t.toPhaseNumber}
                  </span>
                  {t.requiredGateCode ? (
                    <span className="text-slate-500"> — Gate {t.requiredGateCode}</span>
                  ) : null}
                  <p className="mt-1 text-xs text-slate-600">{t.triggerCondition || "—"}</p>
                </li>
              ))}
            </ul>
          )}
          <Button
            type="button"
            size="sm"
            disabled={!configurationEditUnlocked}
            onClick={() => {
              const sorted = [...phases].sort((a, b) => a.phaseNumber - b.phaseNumber);
              const a = sorted[0]?.phaseNumber ?? 1;
              const b = sorted[1]?.phaseNumber ?? Math.min(a + 1, 14);
              setTransitionDraft((d) => ({
                ...d,
                fromPhaseNumber: a,
                toPhaseNumber: b !== a ? b : Math.min(a + 1, 14),
              }));
              setAddTransitionOpen(true);
            }}
          >
            <Plus className="size-3.5" aria-hidden />
            Add Transition Rule
          </Button>
        </div>
      ) : (
        <div
          role="tabpanel"
          id={`lifecycle-tabpanel-${activeTab}`}
          aria-labelledby={`lifecycle-tab-${activeTab}`}
          className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
        >
          {activeTab === "artifacts"
            ? "Link required artifacts per phase from the phase drawer (Required artifacts). Full matrix editing ships next."
            : "General lifecycle rules (SLA, branching, compliance hooks) are managed here in a future pass."}
        </div>
      )}

      <SettingsDialog
        open={unlockOpen}
        title="Unlock configuration editing"
        onClose={() => setUnlockOpen(false)}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setUnlockOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" onClick={confirmUnlock}>
              Unlock
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            <strong>Current status:</strong> {configurationEditUnlocked ? "Unlocked" : "Locked (recommended for production)"}
          </p>
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Editing lifecycle phases can affect gates, templates, and active projects. Coordinate with governance before
            unlocking.
          </p>
          <div>
            <strong className="text-slate-900">Impact summary</strong>
            <ul className="mt-1 list-inside list-disc text-xs text-slate-600">
              <li>Phase order changes may remap gate dependencies.</li>
              <li>Template registry entries scoped to phases may need review.</li>
              <li>In-flight projects inherit changes on next workspace sync.</li>
            </ul>
          </div>
          <div>
            <FieldLabel>Optional reason for change</FieldLabel>
            <TextArea value={unlockReason} onChange={(e) => setUnlockReason(e.target.value)} placeholder="e.g. Q2 process alignment" />
          </div>
        </div>
      </SettingsDialog>

      <SettingsDialog
        open={addPhaseOpen}
        title="Add lifecycle phase"
        onClose={() => setAddPhaseOpen(false)}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setAddPhaseOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" onClick={submitAddPhase}>
              Add Phase
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <FieldLabel>Phase name</FieldLabel>
            <TextInput value={phaseDraft.name} onChange={(e) => setPhaseDraft((d) => ({ ...d, name: e.target.value }))} />
          </div>
          <div>
            <FieldLabel>Description</FieldLabel>
            <TextArea value={phaseDraft.description} onChange={(e) => setPhaseDraft((d) => ({ ...d, description: e.target.value }))} />
          </div>
          <div>
            <FieldLabel>Key deliverables (comma-separated)</FieldLabel>
            <TextInput
              value={phaseDraft.keyDeliverables}
              onChange={(e) => setPhaseDraft((d) => ({ ...d, keyDeliverables: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel>Required artifact IDs (comma-separated)</FieldLabel>
            <TextInput
              value={phaseDraft.requiredArtifactIds}
              onChange={(e) => setPhaseDraft((d) => ({ ...d, requiredArtifactIds: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel>Required evidence count</FieldLabel>
            <TextInput
              inputMode="numeric"
              value={phaseDraft.requiredEvidenceCount}
              onChange={(e) => setPhaseDraft((d) => ({ ...d, requiredEvidenceCount: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel>Entry criteria</FieldLabel>
            <TextArea value={phaseDraft.entryCriteria} onChange={(e) => setPhaseDraft((d) => ({ ...d, entryCriteria: e.target.value }))} />
          </div>
          <div>
            <FieldLabel>Exit criteria</FieldLabel>
            <TextArea value={phaseDraft.exitCriteria} onChange={(e) => setPhaseDraft((d) => ({ ...d, exitCriteria: e.target.value }))} />
          </div>
          <div>
            <FieldLabel>Related gate code</FieldLabel>
            <TextInput
              value={phaseDraft.relatedGateCode}
              onChange={(e) => setPhaseDraft((d) => ({ ...d, relatedGateCode: e.target.value }))}
              placeholder="e.g. G3"
            />
          </div>
          <div>
            <FieldLabel>Required template codes (comma-separated)</FieldLabel>
            <TextInput
              value={phaseDraft.requiredTemplates}
              onChange={(e) => setPhaseDraft((d) => ({ ...d, requiredTemplates: e.target.value }))}
            />
          </div>
        </div>
      </SettingsDialog>

      <SettingsDialog
        open={Boolean(drawerDraft)}
        title={drawerDraft ? `Phase — ${drawerDraft.name}` : "Phase"}
        onClose={() => setDrawerPhaseId(null)}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setDrawerPhaseId(null)}>
              Close
            </Button>
            {configurationEditUnlocked && drawerDraft ? (
              <Button
                type="button"
                className="bg-[#2563eb] hover:bg-[#1d4ed8]"
                onClick={() => {
                  saveDrawerPhase(drawerDraft);
                }}
              >
                Save
              </Button>
            ) : null}
          </>
        }
      >
        {drawerDraft ? (
          <PhaseDrawerBody
            value={drawerDraft}
            onChange={setDrawerDraft}
            readOnly={!configurationEditUnlocked}
            templatesLabel={templatesForPhase(drawerDraft.phaseNumber).join(", ") || "—"}
            gatesLabel={
              gatesAffectedByPhase(drawerDraft.phaseNumber)
                .map((g) => g.gateCode)
                .join(", ") || "—"
            }
          />
        ) : null}
      </SettingsDialog>

      <SettingsDialog
        open={Boolean(editDraft)}
        title={editDraft ? `Edit phase — ${editDraft.name}` : "Edit phase"}
        onClose={() => setEditModalPhaseId(null)}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setEditModalPhaseId(null)}>
              Cancel
            </Button>
            {editDraft ? (
              <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" onClick={saveEditModal}>
                Save
              </Button>
            ) : null}
          </>
        }
      >
        {editDraft ? <PhaseEditFields value={editDraft} onChange={setEditDraft} /> : null}
      </SettingsDialog>

      <SettingsDialog
        open={Boolean(reorderPhase)}
        title="Confirm phase reorder"
        onClose={() => setReorderPhaseId(null)}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setReorderPhaseId(null)}>
              Cancel
            </Button>
            <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" onClick={applyReorder}>
              Confirm reorder
            </Button>
          </>
        }
      >
        {reorderPhase ? (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Reordering updates phase numbers for <strong>{reorderPhase.name}</strong> and may shift downstream gates
              and templates.
            </p>
            <div>
              <FieldLabel>New position (1–{phases.length})</FieldLabel>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                value={reorderTarget}
                onChange={(e) => setReorderTarget(Number.parseInt(e.target.value, 10))}
              >
                {phases.map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <strong className="text-slate-900">Affected gates</strong>
              <p className="text-xs text-slate-600">
                {gatesAffectedByPhase(reorderPhase.phaseNumber).map((g) => g.gateCode).join(", ") || "None detected"}
              </p>
            </div>
            <div>
              <strong className="text-slate-900">Affected templates (same phase number)</strong>
              <p className="text-xs text-slate-600">{templatesForPhase(reorderPhase.phaseNumber).join(", ") || "None"}</p>
            </div>
            <p className="text-xs text-slate-500">Active projects: verify in workspace after save (summary only).</p>
          </div>
        ) : null}
      </SettingsDialog>

      <SettingsDialog
        open={addMilestoneOpen}
        title="Add milestone"
        onClose={() => setAddMilestoneOpen(false)}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setAddMilestoneOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" onClick={submitMilestone}>
              Add Milestone
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <FieldLabel>Milestone name</FieldLabel>
            <TextInput value={milestoneDraft.name} onChange={(e) => setMilestoneDraft((d) => ({ ...d, name: e.target.value }))} />
          </div>
          <div>
            <FieldLabel>Related phase</FieldLabel>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              value={milestoneDraft.phaseNumber}
              onChange={(e) => setMilestoneDraft((d) => ({ ...d, phaseNumber: Number.parseInt(e.target.value, 10) }))}
            >
              {phaseSelectOptions}
            </select>
          </div>
          <div>
            <FieldLabel>Description</FieldLabel>
            <TextArea value={milestoneDraft.description} onChange={(e) => setMilestoneDraft((d) => ({ ...d, description: e.target.value }))} />
          </div>
          <div>
            <FieldLabel>Completion criteria</FieldLabel>
            <TextArea
              value={milestoneDraft.completionCriteria}
              onChange={(e) => setMilestoneDraft((d) => ({ ...d, completionCriteria: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel>Required artifact IDs (comma-separated)</FieldLabel>
            <TextInput
              value={milestoneDraft.requiredArtifactIds}
              onChange={(e) => setMilestoneDraft((d) => ({ ...d, requiredArtifactIds: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel>Required evidence count</FieldLabel>
            <TextInput
              value={milestoneDraft.requiredEvidenceCount}
              onChange={(e) => setMilestoneDraft((d) => ({ ...d, requiredEvidenceCount: e.target.value }))}
            />
          </div>
        </div>
      </SettingsDialog>

      <SettingsDialog
        open={addTransitionOpen}
        title="Add transition rule"
        onClose={() => setAddTransitionOpen(false)}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setAddTransitionOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" onClick={submitTransition}>
              Save rule
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>From phase</FieldLabel>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                value={transitionDraft.fromPhaseNumber}
                onChange={(e) =>
                  setTransitionDraft((d) => ({ ...d, fromPhaseNumber: Number.parseInt(e.target.value, 10) }))
                }
              >
                {phaseSelectOptions}
              </select>
            </div>
            <div>
              <FieldLabel>To phase</FieldLabel>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                value={transitionDraft.toPhaseNumber}
                onChange={(e) =>
                  setTransitionDraft((d) => ({ ...d, toPhaseNumber: Number.parseInt(e.target.value, 10) }))
                }
              >
                {phaseSelectOptions}
              </select>
            </div>
          </div>
          <div>
            <FieldLabel>Trigger condition</FieldLabel>
            <TextArea
              value={transitionDraft.triggerCondition}
              onChange={(e) => setTransitionDraft((d) => ({ ...d, triggerCondition: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel>Required gate</FieldLabel>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              value={transitionDraft.requiredGateCode}
              onChange={(e) => setTransitionDraft((d) => ({ ...d, requiredGateCode: e.target.value }))}
            >
              <option value="">—</option>
              {gateOptions}
            </select>
          </div>
          <div>
            <FieldLabel>Required artifact IDs (comma-separated)</FieldLabel>
            <TextInput
              value={transitionDraft.requiredArtifactIds}
              onChange={(e) => setTransitionDraft((d) => ({ ...d, requiredArtifactIds: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel>Required evidence count</FieldLabel>
            <TextInput
              value={transitionDraft.requiredEvidenceCount}
              onChange={(e) => setTransitionDraft((d) => ({ ...d, requiredEvidenceCount: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel>Blocking conditions</FieldLabel>
            <TextArea
              value={transitionDraft.blockingConditions}
              onChange={(e) => setTransitionDraft((d) => ({ ...d, blockingConditions: e.target.value }))}
            />
          </div>
        </div>
      </SettingsDialog>

      <SettingsDialog
        open={Boolean(deactivatePhase)}
        title="Deactivate phase"
        onClose={() => setDeactivatePhaseId(null)}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setDeactivatePhaseId(null)}>
              Cancel
            </Button>
            <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={confirmDeactivate}>
              Deactivate
            </Button>
          </>
        }
      >
        {deactivatePhase ? (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              You are about to deactivate <strong>{deactivatePhase.name}</strong> (phase {deactivatePhase.phaseNumber}).
            </p>
            <div>
              <strong className="text-slate-900">Dependent templates</strong>
              <p className="text-xs text-slate-600">{templatesForPhase(deactivatePhase.phaseNumber).join(", ") || "None"}</p>
            </div>
            <div>
              <strong className="text-slate-900">Dependent gates</strong>
              <p className="text-xs text-slate-600">
                {gatesAffectedByPhase(deactivatePhase.phaseNumber)
                  .map((g) => g.gateCode)
                  .join(", ") || "None"}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Active projects: review workspace assignments before deactivating (summary only).
            </p>
            <div>
              <FieldLabel>Deactivation reason</FieldLabel>
              <TextArea value={deactivateReason} onChange={(e) => setDeactivateReason(e.target.value)} placeholder="Required for audit trail" />
            </div>
          </div>
        ) : null}
      </SettingsDialog>
    </section>
  );
}

function PhaseDrawerBody({
  value,
  onChange,
  readOnly,
  templatesLabel,
  gatesLabel,
}: {
  value: LifecyclePhaseSetting;
  onChange: (next: LifecyclePhaseSetting) => void;
  readOnly: boolean;
  templatesLabel: string;
  gatesLabel: string;
}) {
  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
        <div>
          <span className="font-semibold text-slate-800">Phase ID</span>
          <p>{value.id}</p>
        </div>
        <div>
          <span className="font-semibold text-slate-800">Order</span>
          <p>{value.phaseNumber}</p>
        </div>
      </div>
      <div>
        <FieldLabel>Name</FieldLabel>
        <TextInput
          disabled={readOnly}
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
      </div>
      <div>
        <FieldLabel>Description</FieldLabel>
        <TextArea
          disabled={readOnly}
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </div>
      <div>
        <FieldLabel>Required templates (codes)</FieldLabel>
        <p className="text-xs text-slate-600">{templatesLabel}</p>
        <TextInput
          disabled={readOnly}
          value={value.extended.requiredTemplateIds.join(", ")}
          onChange={(e) =>
            onChange({
              ...value,
              extended: {
                ...value.extended,
                requiredTemplateIds: parseCommaList(e.target.value),
              },
            })
          }
        />
      </div>
      <div>
        <FieldLabel>Required artifact IDs (comma-separated)</FieldLabel>
        <TextInput
          disabled={readOnly}
          value={value.requiredArtifactIds.join(", ")}
          onChange={(e) => onChange({ ...value, requiredArtifactIds: parseCommaList(e.target.value) })}
        />
      </div>
      <div>
        <FieldLabel>Required evidence count</FieldLabel>
        <TextInput
          disabled={readOnly}
          inputMode="numeric"
          value={String(value.extended.requiredEvidenceCount)}
          onChange={(e) =>
            onChange({
              ...value,
              extended: {
                ...value.extended,
                requiredEvidenceCount: Math.max(0, Number.parseInt(e.target.value, 10) || 0),
              },
            })
          }
        />
      </div>
      <div>
        <FieldLabel>Entry criteria</FieldLabel>
        <TextArea
          disabled={readOnly}
          value={value.extended.entryCriteria}
          onChange={(e) =>
            onChange({
              ...value,
              extended: { ...value.extended, entryCriteria: e.target.value },
            })
          }
        />
      </div>
      <div>
        <FieldLabel>Exit criteria</FieldLabel>
        <TextArea
          disabled={readOnly}
          value={value.extended.exitCriteria}
          onChange={(e) =>
            onChange({
              ...value,
              extended: { ...value.extended, exitCriteria: e.target.value },
            })
          }
        />
      </div>
      <div>
        <FieldLabel>Gate dependency</FieldLabel>
        <p className="text-xs text-slate-600">Related gates: {gatesLabel}</p>
        <TextInput
          disabled={readOnly}
          value={value.extended.relatedGateCode}
          onChange={(e) =>
            onChange({
              ...value,
              extended: { ...value.extended, relatedGateCode: e.target.value },
            })
          }
          placeholder="Primary gate code"
        />
      </div>
      <div>
        <FieldLabel>Transition rules (summary)</FieldLabel>
        <TextArea
          disabled={readOnly}
          value={value.extended.transitionRulesSummary}
          onChange={(e) =>
            onChange({
              ...value,
              extended: { ...value.extended, transitionRulesSummary: e.target.value },
            })
          }
        />
      </div>
      <div>
        <FieldLabel>Key deliverables (comma-separated)</FieldLabel>
        <TextInput
          disabled={readOnly}
          value={value.keyDeliverables.join(", ")}
          onChange={(e) => onChange({ ...value, keyDeliverables: parseCommaList(e.target.value) })}
        />
      </div>
      <div>
        <FieldLabel>Status</FieldLabel>
        <select
          disabled={readOnly}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          value={value.status}
          onChange={(e) =>
            onChange({
              ...value,
              status: e.target.value as LifecyclePhaseSetting["status"],
            })
          }
        >
          <option value="draft">draft</option>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
      </div>
      {readOnly ? (
        <p className="text-xs text-slate-500">Unlock configuration editing to modify this phase.</p>
      ) : null}
    </div>
  );
}

function PhaseEditFields({
  value,
  onChange,
}: {
  value: LifecyclePhaseSetting;
  onChange: (next: LifecyclePhaseSetting) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <FieldLabel>Phase name</FieldLabel>
        <TextInput value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
      </div>
      <div>
        <FieldLabel>Description</FieldLabel>
        <TextArea value={value.description} onChange={(e) => onChange({ ...value, description: e.target.value })} />
      </div>
      <div>
        <FieldLabel>Key deliverables (comma-separated)</FieldLabel>
        <TextInput
          value={value.keyDeliverables.join(", ")}
          onChange={(e) => onChange({ ...value, keyDeliverables: parseCommaList(e.target.value) })}
        />
      </div>
      <div>
        <FieldLabel>Required artifact IDs (comma-separated)</FieldLabel>
        <TextInput
          value={value.requiredArtifactIds.join(", ")}
          onChange={(e) => onChange({ ...value, requiredArtifactIds: parseCommaList(e.target.value) })}
        />
      </div>
      <div>
        <FieldLabel>Entry criteria</FieldLabel>
        <TextArea
          value={value.extended.entryCriteria}
          onChange={(e) =>
            onChange({
              ...value,
              extended: { ...value.extended, entryCriteria: e.target.value },
            })
          }
        />
      </div>
      <div>
        <FieldLabel>Exit criteria</FieldLabel>
        <TextArea
          value={value.extended.exitCriteria}
          onChange={(e) =>
            onChange({
              ...value,
              extended: { ...value.extended, exitCriteria: e.target.value },
            })
          }
        />
      </div>
      <div>
        <FieldLabel>Status</FieldLabel>
        <select
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          value={value.status}
          onChange={(e) =>
            onChange({
              ...value,
              status: e.target.value as LifecyclePhaseSetting["status"],
            })
          }
        >
          <option value="draft">draft</option>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
      </div>
    </div>
  );
}
