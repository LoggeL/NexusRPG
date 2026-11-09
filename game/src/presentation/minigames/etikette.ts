// akt-etikette: side-teekraenzchen (world.md §6, Nr. 32) im Penthouse der Chrome-Schwestern. Abwechselnd Besteck-Runden
// (Gang kommt, richtiges Besteck wählen) und Smalltalk-Runden (Seraphina, Sybella, Serenity sagen etwas, passende Antwort),
// jeweils unter Zeitdruck. Fauxpas kosten „Haltung“. Ausstrahlung: mehr Zeit; 7+: eine falsche Antwort je Runde fällt weg.
// Oberstadt-Herkunft: richtige Gabel leuchtet (world.md überspringt das Spiel für `[Oberstadt]` sonst ganz – das macht der Inhalt).
import { h } from '../dom/dom';
import { ending, speaker } from './kit';
import { chooseTimed } from './kit3';
import type { MinigameDef } from './types';
import { byLevel, pick, shuffle } from './util';

interface Course { dish: string; right: string; wrong: string[]; quip: string }
const COURSES: Course[] = [
  { dish: 'Austern auf Algen-Eis', right: 'Austerngabel (die winzige)', wrong: ['Suppenlöffel', 'Steakmesser', 'Finger'], quip: 'Seraphina: „Man schlürft. Leise. Wie ein Geheimnis.“' },
  { dish: 'Klare Synth-Brühe', right: 'Suppenlöffel (rund, rechts außen)', wrong: ['Dessertlöffel', 'Teelöffel', 'direkt aus der Tasse'], quip: 'Sybella: „Vom Körper weg schöpfen, Liebes. Immer vom Körper weg.“' },
  { dish: 'Steinbutt aus der Zuchtwanne', right: 'Fischmesser (das stumpfe Paddel)', wrong: ['Steakmesser', 'Buttermesser', 'Kuchengabel'], quip: 'Serenity: „Der Fisch hatte einen Namen. Ich hab ihn vergessen. Das ist auch eine Form von Trauer.“' },
  { dish: 'Wachtelei-Schaum mit Goldflocken', right: 'Kaviarlöffel aus Perlmutt', wrong: ['Silberlöffel', 'Strohhalm', 'Austerngabel'], quip: 'Sybella: „Silber verdirbt den Geschmack. Und den Ruf.“' },
  { dish: 'Zitronen-Sorbet zwischen den Gängen', right: 'Sorbetlöffel (der lange, dünne)', wrong: ['Suppenlöffel', 'Fischgabel', 'Zunge, direkt'], quip: 'Seraphina: „Das Sorbet reinigt den Gaumen. Und die Gesellschaft.“' },
  { dish: 'Rinderfilet aus dem Bioreaktor', right: 'Fleischmesser und große Gabel', wrong: ['Fischmesser', 'Buttermesser', 'Dessertgabel'], quip: 'Serenity: „Es ist aus einer Zelle gewachsen. Wie wir alle.“' },
  { dish: 'Petit Fours auf der Etagere', right: 'Kuchengabel (die mit der breiten Zinke)', wrong: ['Fleischgabel', 'Austerngabel', 'beide Hände'], quip: 'Sybella: „Eins. Man nimmt eins. Wer zwei nimmt, wird nicht wieder eingeladen.“' },
  { dish: 'Tee „Earl Chrome“', right: 'Tasse am Henkel, Untertasse in der Linken', wrong: ['Tasse mit beiden Händen', 'kleiner Finger ganz weit raus', 'pusten'], quip: 'Seraphina: „Der kleine Finger bleibt unten. Wir sind ja keine Influencer.“' },
];
interface Talk { who: string; line: string; right: string; wrong: string[]; ok: string; bad: string }
const TALKS: Talk[] = [
  { who: 'Seraphina', line: 'Und wie stehen Sie zum Quartal?', right: '„Ambitioniert, aber mit Haltung.“', wrong: ['„Welches Quartal? Bei uns unten ist immer Monatsende.“', '„Ich steh auf dem Quartal, wenn’s sein muss.“'], ok: 'Seraphina nickt, als hättest du eine Rede gehalten.', bad: 'Seraphina notiert etwas. Es ist nicht nett.' },
  { who: 'Sybella', line: 'Ihr Kleid … ist das Vintage oder Verzweiflung?', right: '„Vintage. Die Verzweiflung trage ich nur abends.“', wrong: ['„Vom Schrottmarkt, Stück drei Credits.“', '„Halt die Fresse, Sybella.“'], ok: 'Sybella lacht, echt und kurz. Selten.', bad: 'Sybella zieht eine Augenbraue hoch, bis sie fast den Kronleuchter erreicht.' },
  { who: 'Serenity', line: 'Glauben Sie, Pflanzen träumen?', right: '„Bestimmt. Wahrscheinlich von Regen.“', wrong: ['„Pflanzen sind Gemüse, Gnädigste.“', '„Nur die, die man raucht.“'], ok: 'Serenity strahlt dich an, als hättest du ihr einen Garten geschenkt.', bad: 'Serenity guckt in ihre Tasse, als würde sie gleich weinen.' },
  { who: 'Seraphina', line: 'Der Chip wird die Gesellschaft ordnen. Finden Sie nicht?', right: '„Ordnung ist schön. Solange man sie selbst wählt.“', wrong: ['„Ja, Master.“', '„Der Chip ist Scheiße und ihr wisst das.“'], ok: 'Seraphina hält kurz inne. Nur einen Herzschlag lang.', bad: 'Am Tisch wird es still. Sehr still. Man hört den Tee abkühlen.' },
  { who: 'Sybella', line: 'Wer hat Sie eigentlich eingeladen?', right: '„Eine gemeinsame Bekannte. Sie wäre gekränkt, wenn ich Namen nenne.“', wrong: ['„Eingeladen? Ich bin durch den Lieferanteneingang.“', '„Deine Mutter.“'], ok: 'Sybella lächelt dünn: „Natürlich. Diskretion. Wie reizend.“', bad: 'Sybella winkt Albert heran. Albert kommt nicht, aber das Winken reicht.' },
  { who: 'Serenity', line: 'Mögen Sie Gedichte?', right: '„Nur die kurzen. Die tun nicht so weh.“', wrong: ['„Rosen sind rot, Chrome ist blau …“', '„Ich mag Flüche. Zählt das?“'], ok: 'Serenity flüstert: „Ich schreibe auch. Heimlich. Sagen Sie’s niemandem.“', bad: 'Serenity nickt höflich und sehr, sehr traurig.' },
  { who: 'Seraphina', line: 'Und was machen Sie beruflich?', right: '„Beratung. Sehr diskret. Sehr teuer.“', wrong: ['„Bisschen Inkasso, bisschen Einbruch.“', '„Ich klau Kekse bei Dante.“'], ok: 'Seraphina: „Wir sollten uns einmal unterhalten. Unter vier Augen.“', bad: 'Seraphina lächelt, wie Haie lächeln, kurz bevor man ein Bein weniger hat.' },
  { who: 'Sybella', line: 'Ein Keks gefällig? Hausrezept.', right: '„Mit Vergnügen. Einen. Man ist ja diszipliniert.“', wrong: ['„Drei-Sekunden-Regel, Leute!“ (er war nicht runtergefallen)', '„Sind die von Dante? Die sind besser.“'], ok: 'Sybella: „Endlich jemand mit Manieren.“', bad: 'Sybella zieht den Teller weg. Langsam. Demonstrativ.' },
];

