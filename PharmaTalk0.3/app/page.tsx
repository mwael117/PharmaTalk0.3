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
  chapter_title: string;
  is_free: boolean;
  required_bundle: BundleTier;
  forms: string[];
  target: string;
  half_life: string;
  analogy: string;
  adult_dose: string;
  contraindications: string[];
  clinical_pearl: string;
}

const TIER_WEIGHTS: { [key in BundleTier]: number } = {
  free: 0,
  part_1_basic: 1,
  complete_bundle: 2,
  clinical_pro: 3,
};

const BUNDLE_DETAILS: {
  [key in BundleTier]: {
    label: string;
    price: string;
    badgeColor: string;
    description: string;
    perks: string[];
  };
} = {
  free: {
    label: 'Free Preview',
    price: '$0',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description: 'Sample access to foundational cardiovascular monographs.',
    perks: ['2 Free Drug Monographs', 'Standard Canvas Viewer', 'Basic Receptor Summaries'],
  },
  part_1_basic: {
    label: 'Part 1 Basic',
    price: '$14.99',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    description: 'Essential autonomic, antiarrhythmic, and loop diuretic monographs.',
    perks: [
      'Unlocks 6 Core Monographs',
      'High-Resolution Infographic Zoom',
      'Adult & Renal Dosing Quick-Cards',
    ],
  },
  complete_bundle: {
    label: 'Complete Bundle',
    price: '$24.99',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    description: 'Full access to antihypertensives, lipid regulators, and central agonists.',
    perks: [
      'Unlocks 9 Clinical Monographs',
      'Black Box & Contraindication Alerts',
      'Mechanism Analogies & PK/PD Data',
    ],
  },
  clinical_pro: {
    label: 'Clinical Pro',
    price: '$39.99',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    description: 'Complete 100% database access including advanced heart failure protocols.',
    perks: [
      'All 10+ Monographs Unlocked',
      'Full Clinical Studio Sidebar',
      'Priority Clinical Pearl Annotations',
    ],
  },
};

