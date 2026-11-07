import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TIER_WEIGHTS: Record<string, number> = {
  free: 0,
  part_1_basic: 1,
  complete_bundle: 2,
  clinical_pro: 3,
};

const DRUG_PERMISSIONS: Record<string, { tier: string; file: string }> = {
  'nebivolol': { tier: 'free', file: 'Nebivolol.pdf' },
  'adenosine': { tier: 'free', file: 'Adenosine.pdf' },
  'atenolol': { tier: 'part_1_basic', file: 'Atenolol.pdf' },
  'atropine-sulfate': { tier: 'part_1_basic', file: 'Atropine sulfate.pdf' },
  'diltiazem': { tier: 'part_1_basic', file: 'Diltiazem.pdf' },
  'ethacrynic-acid': { tier: 'part_1_basic', file: 'Ethacrynic acid.pdf' },
  'gemfibrozil': { tier: 'complete_bundle', file: 'Gemfibrozil.pdf' },
  'irbesartan': { tier: 'complete_bundle', file: 'Irbesartan.pdf' },
  'methyldopa': { tier: 'complete_bundle', file: 'Methyldopa.pdf' },
  'metoprolol-succinate': { tier: 'clinical_pro', file: 'Metoprolol Succinate.pdf' },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug || !DRUG_PERMISSIONS[slug]) {
    return new NextResponse('Monograph not found', { status: 404 });
  }

  const item = DRUG_PERMISSIONS[slug];
  const userBundle = req.headers.get('x-user-bundle') || 'free';
  const userLevel = TIER_WEIGHTS[userBundle] ?? 0;
  const requiredLevel = TIER_WEIGHTS[item.tier];

  if (item.tier !== 'free' && userLevel < requiredLevel) {
    return new NextResponse(
      JSON.stringify({ error: 'UPGRADE_REQUIRED', requiredBundle: item.tier }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const filePath = path.join(process.cwd(), 'secure_storage', item.file);
  if (!fs.existsSync(filePath)) {
    return new NextResponse('File missing on server', { status: 500 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}