
import React from 'react';
import { BathType, BathInfo } from './types';

export const BATH_DATA: Record<BathType, BathInfo> = {
  [BathType.DEVELOPER]: {
    id: BathType.DEVELOPER,
    name: 'Hívó (Developer)',
    color: 'bg-amber-900/30',
    description: 'Ez a lúgos oldat hívja elő a látens képet azáltal, hogy a fénnyel érintkező ezüst-halogenid szemcséket fémezüstté redukálja.',
    chemistry: 'A leggyakoribb hívóanyagok a hidrokinon és a metol. Kémiai reakció: Ag⁺ + e⁻ → Ag⁰ (fémezüst). A sötétebb részeken több ezüst válik ki.',
    microView: 'A fehér kristályok (ezüst-bromid) apró fekete pöttyökké (tiszta ezüst) alakulnak át.',
    optimalTime: 90
  },
  [BathType.STOP]: {
    id: BathType.STOP,
    name: 'Stopfürdő (Stop Bath)',
    color: 'bg-yellow-100/10',
    description: 'Megállítja a hívást és semlegesíti a lúgos hívómaradványokat.',
    chemistry: 'Általában híg ecetsav (CH₃COOH). A savas közeg azonnal leállítja az előhívást, megóvva a fixírt a szennyeződéstől.',
    microView: 'A kémiai átalakulás hirtelen leáll, a pH érték drasztikusan lecsökken.',
    optimalTime: 30
  },
  [BathType.FIXER]: {
    id: BathType.FIXER,
    name: 'Fixáló (Fixer)',
    color: 'bg-blue-200/20',
    description: 'Eltávolítja a maradék fényszenzitív ezüst-sókat, így a kép tartóssá válik és fényálló lesz.',
    chemistry: 'Nátrium-tioszulfát (Na₂S₂O₃). Feloldja a nem exponált ezüst-halogenidet: AgBr + 2S₂O₃²⁻ → [Ag(S₂O₃)₂]³⁻ + Br⁻.',
    microView: 'Az át nem alakult sárgás-fehér szemcsék eltűnnek, csak a fixált fekete ezüstkép marad.',
    optimalTime: 120
  },
  [BathType.WASH]: {
    id: BathType.WASH,
    name: 'Mosás (Wash)',
    color: 'bg-cyan-500/20',
    description: 'Eltávolítja az összes vegyszermaradványt a papír rostjai közül.',
    chemistry: 'Tiszta folyóvíz. Fontos lépés, mert a visszamaradt vegyszerek idővel sárgulást vagy fakulást okoznának.',
    microView: 'A maradék ionok és molekulák kimosódnak az emulzió rétegeiből.',
    optimalTime: 300
  }
};