const DRUGS_DATA: DrugItem[] = [
  {
    id: 'drug-001',
    slug: 'nebivolol',
    name: 'Nebivolol',
    brand_names: ['Bystolic'],
    drug_class: 'Cardioselective Beta-1 Blocker',
    chapter: 1,
    chapter_title: 'Cardiovascular & Autonomic Agents',
    is_free: true,
    required_bundle: 'free',
    forms: ['Tablets: 2.5 mg, 5 mg, 10 mg'],
    target: 'Beta-1 & Endothelial NO Synthase',
    half_life: '12-19 hrs',
    analogy: 'A dual-action brake slowing the heart while widening vascular pipes to reduce workload.',
    adult_dose: '5 mg PO once daily (Max: 40 mg daily); Renal CrCl <30: 2.5 mg daily.',
    contraindications: ['Severe bradycardia', 'Cardiogenic shock', 'Decompensated heart failure'],
    clinical_pearl: 'NO-mediated vasodilation preserves erectile function better than older beta-blockers.',
  },
  {
    id: 'drug-002',
    slug: 'adenosine',
    name: 'Adenosine',
    brand_names: ['Adenocard', 'Adenoscan'],
    drug_class: 'Antiarrhythmic Nucleoside',
    chapter: 1,
    chapter_title: 'Cardiovascular & Autonomic Agents',
    is_free: true,
    required_bundle: 'free',
    forms: ['IV Injection: 3 mg/mL'],
    target: 'A1 Receptors in AV Node',
    half_life: '<10 sec',
    analogy: 'A temporary electrical reset switch for the heart.',
    adult_dose: '6 mg rapid IV push over 1-3 sec (Max: 12 mg per dose) followed by 20 mL NS flush.',
    contraindications: ['2nd/3rd-degree AV block', 'Sick sinus syndrome', 'Severe reactive airway disease'],
    clinical_pearl: 'Administer via proximal IV line and immediately flush with 20 mL normal saline while elevating extremity.',
  },
  {
    id: 'drug-003',
    slug: 'atenolol',
    name: 'Atenolol',
    brand_names: ['Tenormin'],
    drug_class: 'Beta-1 Selective Blocker',
    chapter: 1,
    chapter_title: 'Cardiovascular & Autonomic Agents',
    is_free: false,
    required_bundle: 'part_1_basic',
    forms: ['Oral Tablets: 25 mg, 50 mg, 100 mg'],
    target: 'Cardiac Beta-1 Receptors',
    half_life: '6-7 hrs',
    analogy: 'A biological speed governor slowing the heart engine.',
    adult_dose: '50 mg PO daily (Max: 100 mg daily). Adjust when CrCl <35 mL/min.',
    contraindications: ['Cardiogenic shock', 'Severe bradycardia', '2nd or 3rd degree AV block'],
    clinical_pearl: 'Masks tachycardia from hypoglycemia in diabetics; taper over 1-2 weeks before stopping.',
  },
  {
    id: 'drug-004',
    slug: 'atropine-sulfate',
    name: 'Atropine Sulfate',
    brand_names: ['AtroPen', 'Sal-Tropine'],
    drug_class: 'Muscarinic Antagonist',
    chapter: 1,
    chapter_title: 'Cardiovascular & Autonomic Agents',
    is_free: false,
    required_bundle: 'part_1_basic',
    forms: ['Inj: 0.1 mg/mL, 1 mg/10 mL', 'Auto-Injector: 2 mg', 'Ophth Sol: 1%'],
    target: 'Muscarinic ACh Receptors',
    half_life: '2-3 hrs',
    analogy: 'Cutting the brake lines on the vagus nerve to accelerate cardiac output.',
    adult_dose: 'Bradycardia: 1 mg IV push q3-5min (Max: 3 mg total). Avoid doses <0.5 mg.',
    contraindications: ['Narrow-angle glaucoma', 'Obstructive uropathy', 'Severe ulcerative colitis'],
    clinical_pearl: 'Doses under 0.5 mg in adults can trigger paradoxical bradycardia. Does not treat Mobitz II or 3rd-degree block.',
  },
  {
    id: 'drug-005',
    slug: 'diltiazem',
    name: 'Diltiazem',
    brand_names: ['Cardizem', 'Tiazac'],
    drug_class: 'Non-DHP Calcium Channel Blocker',
    chapter: 1,
    chapter_title: 'Cardiovascular & Autonomic Agents',
    is_free: false,
    required_bundle: 'part_1_basic',
    forms: ['Tablets: 30-120 mg', 'ER: 120-420 mg', 'IV: 5 mg/mL'],
    target: 'L-Type Calcium Channels',
    half_life: '3-4.5 hrs',
    analogy: 'An electrical brake and vascular smooth muscle relaxer.',
    adult_dose: 'Oral: 120-360 mg daily (Max 540 mg). IV Bolus: 0.25 mg/kg over 2 minutes.',
    contraindications: ['HFrEF (reduced ejection fraction)', 'Sick sinus syndrome', 'Severe hypotension'],
    clinical_pearl: 'Never combine with IV beta-blockers. Restrict concurrent Simvastatin to max 10 mg daily.',
  },
  {
    id: 'drug-006',
    slug: 'ethacrynic-acid',
    name: 'Ethacrynic Acid',
    brand_names: ['Edecrin'],
    drug_class: 'Non-Sulfonamide Loop Diuretic',
    chapter: 2,
    chapter_title: 'Renal, Lipid & Advanced Therapeutics',
    is_free: false,
    required_bundle: 'part_1_basic',
    forms: ['PO Tablets: 25 mg, 50 mg', 'IV Vial: 50 mg'],
    target: 'NKCC2 in Thick Ascending Limb',
    half_life: '30-60 min',
    analogy: 'A dam breaking in the kidney primary concentrating segment.',
    adult_dose: '50-200 mg PO daily; IV infusion slowly over 5 minutes (do not rapid push).',
    contraindications: ['Anuria', 'Severe watery diarrhea', 'Profound electrolyte depletion'],
    clinical_pearl: 'Only non-sulfonamide loop diuretic (safe in severe sulfa allergy), but carries the highest ototoxicity risk.',
  },
  {
    id: 'drug-007',
    slug: 'gemfibrozil',
    name: 'Gemfibrozil',
    brand_names: ['Lopid'],
    drug_class: 'Fibric Acid Derivative (PPAR-alpha)',
    chapter: 2,
    chapter_title: 'Renal, Lipid & Advanced Therapeutics',
    is_free: false,
    required_bundle: 'complete_bundle',
    forms: ['Oral Tablet: 600 mg'],
    target: 'Nuclear Receptor PPAR-alpha',
    half_life: '1.5 hrs',
    analogy: 'Turns on fat-burning enzymes (lipoprotein lipase) to clear triglycerides.',
    adult_dose: '600 mg PO twice daily taken exactly 30 minutes before breakfast and dinner.',
    contraindications: ['Concurrent Simvastatin', 'Severe renal dysfunction', 'Gallbladder or biliary disease'],
    clinical_pearl: 'Never combine with statins (especially simvastatin) due to glucuronidation inhibition and rhabdomyolysis risk.',
  },
  {
    id: 'drug-008',
    slug: 'irbesartan',
    name: 'Irbesartan',
    brand_names: ['Avapro'],
    drug_class: 'Angiotensin II Receptor Blocker (ARB)',
    chapter: 2,
    chapter_title: 'Renal, Lipid & Advanced Therapeutics',
    is_free: false,
    required_bundle: 'complete_bundle',
    forms: ['Oral Tablets: 75 mg, 150 mg, 300 mg'],
    target: 'AT1 Receptor',
    half_life: '11-15 hrs',
    analogy: 'A shield blocking vasoconstricting Angiotensin II from gripping blood vessels.',
    adult_dose: 'HTN: 150 mg PO daily (Max: 300 mg/day). Diabetic Nephropathy target: 300 mg daily.',
    contraindications: ['Pregnancy (Black Box fetal toxicity)', 'Concurrent Aliskiren in diabetes', 'Bilateral renal artery stenosis'],
    clinical_pearl: 'Superior to amlodipine for slowing diabetic nephropathy progression; check K+ and SCr 1-2 weeks post-initiation.',
  },
  {
    id: 'drug-009',
    slug: 'methyldopa',
    name: 'Methyldopa',
    brand_names: ['Aldomet'],
    drug_class: 'Central Alpha-2 Agonist',
    chapter: 2,
    chapter_title: 'Renal, Lipid & Advanced Therapeutics',
    is_free: false,
    required_bundle: 'complete_bundle',
    forms: ['Tablets: 250 mg, 500 mg', 'Oral Susp: 250 mg/5 mL'],
    target: 'Brainstem Alpha-2 Receptors',
    half_life: '1.7 hrs',
    analogy: 'A central brake pedal for sympathetic nervous system outflow.',
    adult_dose: '250 mg PO 2-3 times daily; titrate every 2 days (Max: 3 g/day).',
    contraindications: ['Active hepatic disease (hepatitis/cirrhosis)', 'Concurrent MAOI therapy'],
    clinical_pearl: 'Safe in pregnancy (Category B). ~20% develop a positive direct Coombs test, though hemolytic anemia is rare.',
  },
  {
    id: 'drug-010',
    slug: 'metoprolol-succinate',
    name: 'Metoprolol Succinate',
    brand_names: ['Toprol XL'],
    drug_class: 'Extended-Release Beta-1 Blocker',
    chapter: 2,
    chapter_title: 'Renal, Lipid & Advanced Therapeutics',
    is_free: false,
    required_bundle: 'clinical_pro',
    forms: ['ER Tablets: 25 mg, 50 mg, 100 mg, 200 mg'],
    target: 'Cardiac Beta-1 Adrenergic Receptors',
    half_life: '3-7 hrs',
    analogy: 'A governor limiting engine RPMs to prevent myocardial overheating.',
    adult_dose: 'HTN/Angina: 100 mg daily (Max 400 mg). HFrEF: Start 12.5-25 mg daily, double q2wks to 200 mg.',
    contraindications: ['Severe bradycardia', '2nd/3rd degree AV block', 'Acute decompensated heart failure'],
    clinical_pearl: 'One of three beta-blockers proven to reduce mortality in HFrEF (alongside carvedilol and bisoprolol).',
  },
];

