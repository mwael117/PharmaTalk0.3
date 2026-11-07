'use client';

import React, { useState, useEffect, useRef } from 'react';

export type BundleTier = 'free' | 'part_1_basic' | 'complete_bundle' | 'clinical_pro';

export interface DrugItem {
  id: string;
  slug: string;
  name: string;
  brand_names: string[];
  drug_class: string;
  chapter: number;
  part: number;
  is_free: boolean;
  required_bundle: BundleTier;
  forms: string[];
}

const TIER_WEIGHTS: { [key in BundleTier]: number } = {
  free: 0,
  part_1_basic: 1,
  complete_bundle: 2,
  clinical_pro: 3,
};

const BUNDLE_LABELS: { [key in BundleTier]: string } = {
  free: 'Free',
  part_1_basic: 'Part 1 Basic',
  complete_bundle: 'Complete Bundle',
  clinical_pro: 'Clinical Pro',
};

const DRUGS_DATA: DrugItem[] = [
  {
    id: 'drug-001',
    slug: 'nebivolol',
    name: 'Nebivolol',
    brand_names: ['Bystolic'],
    drug_class: 'Antihypertensive + Cardioselective beta-1 blocker',
    chapter: 1,
    part: 1,
    is_free: true,
    required_bundle: 'free',
    forms: ['Tablets: 2.5 mg, 5 mg, 10 mg'],
  },
  {
    id: 'drug-002',
    slug: 'adenosine',
    name: 'Adenosine',
    brand_names: ['Adenocard', 'Adenoscan'],
    drug_class: 'Antiarrhythmic, Endogenous Nucleoside',
    chapter: 1,
    part: 1,
    is_free: true,
    required_bundle: 'free',
    forms: ['IV injection: 3 mg/mL'],
  },
  {
    id: 'drug-003',
    slug: 'atenolol',
    name: 'Atenolol',
    brand_names: ['Tenormin'],
    drug_class: 'Antihypertensive | Beta-1 Selective Adrenergic Blocker',
    chapter: 1,
    part: 1,
    is_free: false,
    required_bundle: 'part_1_basic',
    forms: ['Oral (PO) tablets: 25 mg, 50 mg, 100 mg'],
  },
  {
    id: 'drug-004',
    slug: 'atropine-sulfate',
    name: 'Atropine Sulfate',
    brand_names: ['AtroPen', 'Sal-Tropine'],
    drug_class: 'Anticholinergic | Muscarinic antagonist | Systemic antispasmodic',
    chapter: 1,
    part: 1,
    is_free: false,
    required_bundle: 'part_1_basic',
    forms: ['Inj: 0.1 mg/mL, 1 mg/10 mL', 'Auto-Injector: 2 mg', 'Ophth Sol: 1%'],
  },
  {
    id: 'drug-005',
    slug: 'diltiazem',
    name: 'Diltiazem',
    brand_names: ['Cardizem', 'Tiazac'],
    drug_class: 'Antianginal | Non-Dihydropyridine Calcium Channel Blocker',
    chapter: 1,
    part: 1,
    is_free: false,
    required_bundle: 'part_1_basic',
    forms: ['Tablet: 30, 60, 90, 120 mg', 'Extended Release: 120-420 mg', 'Injection: 5 mg/mL'],
  },
  {
    id: 'drug-006',
    slug: 'ethacrynic-acid',
    name: 'Ethacrynic Acid',
    brand_names: ['Edecrin'],
    drug_class: 'Loop diuretic; phenoxyacetic acid derivative',
    chapter: 2,
    part: 1,
    is_free: false,
    required_bundle: 'part_1_basic',
    forms: ['PO tablets: 25 mg, 50 mg', 'IV vial: 50 mg'],
  },
  {
    id: 'drug-007',
    slug: 'gemfibrozil',
    name: 'Gemfibrozil',
    brand_names: ['Lopid'],
    drug_class: 'Fibric Acid Derivative | PPAR-a Agonist',
    chapter: 2,
    part: 1,
    is_free: false,
    required_bundle: 'complete_bundle',
    forms: ['Tablet: 600 mg'],
  },
  {
    id: 'drug-008',
    slug: 'irbesartan',
    name: 'Irbesartan',
    brand_names: ['Avapro'],
    drug_class: 'Antihypertensive | Angiotensin II Receptor Blocker (ARB)',
    chapter: 2,
    part: 1,
    is_free: false,
    required_bundle: 'complete_bundle',
    forms: ['Tablet: 75 mg, 150 mg, 300 mg'],
  },
  {
    id: 'drug-009',
    slug: 'methyldopa',
    name: 'Methyldopa',
    brand_names: ['Aldomet'],
    drug_class: 'Antihypertensive + Central Alpha 2 Agonist',
    chapter: 2,
    part: 1,
    is_free: false,
    required_bundle: 'complete_bundle',
    forms: ['Tablets: 250 mg, 500 mg', 'Oral Suspension: 250 mg/5 mL'],
  },
  {
    id: 'drug-010',
    slug: 'metoprolol-succinate',
    name: 'Metoprolol Succinate',
    brand_names: ['Toprol XL'],
    drug_class: 'Extended-release, cardioselective beta-1 blocker',
    chapter: 2,
    part: 1,
    is_free: false,
    required_bundle: 'clinical_pro',
    forms: ['Extended-Release (ER) Tablets: 25 mg, 50 mg, 100 mg, 200 mg'],
  },
];

