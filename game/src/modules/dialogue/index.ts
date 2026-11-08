// Dialogablauf: Zeilen eines Knotens nacheinander, danach Effekte, dann Wahl, Fortsetzung oder Ende.
// Wahlen mit Schwellen-Check: erfüllt → wählbar (einmalig XP), nicht erfüllt → gesperrt oder ausgeblendet.
import { checkLabel, choiceSeenKey, fillName, missingText, resolveCheck } from '../campaign';
import type {
  CampaignPort, CheckEvaluation, DialogueChoice, DialogueChoiceView, DialogueLine, DialogueNode, DialogueSession,
  DialogueView, EffectOutcome,
} from '../contracts';

export { choiceKeyPart, choiceSeenKey } from '../campaign';

/** Schutz gegen Kreise aus zeilenlosen Knoten. */
const MAX_HOPS = 64;

interface ChoiceState { choice: DialogueChoice; index: number; view: DialogueChoiceView; evaluation?: CheckEvaluation }

export function createDialogueSession(campaign: CampaignPort, dialogueId: string): DialogueSession {
  const content = campaign.content;
  const def = Object.prototype.hasOwnProperty.call(content.dialogues, dialogueId) ? content.dialogues[dialogueId] : undefined;
  const nodes = new Map<string, DialogueNode>((def?.nodes ?? []).map(node => [node.id, node]));
  const collected: EffectOutcome = { requests: [], messages: [] };

  let node: DialogueNode | null = null;
  let lineIndex = 0;
  let effectsApplied = false;
  let choosing = false;
  let done = false;

  const absorb = (outcome: EffectOutcome) => {
    collected.requests.push(...outcome.requests);
    collected.messages.push(...outcome.messages);
  };

  const taken = (choice: DialogueChoice) => !!choice.once && campaign.hasSeen(choiceSeenKey(dialogueId, choice));

  /** Sichtbare Wahlen mit Check-Anzeige; `hiddenIfFailed` blendet nicht erfüllte Checks aus. */
  const visibleChoices = (): ChoiceState[] => {
    if (!node?.choices) return [];
    const out: ChoiceState[] = [];
    node.choices.forEach((choice, index) => {
      if (!campaign.evaluate(choice.when) || taken(choice)) return;
      const view: DialogueChoiceView = { index, text: fillName(choice.text, campaign.state().player.name), enabled: true };
      if (choice.tag) view.tag = choice.tag;
      if (choice.requires && !campaign.evaluate(choice.requires)) {
        view.enabled = false;
        view.reason = 'Voraussetzung fehlt.';
      }
      const check = resolveCheck(content, choice.check);
      let evaluation: CheckEvaluation | undefined;
      if (check) {
        evaluation = campaign.evaluateCheck(check);
        if (!evaluation.ok && evaluation.hiddenIfFailed) return;
        view.check = {
          checkId: check.id,
          attribute: evaluation.attribute,
          threshold: evaluation.threshold,
          value: evaluation.value,
          ok: evaluation.ok,
          missing: evaluation.missing,
          label: checkLabel(check),
          parts: evaluation.parts,
        };
        if (!evaluation.ok) {
          view.enabled = false;
          view.reason = missingText(evaluation);
        }
      }
      out.push(evaluation ? { choice, index, view, evaluation } : { choice, index, view });
    });
    return out;
  };

  const applyNodeEffects = () => {
    if (effectsApplied || !node) return;
    effectsApplied = true;
    if (node.effects?.length) absorb(campaign.apply(node.effects));
  };

  const finish = () => {
    done = true;
    choosing = false;
    node = null;
  };

  const enter = (nodeId: string | undefined, hops: number) => {
    const next = nodeId === undefined ? undefined : nodes.get(nodeId);
    if (!next || hops > MAX_HOPS) { finish(); return; }
    node = next;
    lineIndex = 0;
    effectsApplied = false;
    choosing = false;
    settle(hops);
  };

  /** Bringt die Sitzung nach einem Zeilenwechsel in einen anzeigbaren Zustand. */
  const settle = (hops: number) => {
    if (!node) { finish(); return; }
    const last = node.lines.length - 1;
    if (lineIndex < last) return;
    if (lineIndex === last && !node.choices?.length) return; // letzte Zeile zeigen, „Weiter“ führt fort
    applyNodeEffects();
    if (visibleChoices().length > 0) { choosing = true; lineIndex = Math.max(0, last); return; }
    if (lineIndex === last) return; // Wahlen alle ausgeblendet: Zeile noch zeigen
    enter(node.next, hops + 1);
  };

  const view = (): DialogueView => {
    const raw: DialogueLine | null = !done && node && node.lines.length ? node.lines[Math.min(lineIndex, node.lines.length - 1)] ?? null : null;
    const line = raw ? { ...raw, text: fillName(raw.text, campaign.state().player.name) } : null;
    const narrator = !line || line.speaker === 'narrator';
    return {
      dialogueId,
      nodeId: done || !node ? '' : node.id,
      line,
      speakerName: narrator || !line ? '' : campaign.displayName(line.speaker),
      portrait: narrator || !line ? null : campaign.portraitKey(line.speaker, line.portrait),
      choices: choosing ? visibleChoices().map(entry => entry.view) : null,
      done,
    };
  };

  const advance = (): DialogueView => {
    if (done || choosing || !node) return view();
    lineIndex += 1;
    settle(0);
    return view();
  };

  const choose = (index: number): { view: DialogueView; check?: CheckEvaluation } => {
    if (done || !choosing || !node) return { view: view() };
    const picked = visibleChoices().find(entry => entry.index === index);
    if (!picked || !picked.view.enabled) return { view: view() };
    const { choice } = picked;
    if (choice.once) campaign.markSeen(choiceSeenKey(dialogueId, choice));
    let check: CheckEvaluation | undefined;
    const ref = resolveCheck(content, choice.check);
    if (ref) {
      const passed = campaign.passCheck(ref);
      absorb(passed.outcome);
      check = passed.evaluation;
    }
    if (choice.effects?.length) absorb(campaign.apply(choice.effects));
    choosing = false;
    enter(choice.next, 0);
    return check ? { view: view(), check } : { view: view() };
  };

  if (def) enter(def.start, 0);
  else finish();

  return {
    view,
    advance,
    choose,
    outcome: () => ({ requests: [...collected.requests], messages: [...collected.messages] }),
  };
}