// ==========================================
// SECURE CANVAS PDF VIEWER WITH ZOOM
// ==========================================

function SecurePdfViewer(props: {
  docSlug: string;
  userEmail: string;
  userTier: string;
  zoomScale: number;
}) {
  const docSlug = props.docSlug;
  const userEmail = props.userEmail;
  const userTier = props.userTier || 'free';
  const zoomScale = props.zoomScale || 1.5;

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
          throw new Error('Entitlement verification failed. Please unlock the required bundle.');
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

        const viewport = page.getViewport({ scale: zoomScale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        setLoading(false);
      } catch (err: unknown) {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : 'Unable to render monograph';
          setError(message);
          setLoading(false);
        }
      }
    }

    loadPdf();
    return () => {
      isCancelled = true;
    };
  }, [docSlug, userTier, zoomScale]);

  const canvasClass = loading || error ? 'hidden' : 'block mx-auto rounded-lg shadow-2xl';

  return (
    <div
      className="relative select-none inline-block rounded-xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-2xl"
      onContextMenu={(e) => e.preventDefault()}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[680px] w-[540px] text-slate-300 bg-slate-900/60">
          <div className="relative flex items-center justify-center mb-4">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-200">Streaming Protected Monograph...</p>
          <p className="text-xs text-slate-500 mt-1">Applying DRM Canvas Watermark</p>
        </div>
      ) : null}

      {error ? (
        <div className="flex flex-col items-center justify-center h-[500px] w-[480px] p-8 text-center bg-slate-950">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3 text-xl font-bold">
            !
          </div>
          <p className="text-base font-semibold text-white mb-1">Stream Protected</p>
          <p className="text-xs text-rose-400 max-w-xs">{error}</p>
        </div>
      ) : null}

      <canvas ref={canvasRef} className={canvasClass} />

      {/* Anti-Download Shield & Dynamic Subscriber Watermark */}
      <div className="absolute inset-0 pointer-events-auto bg-transparent">
        <div className="w-full h-full flex flex-col justify-around items-center opacity-[0.08] pointer-events-none -rotate-12 select-none overflow-hidden">
          <span className="text-xl font-black text-white uppercase tracking-widest whitespace-nowrap">
            {userEmail} • VIEW ONLY • DO NOT DISTRIBUTE
          </span>
          <span className="text-xl font-black text-white uppercase tracking-widest whitespace-nowrap">
            PHARMATALK CLINICAL LICENSE • {userTier.toUpperCase()}
          </span>
          <span className="text-xl font-black text-white uppercase tracking-widest whitespace-nowrap">
            {userEmail} • PROTECTED MEDICAL MONOGRAPH
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN APPLICATION
// ==========================================