export const etikette: MinigameDef = {
  title: 'Teekränzchen bei Chrome',
  blurb: 'Das Penthouse der Chrome-Schwestern. Kristall, Seidentücher, Tee, der mehr kostet als dein Leben. Drei Schwestern beobachten jede Gabel. Ein Fauxpas zu viel, und Portier Albert begleitet dich hinaus.',
  controls: ['Antwort oder Besteck antippen', 'Tastatur: Ziffern 1–4 oder ↑/↓ + Leertaste', 'Die Uhr läuft bei jeder Frage – Zögern ist auch ein Fauxpas'],
  bonuses(ctx) {
    const a = ctx.attr('ausstrahlung');
    const lines = [`Ausstrahlung ${a}: +${(ctx.edge('ausstrahlung') * 3).toFixed(1)} s je Frage${a >= 7 ? ', eine falsche Antwort fällt weg' : ''}`];
    if (ctx.has({ origin: 'origin-oberstadt' })) lines.push('Oberstadt: Du bist mit diesem Besteck aufgewachsen – die richtige Wahl leuchtet');
    return lines;
  },
  async run(host, ctx) {
    const level = ctx.level;
    const rounds = byLevel(level, [6, 7, 8, 8, 9]);
    const time = byLevel(level, [7, 6, 5.5, 5, 4.5]) + ctx.edge('ausstrahlung') * 3;
    const fauxMax = byLevel(level, [3, 3, 2, 2, 1]);
    const options = byLevel(level, [3, 3, 4, 4, 4]);
    const trim = ctx.attr('ausstrahlung') >= 7;
    const posh = ctx.has({ origin: 'origin-oberstadt' });

    const table = h('div', { class: 'et-table' });
    const prompt = h('div', { class: 'et-prompt' });
    const answers = h('div', { class: 'et-answers' });
    const haltung = h('div', { class: 'et-haltung' });
    const hostess = speaker('et-say');
    table.append(h('div', { class: 'et-sisters' }, h('i', { class: 'et-sis seraphina' }, 'Seraphina'), h('i', { class: 'et-sis sybella' }, 'Sybella'), h('i', { class: 'et-sis serenity' }, 'Serenity')), prompt, answers, haltung, hostess.el);
    host.stage.append(h('div', { class: 'et-wrap' }, table));

    const end = ending();
    let faux = 0, good = 0;
    const renderHaltung = () => { haltung.textContent = `Haltung ${'◆'.repeat(Math.max(0, fauxMax - faux + 1))}`; host.setScore(`Gang ${Math.min(rounds, good + faux + 1)}/${rounds}`); };
    const courses = shuffle([...COURSES]);
    const talks = shuffle([...TALKS]);
    renderHaltung();
    hostess.say('Sybella: „Setzen Sie sich. Nein, nicht da. Da sitzt der Hund.“');
    await host.wait(1400);

    for (let r = 0; r < rounds && !end.over; r++) {
      answers.textContent = '';
      const course = r % 2 === 0;
      let rightText: string, wrong: string[], okLine: string, badLine: string;
      if (course) {
        const c = courses[(r / 2) % courses.length];
        prompt.replaceChildren(h('small', null, 'Es wird serviert:'), h('b', null, c.dish));
        rightText = c.right; wrong = c.wrong; okLine = c.quip; badLine = pick(['Drei Schwestern schauen gleichzeitig auf deine Hand. Synchron. Beängstigend.', 'Ein Diener nimmt dir das Besteck sanft aus der Hand und legt ein anderes hin.', 'Sybella: „Interessant. So isst man das also … unten.“']);
      } else {
        const t = talks[Math.floor(r / 2) % talks.length];
        prompt.replaceChildren(h('small', null, `${t.who}:`), h('b', null, `„${t.line}“`));
        rightText = t.right; wrong = t.wrong; okLine = t.ok; badLine = t.bad;
      }
      let picks = shuffle([...wrong]).slice(0, options - 1);
      if (trim && picks.length > 1) picks = picks.slice(0, picks.length - 1);
      const all = shuffle([rightText, ...picks]);
      const index = await chooseTimed(host, answers, all.map((text) => {
        const span = h('span', null, text);
        if (posh && course && text === rightText) span.classList.add('et-glow');
        return span;
      }), time, course ? 'cutlery' : 'talk');
      if (end.over) break;
      if (index >= 0 && all[index] === rightText) {
        good++; ctx.sfx('success'); host.pop('Formvollendet', 'good', 50, 30); hostess.say(okLine);
      } else {
        faux++; ctx.sfx('fail'); host.pop(index < 0 ? 'Zu lange gezögert!' : 'Fauxpas!', 'bad', 50, 30);
        hostess.say(index < 0 ? 'Seraphina: „Sie schweigen. Wie … unten.“' : badLine);
        table.classList.remove('shake'); void table.offsetWidth; table.classList.add('shake');
      }
      renderHaltung();
      if (faux > fauxMax) { end.finish(false); break; }
      await host.wait(1500);
    }
    const won = faux <= fauxMax;
    end.finish(won);
    host.summary(`Formvollendet ${good} · Fauxpas ${faux}`);
    host.summary(won
      ? (faux === 0 ? 'Seraphina: „Sie dürfen wiederkommen.“ Das hat sie seit 2079 zu niemandem gesagt.' : 'Sybella tupft sich den Mund: „Annehmbar. Für jemanden mit Ihren … Schuhen.“')
      : 'Portier Albert erscheint lautlos an deiner Schulter. „Darf ich Sie hinausbegleiten? Das war eine rhetorische Frage.“');
    return won;
  },
};
