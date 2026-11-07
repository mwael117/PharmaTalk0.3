'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the PDF viewer with SSR disabled to fix Node/Window type collisions
const SecurePdfViewer = dynamic(() => import('@/components/SecurePdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[500px] w-[450px] text-slate-400 text-sm">
      Loading PDF engine...
    </div>
  ),
});

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

const TIER_WEIGHTS: Record<BundleTier, number> = {
  free: 0,
  part_1_basic: 1,
  complete_bundle: 2,
  clinical_pro: 3,
};

const BUNDLE_LABELS: Record<BundleTier, string> = {
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
    brand_names: ['Bystolic'],[cite: 1]
    drug_class: 'Antihypertensive + Cardioselective beta-1 blocker',[cite: 1]
    chapter: 1,
    part: 1,
    is_free: true,
    required_bundle: 'free',
    forms: ['Tablets: 2.5 mg, 5 mg, 10 mg'],[cite: 1]
  },
  {
    id: 'drug-002',
    slug: 'adenosine',
    name: 'Adenosine',
    brand_names: ['Adenocard', 'Adenoscan'],[cite: 2]
    drug_class: 'Antiarrhythmic, Endogenous Nucleoside',[cite: 2]
    chapter: 1,
    part: 1,
    is_free: true,
    required_bundle: 'free',
    forms: ['IV injection: 3 mg/mL'],[cite: 2]
  },
  {
    id: 'drug-003',
    slug: 'atenolol',
    name: 'Atenolol',
    brand_names: ['Tenormin'],[cite: 3]
    drug_class: 'Antihypertensive | Beta-1 Selective Adrenergic Blocker',[cite: 3]
    chapter: 1,
    part: 1,
    is_free: false,
    required_bundle: 'part_1_basic',
    forms: ['Oral (PO) tablets: 25 mg, 50 mg, 100 mg'],[cite: 3]
  },
  {
    id: 'drug-004',
    slug: 'atropine-sulfate',
    name: 'Atropine Sulfate',
    brand_names: ['AtroPen', 'Sal-Tropine'],[cite: 4]
    drug_class: 'Anticholinergic | Muscarinic antagonist | Systemic antispasmodic',[cite: 4]
    chapter: 1,
    part: 1,
    is_free: false,
    required_bundle: 'part_1_basic',
    forms: ['Inj: 0.1 mg/mL, 1 mg/10 mL', 'Auto-Injector: 2 mg', 'Ophth Sol: 1%'],[cite: 4]
  },
  {
    id: 'drug-005',
    slug: 'diltiazem',
    name: 'Diltiazem',
    brand_names: ['Cardizem', 'Tiazac'],[cite: 5]
    drug_class: 'Antianginal | Non-Dihydropyridine Calcium Channel Blocker',[cite: 5]
    chapter: 1,
    part: 1,
    is_free: false,
    required_bundle: 'part_1_basic',
    forms: ['Tablet: 30, 60, 90, 120 mg', 'Extended Release: 120-420 mg', 'Injection: 5 mg/mL'],[cite: 5]
  },
  {
    id: 'drug-006',
    slug: 'ethacrynic-acid',
    name: 'Ethacrynic Acid',
    brand_names: ['Edecrin'],[cite: 6]
    drug_class: 'Loop diuretic; phenoxyacetic acid derivative',[cite: 6]
    chapter: 2,
    part: 1,
    is_free: false,
    required_bundle: 'part_1_basic',
    forms: ['PO tablets: 25 mg, 50 mg', 'IV vial: 50 mg'],[cite: 6]
  },
  {
    id: 'drug-007',
    slug: 'gemfibrozil',
    name: 'Gemfibrozil',
    brand_names: ['Lopid'],[cite: 7]
    drug_class: 'Fibric Acid Derivative | PPAR-a Agonist',[cite: 7]
    chapter: 2,
    part: 1,
    is_free: false,
    required_bundle: 'complete_bundle',
    forms: ['Tablet: 600 mg'],[cite: 7]
  },
  {
    id: 'drug-008',
    slug: 'irbesartan',
    name: 'Irbesartan',
    brand_names: ['Avapro'],[cite: 8]
    drug_class: 'Antihypertensive | Angiotensin II Receptor Blocker (ARB)',[cite: 8]
    chapter: 2,
    part: 1,
    is_free: false,
    required_bundle: 'complete_bundle',
    forms: ['Tablet: 75 mg, 150 mg, 300 mg'],[cite: 8]
  },
  {
    id: 'drug-009',
    slug: 'methyldopa',
    name: 'Methyldopa',
    brand_names: ['Aldomet'],[cite: 9]
    drug_class: 'Antihypertensive + Central Alpha 2 Agonist',[cite: 9]
    chapter: 2,
    part: 1,
    is_free: false,
    required_bundle: 'complete_bundle',
    forms: ['Tablets: 250 mg, 500 mg', 'Oral Suspension: 250 mg/5 mL'],[cite: 9]
  },
  {
    id: 'drug-010',
    slug: 'metoprolol-succinate',
    name: 'Metoprolol Succinate',
    brand_names: ['Toprol XL'],[cite: 10]
    drug_class: 'Extended-release, cardioselective beta-1 blocker',[cite: 10]
    chapter: 2,
    part: 1,
    is_free: false,
    required_bundle: 'clinical_pro',
    forms: ['Extended-Release (ER) Tablets: 25 mg, 50 mg, 100 mg, 200 mg'],[cite: 10]
  },
];

export default function Home() {
  const [currentUserTier, setCurrentUserTier] = useState<BundleTier>('free');
  const [activeDrug, setActiveDrug] = useState<DrugItem | null>(null);
  const [paywallTarget, setPaywallTarget] = useState<DrugItem | null>(null);
  const userEmail = 'pharmacist@korsaty-demo.com';

  const hasAccess = (item: DrugItem): boolean => {
    if (item.is_free) return true;
    return TIER_WEIGHTS[currentUserTier] >= TIER_WEIGHTS[item.required_bundle];
  };

  const handleCardClick = (item: DrugItem) => {
    if (hasAccess(item)) {
      setActiveDrug(item);
    } else {
      setPaywallTarget(item);
    }
  };

  const chapters = Array.from(new Set(DRUGS_DATA.map((d) => d.chapter)));

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
                return (
                  <div
                    key={drug.id}
                    onClick={() => handleCardClick(drug)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      unlocked
                        ? 'bg-white border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md'
                        : 'bg-slate-100/70 border-dashed border-slate-300 hover:border-slate-400 opacity-90'
                    }`}
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
                            🔒 {BUNDLE_LABELS[drug.required_bundle]}
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
                      <span
                        className={`font-semibold flex items-center gap-1 ${
                          unlocked ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      >
                        {unlocked ? 'View Monograph →' : 'Locked'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {paywallTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xl mx-auto mb-3">
              🔒
            </div>
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
      )}

      {activeDrug && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-3xl bg-slate-900 text-white flex flex-col shadow-2xl h-full">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  Chapter {activeDrug.chapter} • Monograph
                </span>
                <h2 className="text-xl font-bold">{activeDrug.name}</h2>
              </div>
              <button
                onClick={() => setActiveDrug(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                ✕
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
      )}
    </div>
  );
}