export default function Home() {
  const [currentUserTier, setCurrentUserTier] = useState('free' as BundleTier);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeDrug, setActiveDrug] = useState(null as DrugItem | null);
  const [paywallTarget, setPaywallTarget] = useState(null as DrugItem | null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [zoomScale, setZoomScale] = useState(1.4);
  const [showSidebar, setShowSidebar] = useState(true);

  const userEmail = 'dr.clinician@pharmatalk.med';

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

  // Filter & Search Logic
  const filteredDrugs = DRUGS_DATA.filter((drug) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      drug.name.toLowerCase().includes(q) ||
      drug.brand_names.some((b) => b.toLowerCase().includes(q)) ||
      drug.drug_class.toLowerCase().includes(q) ||
      drug.target.toLowerCase().includes(q) ||
      drug.analogy.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (selectedFilter === 'unlocked') return hasAccess(drug);
    if (selectedFilter === 'free') return drug.is_free;
    if (selectedFilter === 'ch1') return drug.chapter === 1;
    if (selectedFilter === 'ch2') return drug.chapter === 2;
    return true;
  });

  const unlockedCount = DRUGS_DATA.filter((d) => hasAccess(d)).length;
  const totalCount = DRUGS_DATA.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  // Navigation inside drawer
  const unlockedList = DRUGS_DATA.filter((d) => hasAccess(d));
  const currentIndex = activeDrug
    ? unlockedList.findIndex((d) => d.id === activeDrug.id)
    : -1;

  function goToPrevDrug() {
    if (currentIndex > 0) {
      setActiveDrug(unlockedList[currentIndex - 1]);
    }
  }

  function goToNextDrug() {
    if (currentIndex >= 0 && currentIndex < unlockedList.length - 1) {
      setActiveDrug(unlockedList[currentIndex + 1]);
    }
  }

  const chapters = [1, 2];
  const bundleKeys: BundleTier[] = ['free', 'part_1_basic', 'complete_bundle', 'clinical_pro'];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0B0F19]/85 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 font-black text-white text-lg">
              Rx
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  PharmaTalk
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  Top 250 Drugs
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Interactive Visual Pharmacology Monographs
              </p>
            </div>
          </div>

          {/* Right Controls: Progress, Tier Switcher, Upgrade CTA */}
          <div className="flex items-center gap-3">
            {/* Access Progress Pill */}
            <div className="hidden md:flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-1.5">
              <div className="text-right">
                <div className="text-[11px] font-semibold text-slate-300">
                  {unlockedCount} of {totalCount} Unlocked
                </div>
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300"
                    style={{ width: progressPercent + '%' }}
                  />
                </div>
              </div>
              <span className="text-xs font-extrabold text-emerald-400">{progressPercent}%</span>
            </div>

            {/* Simulator Tier Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-2 hidden sm:inline">
                Simulate Plan:
              </span>
              <select
                value={currentUserTier}
                onChange={(e) => setCurrentUserTier(e.target.value as BundleTier)}
                className="bg-slate-800 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="free">Free Preview ($0)</option>
                <option value="part_1_basic">Part 1 Basic ($14.99)</option>
                <option value="complete_bundle">Complete Bundle ($24.99)</option>
                <option value="clinical_pro">Clinical Pro ($39.99)</option>
              </select>
            </div>

            <button
              onClick={() => setShowPricingModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-blue-600/25 transition"
            >
              Bundles
            </button>
          </div>
        </div>
      </header>

      {/* HERO BANNER & SEARCH BAR */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-[#0B0F19] pt-10 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              High-Yield Visual Clinical Reference
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Master the Most Common 250 Drugs with Visual Infographics.
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
              Every monograph distills Mechanism of Action (MOA), receptor targets, adult & renal dosing, contraindications, and high-yield clinical pearls into a single protected visual sheet.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-7 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by generic (Nebivolol), brand (Bystolic, Tenormin), target (Beta-1, NKCC2)..."
                className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-blue-500 rounded-2xl pl-4 pr-10 py-3 text-sm text-white placeholder-slate-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded-md"
                >
                  Clear
                </button>
              ) : null}
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: 'All Drugs (' + DRUGS_DATA.length + ')' },
                { id: 'unlocked', label: 'Unlocked (' + unlockedCount + ')' },
                { id: 'free', label: 'Free Samples' },
                { id: 'ch1', label: 'Ch 1: Cardio' },
                { id: 'ch2', label: 'Ch 2: Renal & Lipid' },
              ].map((tab) => {
                const isActive = selectedFilter === tab.id;
                const pillClass = isActive
                  ? 'px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-md shadow-blue-600/20 whitespace-nowrap transition'
                  : 'px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 whitespace-nowrap transition';
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedFilter(tab.id)}
                    className={pillClass}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CATALOG CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filteredDrugs.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8">
            <p className="text-lg font-bold text-slate-200">No matching drug monographs found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try searching for another generic name, brand name, or receptor target.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-blue-400 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : null}

        {chapters.map((ch) => {
          const chapterDrugs = filteredDrugs.filter((d) => d.chapter === ch);
          if (chapterDrugs.length === 0) return null;
          const chapterTitle = chapterDrugs[0].chapter_title;

          return (
            <section key={ch} className="mb-12">
              {/* Chapter Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-extrabold uppercase tracking-wider">
                    Chapter {ch}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-white">{chapterTitle}</h2>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  Showing {chapterDrugs.length} monographs
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {chapterDrugs.map((drug) => {
                  const unlocked = hasAccess(drug);
                  const bundleInfo = BUNDLE_DETAILS[drug.required_bundle];

                  const cardStyle = unlocked
                    ? 'group relative rounded-2xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900 hover:border-blue-500/50 p-5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-blue-500/5 flex flex-col justify-between'
                    : 'group relative rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 hover:bg-slate-900/60 hover:border-amber-500/40 p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between';

                  return (
                    <div
                      key={drug.id}
                      onClick={() => handleCardClick(drug)}
                      className={cardStyle}
                    >
                      <div>
                        {/* Top Row: Class & Access Badge */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
                            {drug.drug_class}
                          </span>

                          {drug.is_free ? (
                            <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Free Sample
                            </span>
                          ) : unlocked ? (
                            <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30">
                              Unlocked
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25">
                              Locked • {bundleInfo.label}
                            </span>
                          )}
                        </div>

                        {/* Drug Name & Brands */}
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="text-xl font-extrabold text-white group-hover:text-blue-400 transition">
                            {drug.name}
                          </h3>
                          <span className="text-xs font-semibold text-slate-400">
                            {drug.brand_names.join(' / ')}
                          </span>
                        </div>

                        {/* Mechanism Analogy Callout */}
                        <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                          <p className="text-xs text-slate-300 italic leading-relaxed">
                            &ldquo;{drug.analogy}&rdquo;
                          </p>
                        </div>

                        {/* Clinical Metadata Pills */}
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                            <strong className="text-slate-200">Target:</strong> {drug.target}
                          </span>
                          <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                            <strong className="text-slate-200">T1/2:</strong> {drug.half_life}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400 truncate max-w-[65%]">{drug.forms[0]}</span>
                        {unlocked ? (
                          <span className="font-bold text-blue-400 group-hover:translate-x-0.5 transition-transform">
                            Open Studio &rarr;
                          </span>
                        ) : (
                          <span className="font-bold text-amber-400 group-hover:underline">
                            Unlock ({bundleInfo.price}) &rarr;
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {/* ==========================================
          UPGRADE / PAYWALL MODAL (SINGLE DRUG CLICK)
         ========================================== */}
      {paywallTarget ? (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Bundle Required
              </span>
              <button
                onClick={() => setPaywallTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <h3 className="text-2xl font-extrabold text-white">
              Unlock {paywallTarget.name} ({paywallTarget.brand_names[0]})
            </h3>
            <p className="text-xs text-blue-400 font-semibold mt-1">{paywallTarget.drug_class}</p>

            {/* Preview Teaser Box */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-400">
                <strong className="text-slate-200">Receptor Target:</strong> {paywallTarget.target}
              </div>
              <div className="text-slate-400">
                <strong className="text-slate-200">MOA Analogy:</strong> &ldquo;{paywallTarget.analogy}&rdquo;
              </div>
              <div className="text-amber-400/90 pt-1 font-medium">
                Full visual infographic, adult/pediatric dosing, and black box warnings require the{' '}
                <span className="underline font-bold">
                  {BUNDLE_DETAILS[paywallTarget.required_bundle].label}
                </span>{' '}
                plan.
              </div>
            </div>

            <div className="mt-6 space-y-2.5">
              <button
                onClick={() => {
                  setCurrentUserTier(paywallTarget.required_bundle);
                  setActiveDrug(paywallTarget);
                  setPaywallTarget(null);
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-600/25 transition"
              >
                Instant Unlock with {BUNDLE_DETAILS[paywallTarget.required_bundle].label} (
                {BUNDLE_DETAILS[paywallTarget.required_bundle].price})
              </button>

              <button
                onClick={() => {
                  setPaywallTarget(null);
                  setShowPricingModal(true);
                }}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition"
              >
                Compare All Subscription Bundles
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ==========================================
          FULL BUNDLE PRICING COMPARISON MODAL
         ========================================== */}
      {showPricingModal ? (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Choose Your Clinical Bundle</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Unlock high-resolution drug monographs and clinical dosing tools immediately.
                </p>
              </div>
              <button
                onClick={() => setShowPricingModal(false)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bundleKeys.map((tierKey) => {
                const info = BUNDLE_DETAILS[tierKey];
                const isCurrent = currentUserTier === tierKey;
                const countForTier = DRUGS_DATA.filter(
                  (d) => d.is_free || TIER_WEIGHTS[tierKey] >= TIER_WEIGHTS[d.required_bundle]
                ).length;

                const boxStyle = isCurrent
                  ? 'rounded-2xl border-2 border-blue-500 bg-slate-950 p-5 flex flex-col justify-between'
                  : 'rounded-2xl border border-slate-800 bg-slate-950/60 p-5 flex flex-col justify-between';

                return (
                  <div key={tierKey} className={boxStyle}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">
                          {info.label}
                        </span>
                        {isCurrent ? (
                          <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        ) : null}
                      </div>
                      <div className="text-3xl font-black text-white mt-2">{info.price}</div>
                      <p className="text-xs text-slate-400 mt-2">{info.description}</p>

                      <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
                        <div className="text-xs font-bold text-emerald-400">
                          ✓ {countForTier} of {totalCount} Drugs Unlocked
                        </div>
                        {info.perks.map((perk, idx) => (
                          <div key={idx} className="text-xs text-slate-300">
                            • {perk}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentUserTier(tierKey);
                        setShowPricingModal(false);
                      }}
                      className={
                        isCurrent
                          ? 'mt-6 w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 cursor-default'
                          : 'mt-6 w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition'
                      }
                    >
                      {isCurrent ? 'Current Plan' : 'Activate ' + info.label}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* ==========================================
          SPLIT-SCREEN CLINICAL MONOGRAPH STUDIO
         ========================================== */}
      {activeDrug ? (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-6xl bg-[#0B0F19] text-white flex flex-col shadow-2xl h-full border-l border-slate-800">
            {/* Studio Top Toolbar */}
            <div className="px-4 sm:px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-extrabold">
                  Ch {activeDrug.chapter}
                </span>
                <div>
                  <h2 className="text-lg font-extrabold text-white leading-none">
                    {activeDrug.name}{' '}
                    <span className="text-xs font-medium text-slate-400">
                      ({activeDrug.brand_names.join(', ')})
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1">{activeDrug.drug_class}</p>
                </div>
              </div>

              {/* Zoom & Navigation Toolbar */}
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => setZoomScale(Math.max(0.9, Number((zoomScale - 0.25).toFixed(2))))}
                    className="px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                  >
                    -
                  </button>
                  <span className="px-2.5 text-xs font-bold text-blue-400">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomScale(Math.min(2.4, Number((zoomScale + 0.25).toFixed(2))))}
                    className="px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                  >
                    +
                  </button>
                </div>

                {/* Toggle Clinical Summary Sidebar */}
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="hidden lg:inline-flex px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  {showSidebar ? 'Hide Quick-Sheet' : 'Show Quick-Sheet'}
                </button>

                {/* Prev / Next Unlocked Drug */}
                <div className="hidden sm:flex items-center gap-1">
                  <button
                    onClick={goToPrevDrug}
                    disabled={currentIndex <= 0}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold"
                  >
                    &larr; Prev
                  </button>
                  <button
                    onClick={goToNextDrug}
                    disabled={currentIndex < 0 || currentIndex >= unlockedList.length - 1}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold"
                  >
                    Next &rarr;
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setActiveDrug(null)}
                  className="w-8 h-8 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 flex items-center justify-center font-bold transition ml-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* DRM Status Banner */}
            <div className="bg-slate-950 px-6 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Protected HTML5 Canvas Stream • Right-click, Save & Print Disabled
              </span>
              <span className="hidden sm:inline text-slate-500">
                Subscriber ID: {userEmail}
              </span>
            </div>

            {/* Split Content Area: Left Clinical Quick-Sheet + Right PDF Canvas */}
            <div className="flex-1 flex overflow-hidden">
              {showSidebar ? (
                <aside className="hidden lg:block w-80 bg-slate-900/70 border-r border-slate-800 overflow-y-auto p-5 space-y-5">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 mb-2">
                      Mechanism Analogy
                    </h3>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed italic">
                      &ldquo;{activeDrug.analogy}&rdquo;
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-2">
                      Pharmacology & PK
                    </h3>
                    <div className="space-y-2 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-400">Target:</span>{' '}
                        <strong className="text-white">{activeDrug.target}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Half-Life (T1/2):</span>{' '}
                        <strong className="text-white">{activeDrug.half_life}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Strengths:</span>{' '}
                        <strong className="text-white">{activeDrug.forms.join('; ')}</strong>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-400 mb-2">
                      Adult Dosing & Regimen
                    </h3>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                      {activeDrug.adult_dose}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-400 mb-2">
                      Absolute Contraindications
                    </h3>
                    <ul className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-200 space-y-1.5">
                      {activeDrug.contraindications.map((ci, i) => (
                        <li key={i}>• {ci}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-2">
                      High-Yield Clinical Pearl
                    </h3>
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
                      {activeDrug.clinical_pearl}
                    </div>
                  </div>
                </aside>
              ) : null}

              {/* Right PDF Canvas Scroll Area */}
              <div className="flex-1 overflow-auto p-6 flex justify-center items-start bg-[#070A12]">
                <SecurePdfViewer
                  docSlug={activeDrug.slug}
                  userEmail={userEmail}
                  userTier={currentUserTier}
                  zoomScale={zoomScale}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