function SecurePdfViewer(props: {
  docSlug: string;
  userEmail: string;
  userTier?: string;
}) {
  const docSlug = props.docSlug;
  const userEmail = props.userEmail;
  const userTier = props.userTier || 'free';

  const canvasRef = useRef(null as HTMLCanvasElement | null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null as string | null);

  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/docs/stream?slug=' + encodeURIComponent(docSlug), {
          headers: { 'x-user-bundle': userTier },
        });

        if (!res.ok) {
          throw new Error('Access denied. Upgrade your bundle to view this monograph.');
        }

        const arrayBuffer = await res.arrayBuffer();
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + pdfjs.version + '/pdf.worker.min.js';

        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        setLoading(false);
      } catch (err: unknown) {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : 'Unable to render document';
          setError(message);
          setLoading(false);
        }
      }
    }

    loadPdf();
    return () => {
      isCancelled = true;
    };
  }, [docSlug, userTier]);

  const canvasClass = loading || error ? 'hidden' : 'block';

  return (
    <div
      className="relative select-none inline-block border border-slate-700 rounded-lg overflow-hidden shadow-2xl bg-slate-900"
      onContextMenu={(e) => e.preventDefault()}
    >
      {loading ? (
        <div className="flex items-center justify-center h-[600px] w-[500px] text-slate-300">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Decrypting and rendering monograph...</span>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-center justify-center h-[600px] w-[500px] p-6 text-center text-rose-400 bg-slate-950">
          <p className="text-sm">{error}</p>
        </div>
      ) : null}

      <canvas ref={canvasRef} className={canvasClass} />

      <div className="absolute inset-0 pointer-events-auto bg-transparent">
        <div className="w-full h-full flex flex-col justify-around items-center opacity-10 pointer-events-none -rotate-12 select-none">
          <span className="text-xl font-black text-white uppercase tracking-widest">
            {userEmail} - VIEW ONLY
          </span>
          <span className="text-xl font-black text-white uppercase tracking-widest">
            LICENSED COPY - NO DOWNLOAD
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [currentUserTier, setCurrentUserTier] = useState('free' as BundleTier);
  const [activeDrug, setActiveDrug] = useState(null as DrugItem | null);
  const [paywallTarget, setPaywallTarget] = useState(null as DrugItem | null);
  const userEmail = 'pharmacist@korsaty-demo.com';

  function hasAccess(item: DrugItem): boolean {
    if (item.is_free) return true;
    return TIER_WEIGHTS[currentUserTier] >= TIER_WEIGHTS[item.required_bundle];
  }

  function handleCardClick(item: DrugItem) {
    if (hasAccess(item)) {
      setActiveDrug(item);
    } else {
      setPaywallTarget(item);
    }
  }

  const chapters = [1, 2];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Most Common Drugs Database</h1>
            <p className="text-xs text-slate-500">Tier-gated clinical monograph reference</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Active Tier:
            </span>
            <select
              value={currentUserTier}
              onChange={(e) => setCurrentUserTier(e.target.value as BundleTier)}
              className="bg-slate-100 border border-slate-300 text-sm font-semibold rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="free">Free Tier (Preview Only)</option>
              <option value="part_1_basic">Part 1 Basic ($14.99)</option>
              <option value="complete_bundle">Complete Bundle ($24.99)</option>
              <option value="clinical_pro">Clinical Pro ($39.99)</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {chapters.map((ch) => (
          <section key={ch} className="mb-10">
            <div className="border-b border-slate-200 pb-2 mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
                Chapter {ch}
              </h2>
              <span className="text-xs font-medium text-slate-500">
                {DRUGS_DATA.filter((d) => d.chapter === ch).length} Monographs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DRUGS_DATA.filter((d) => d.chapter === ch).map((drug) => {
                const unlocked = hasAccess(drug);
                const cardClass = unlocked
                  ? 'p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between bg-white border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md'
                  : 'p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between bg-slate-100/70 border-dashed border-slate-300 hover:border-slate-400 opacity-90';
                const statusClass = unlocked
                  ? 'font-semibold flex items-center gap-1 text-blue-600'
                  : 'font-semibold flex items-center gap-1 text-slate-400';

                return (
                  <div
                    key={drug.id}
                    onClick={() => handleCardClick(drug)}
                    className={cardClass}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {drug.drug_class}
                        </span>
                        {drug.is_free ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                            Free
                          </span>
                        ) : unlocked ? (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                            Unlocked
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                            Locked: {BUNDLE_LABELS[drug.required_bundle]}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 leading-tight">
                        {drug.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Brand: {drug.brand_names.join(', ')}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400">{drug.forms[0]}</span>
                      <span className={statusClass}>
                        {unlocked ? 'View Monograph ->' : 'Locked'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {paywallTarget ? (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center">
            <h3 className="text-xl font-bold text-slate-900">Subscription Required</h3>
            <p className="text-sm text-slate-600 mt-2">
              <span className="font-semibold text-slate-800">{paywallTarget.name}</span> is
              included in the{' '}
              <span className="font-semibold text-blue-600">
                {BUNDLE_LABELS[paywallTarget.required_bundle]}
              </span>{' '}
              package.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setCurrentUserTier(paywallTarget.required_bundle);
                  setPaywallTarget(null);
                }}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow transition"
              >
                Upgrade to {BUNDLE_LABELS[paywallTarget.required_bundle]}
              </button>
              <button
                onClick={() => setPaywallTarget(null)}
                className="w-full py-2 px-4 text-xs font-semibold text-slate-500 hover:text-slate-700 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {activeDrug ? (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-3xl bg-slate-900 text-white flex flex-col shadow-2xl h-full">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  Chapter {activeDrug.chapter} - Monograph
                </span>
                <h2 className="text-xl font-bold">{activeDrug.name}</h2>
              </div>
              <button
                onClick={() => setActiveDrug(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                X
              </button>
            </div>

            <div className="bg-slate-800/80 px-6 py-2 border-b border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Secure Canvas Stream Active
              </span>
              <span>Downloads, printing, and context menus are disabled</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-slate-950">
              <SecurePdfViewer
                docSlug={activeDrug.slug}
                userEmail={userEmail}
                userTier={currentUserTier}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
