// Fremde Karten nur lesend: Spot-Punkte, um eigene Hotspots NEBEN Figuren und Kartenobjekte zu setzen. Kein Inhaltsteil.
import type { MapDef, Point } from '../../../modules/contracts';

import { part as mBahnhof } from '../maps/bahnhof-mitte';
import { part as mCafe } from '../maps/cafe-sahnehaube';
import { part as mCrew } from '../maps/crew-quartier';
import { part as mWerkstatt } from '../maps/dantes-werkstatt';
import { part as mNest } from '../maps/das-nest';
import { part as mDigitech } from '../maps/digitech-areal';
import { part as mEisenhof } from '../maps/eisenhof';
import { part as mFlutmauer } from '../maps/flutmauer';
import { part as mGericht } from '../maps/gerichtssaal';
import { part as mGlas } from '../maps/glasarkaden';
import { part as mHafen } from '../maps/hafenkante';
import { part as mHausboot } from '../maps/hausboot-nebelhorn';
import { part as mHv } from '../maps/high-voltage';
import { part as mHinter } from '../maps/hv-hinterzimmer';
import { part as mKanal } from '../maps/kanal-sammler';
import { part as mLoet } from '../maps/loetgassen';
import { part as mLaden } from '../maps/loetzinn-laden';
import { part as mNeon } from '../maps/neon-gasse';
import { part as mNx1 } from '../maps/nx1-studio';
import { part as mRipper } from '../maps/ripper-praxis';
import { part as mRohr } from '../maps/rohrsiedlung';
import { part as mSchrott } from '../maps/schrottmarkt';
import { part as mStufen } from '../maps/stufenplatz';
import { part as mSuppe } from '../maps/suppenkueche';

const KARTEN: Record<string, MapDef> = Object.assign({}, ...[
  mBahnhof, mCafe, mCrew, mWerkstatt, mNest, mDigitech, mEisenhof, mFlutmauer, mGericht, mGlas, mHafen, mHausboot, mHv, mHinter,
  mKanal, mLoet, mLaden, mNeon, mNx1, mRipper, mRohr, mSchrott, mStufen, mSuppe,
].map((p) => p.maps ?? {}));

/** Spot-Punkt plus Versatz (`dx`, `dy`); unbekannte Spots bleiben als Name stehen (mergeParts warnt dann). */
export function neben(map: string, spot: string, dx = 44, dy = 0): Point | string {
  const def = KARTEN[map];
  const at = def?.spots?.[spot]?.at ?? def?.entries?.[spot]?.at;
  if (!at) return spot;
  const [x, y] = at;
  const [w, h] = def?.size ?? [2000, 2000];
  const nx = x + dx > w - 20 || x + dx < 20 ? x - dx : x + dx;
  const ny = y + dy > h - 20 || y + dy < 20 ? y - dy : y + dy;
  return [nx, ny];
}
