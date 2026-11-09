// Hauptquest main-1-raven „Ein Gefallen am Eisenhof“ (world.md §5.2): Kessel entlässt Raven, die Spielfigur holt sie ab.
// Wege: gc-13, gc-15, [Ödnis], [Knast], [Gosse] → Raven kommt mit; sonst Flucht über den Schrottmarkt (gc-14 oder
// Aria-Ringkampf enc-markt-raven). Scheitern ist kein Fehlschlag: Abends sitzt Raven selbst im High Voltage.
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import { VEX, NOT_VEX, active, all, done, flag, l, nar, noFlag } from './_lib';

const Q = 'main-1-raven';

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  title: 'Ein Gefallen am Eisenhof',
  summary: 'Raven kommt nach sieben Jahren raus. Hunter will, dass jemand sie abholt – und heil ins High Voltage bringt.',
  giver: 'hunter',
  act: 1,
  autoStart: all(done('main-1-probezeit'), { dayAtLeast: 2 }),
  steps: [
    {
      id: 'tor',
      text: 'Sei morgens am Entlassungstor im Eisenhof. Wachtmeisterin Kessel lässt Raven raus.',
      done: { any: [flag('raven_entlassen'), flag('raven_frei')] },
      marker: { map: 'eisenhof' },
    },
    {
      id: 'einholen',
      text: 'Raven ist abgehauen, Richtung Schrottmarkt. Hol sie ein – oder lass sie laufen.',
      when: flag('raven_flucht'),
      done: { any: [flag('raven_frei'), flag('raven_laufen_gelassen')] },
      optional: true,
      marker: { map: 'schrottmarkt' },
    },
    {
      id: 'ringkampf',
      text: 'Aria regelt das. Mit dem Schwitzkasten.',
      when: flag('raven_flucht'),
      done: { won: 'enc-markt-raven' },
      optional: true,
      effects: [{ setFlag: 'raven_frei' }, { setFlag: 'raven_eingeholt' }],
    },
    {
      id: 'ankommen',
      text: 'Bring Raven ins High Voltage. Wenn sie nicht will: Abends sitzt sie bestimmt trotzdem am Tresen.',
      done: flag('raven_frei'),
      marker: { map: 'high-voltage' },
    },
  ],
  reward: {
    xp: 120,
    credits: 80,
    effects: [{ cutscene: 'main-1-raven-freeze' }],
  },
};

// ---------------------------------------------------------------------------
// Entlassungstor (eisenhof, morgens)

const tor: DialogueDef = {
  id: 'main-1-raven-tor',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Eisenhof, kurz nach sechs. Das Drehkreuz am Entlassungstor quietscht, als hätte es selbst sieben Jahre gesessen.'),
        l('wache', 'Häftling 4471, Raven. Persönliche Gegenstände: eine Jacke, schwarz. Ein Feuerzeug, leer. Ein Blick, tödlich. Unterschreiben Sie hier.', 'neutral'),
        l('raven', 'Wer will das wissen?', 'signatur'),
        l('wache', 'Die Strichliste, Raven. Die Strichliste will alles wissen.', 'neutral'),
        l('wache', 'Ich hoffe für Sie, dass wir uns nicht wiedersehen.', 'neutral'),
        l('raven', 'Ausnahmsweise sind wir uns einig, Kessel.', 'neutral'),
        nar('Raven tritt durch das Drehkreuz, blinzelt ins Neon und bleibt vor dir stehen. Sie mustert dich wie eine Tür, die sie gleich aufbrechen will.'),
        l('raven', 'Neue Schuhe, alte Tasche, und du riechst nach Hunters Kassenbuch. Er schickt dich.', 'neutral'),
      ],
      choices: [
        { text: '(Sie bleibt an deiner Jackentasche hängen. An der alten Dienstmarke.)', when: { origin: 'origin-ex-wache' }, next: 'bulle' },
        { text: '„Hunter schickt mich, ja.“', when: { not: { origin: 'origin-ex-wache' } }, next: 'angebot' },
      ],
    },
    {
      id: 'bulle',
      lines: [
        l('raven', 'Ein Bulle. Hunter schickt mir einen Bullen zum Abholen. Der Mann hat Humor, das muss man ihm lassen.', 'wut'),
        l('raven', 'Nachtschicht? Hast du mir damals das Licht ausgemacht? Egal. Vergiss es. Ich vergess es nicht.', 'neutral'),
      ],
      effects: [{ relation: 'raven', delta: -50 }],
      next: 'angebot',
    },
    {
      id: 'angebot',
      lines: [
        l('raven', 'Sag ihm, ich komm klar. Sieben Jahre lang hat er mir genau eine Postkarte geschickt. Drauf stand „Durchhalten“. Mit zwei T.', 'neutral'),
        l('raven', 'Ich hab durchgehalten. Jetzt halt ich mich an niemanden mehr.', 'signatur'),
      ],
      choices: [
        { text: '„Ich glaube eher, er schuldet dir was. Und Schulden muss man immer begleichen – sagt er selbst.“', check: 'gc-13', next: 'freiwillig' },
        { text: '„Erste Runde Neon-Limo im High Voltage geht aufs Haus. Hunters Haus. Er weiß es nur noch nicht.“', check: 'gc-15', next: 'limo' },
        { text: '„Ich bin unter freiem Himmel aufgewachsen. Ohne Smog. Komm mit, ich erzähl dir, wie echte Sterne aussehen.“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, next: 'himmel' },
        { text: '(Mit dem Knöchel ans Tor klopfen: drei kurz, zwei lang. „Draußen wartet wer.“)', tag: '[Knast]', when: { origin: 'origin-knastvogel' }, next: 'klopfcode' },
        { text: '„Ich komm aus der Rohrsiedlung. Wir haben da auch Leute, die keiner abholt.“', tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, next: 'gosse' },
        { text: '„Ich bin Kurierin. Du bist das Paket. Pakete werden zugestellt, ob sie wollen oder nicht.“', when: VEX, next: 'paket' },
        { text: '„Hunter will dich sehen. Heute. Mitkommen.“', next: 'flucht' },
        { text: '„Dann viel Glück da draußen.“', next: 'laufen' },
      ],
    },
    {
      id: 'freiwillig',
      lines: [
        l('raven', '…', 'ueberrascht'),
        l('raven', 'Das ist das Erste seit sieben Jahren, das nicht nach Bewährungshelfer klingt.', 'neutral'),
        l('raven', 'Okay. Ich komm mit. Freiwillig. Merk dir das Wort, ich benutz es nicht oft.', 'freude'),
        l('wache', 'Freiwillig. Ich notiere: freiwillig. Das ist neu auf meiner Liste.', 'ueberrascht'),
      ],
      effects: [{ setFlag: 'raven_entlassen' }, { setFlag: 'raven_freiwillig' }, { setFlag: 'raven_frei' }, { relation: 'raven', delta: 40 }],
    },
    {
      id: 'limo',
      lines: [
        l('raven', 'Neon-Limo. Sieben Jahre gab es Kantinentee, der nach Eisenspänen schmeckt.', 'neutral'),
        l('raven', 'Wenn die Limo warm ist, bring ich dich um. Und dann Hunter. In der Reihenfolge.', 'signatur'),
      ],
      effects: [{ setFlag: 'raven_entlassen' }, { setFlag: 'raven_frei' }, { setFlag: 'hv_runde_aufs_haus' }, { relation: 'raven', delta: 20 }],
    },
    {
      id: 'himmel',
      lines: [
        l('raven', 'Sterne. Wir hatten eine Neonröhre im Gang, die geflackert hat. Wir haben sie „Großer Wagen“ genannt.', 'trauer'),
        l('raven', 'Okay. Erzähl. Aber unterwegs. Ich will hier nicht eine Minute länger stehen als nötig.', 'neutral'),
      ],
      effects: [{ setFlag: 'raven_entlassen' }, { setFlag: 'raven_frei' }, { relation: 'raven', delta: 40 }],
    },
    {
      id: 'klopfcode',
      lines: [
        nar('Raven erstarrt. Dann klopft sie zurück, ohne hinzusehen: zwei kurz, drei lang. „Wer?“'),
        l('raven', 'Du hast gesessen.', 'ueberrascht'),
        l('raven', 'Dann weißt du, wie der erste Morgen draußen schmeckt. Nach Rost. Komm, ich lad dich auf einen ein. Hunter zahlt.', 'freude'),
      ],
      effects: [{ setFlag: 'raven_entlassen' }, { setFlag: 'raven_freiwillig' }, { setFlag: 'raven_frei' }, { relation: 'raven', delta: 40 }],
    },
    {
      id: 'gosse',
      lines: [
        l('raven', 'Die Rohrsiedlung gibt es noch? Dann gibt es Hoffnung.', 'ueberrascht'),
        l('raven', 'Gut. Ich komm mit. Aber ich lauf vorne.', 'neutral'),
      ],
      effects: [{ setFlag: 'raven_entlassen' }, { setFlag: 'raven_frei' }, { relation: 'raven', delta: 20 }],
    },
    {
      id: 'paket',
      lines: [
        l('raven', 'Hast du mich gerade „Paket“ genannt?', 'ueberrascht'),
        l('player', 'Zerbrechlich. Bitte nicht werfen.', 'signatur'),
        l('raven', 'Dann fang mich erst mal, Kurierin.', 'signatur'),
        nar('Sie flankt über das Drehkreuz und ist weg, bevor Kessel ihren Kuli zuklicken kann. Richtung Schrottmarkt.'),
        l('wache', 'Das ist technisch gesehen kein Fluchtversuch. Ich notiere es trotzdem.', 'wut'),
      ],
      effects: [{ setFlag: 'raven_entlassen' }, { setFlag: 'raven_flucht' }],
    },
    {
      id: 'flucht',
      lines: [
        l('raven', 'Hunter will. Hunter will immer. Sag ihm von mir: Hunter kann mich mal.', 'wut'),
        nar('Bevor du antworten kannst, ist Raven über das Drehkreuz gesprungen und zwischen zwei Lieferwagen verschwunden. Richtung Schrottmarkt.'),
        l('wache', 'Fluchtversuch nach der Entlassung. Ist technisch gesehen kein Fluchtversuch. Ich notiere es trotzdem.', 'wut'),
        l('wache', 'Und Sie notiere ich auch. Nur so. Für die Statistik.', 'neutral'),
      ],
      effects: [{ setFlag: 'raven_entlassen' }, { setFlag: 'raven_flucht' }],
    },
    {
      id: 'laufen',
      lines: [
        l('raven', 'Glück. Danke. Hab ich in sieben Jahren auch nicht gebraucht.', 'neutral'),
        nar('Sie geht. Langsam. Als wüsste sie genau, dass du ihr nachschaust. An der Ecke bleibt sie kurz stehen, ohne sich umzudrehen, und hebt eine Hand.'),
      ],
      effects: [
        { setFlag: 'raven_entlassen' },
        { setFlag: 'raven_laufen_gelassen' },
        { message: 'Raven findet den Weg ins High Voltage bestimmt allein. Abends.' },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Flucht über den Schrottmarkt (morgens/tagsüber)

const markt: DialogueDef = {
  id: 'main-1-raven-markt',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Raven steht auf dem Wellblechdach eines Gemüsestands und isst einen geklauten Apfel. Der Händler darunter schimpft in drei Sprachen. Sie winkt ihm zu.'),
        l('raven', 'Du schon wieder. Hartnäckig. Das mag Hunter an Leuten. Ich nicht.', 'signatur'),
        l('raven', 'Ich hab sieben Jahre lang einen Hof im Kreis abgelaufen. Ich will heute einfach mal geradeaus.', 'neutral'),
      ],
      choices: [
        { text: '(Kiste, Markise, Stromkasten – die Abkürzung über die Marktstände.)', check: 'gc-14', when: NOT_VEX, next: 'eingeholt' },
        { text: '(Dächer sind dein Revier. Drei Sätze, kein Anhalten.)', check: 'gc-14', when: VEX, next: 'eingeholt-vex' },
        { text: '„Aria? Schwitzkasten, bitte.“', when: { companion: 'aria' }, next: 'ringen' },
        { text: 'Hinterherrennen, so schnell es geht.', next: 'weg' },
        { text: '„Schon gut. Komm, wann du willst. Der Tresen ist ab acht offen.“', next: 'laufen' },
      ],
    },
    {
      id: 'eingeholt',
      lines: [
        nar('Obstkiste, Markise, Stromkasten – du stehst auf dem Dach neben ihr, bevor sie den Apfel fertig gegessen hat. Das Wellblech beult sich bedenklich.'),
        l('raven', '…Okay. Das war gut.', 'ueberrascht'),
        l('raven', 'Gehen wir zu Hunter. Ein Bier. Dann reden wir. Und wenn er eine Rede hält, gehe ich wieder.', 'freude'),
      ],
      effects: [{ setFlag: 'raven_eingeholt' }, { setFlag: 'raven_frei' }, { relation: 'raven', delta: 40 }],
    },
    {
      id: 'eingeholt-vex',
      lines: [
        nar('Du nimmst die Markise wie eine Rampe, den Kran-Ausleger wie ein Geländer und landest neben ihr, ohne dass das Wellblech auch nur scheppert.'),
        l('raven', 'Kurierin. Natürlich. Ihr lauft alle, als wär der Boden Lava.', 'ueberrascht'),
        l('player', 'Ist er auch. Du hast nur sieben Jahre lang nicht hingeschaut.', 'neutral'),
        l('raven', 'Frech. Gefällt mir. Ein Bier, dann reden wir.', 'freude'),
      ],
      effects: [{ setFlag: 'raven_eingeholt' }, { setFlag: 'raven_frei' }, { relation: 'raven', delta: 50 }],
    },
    {
      id: 'ringen',
      lines: [
        l('aria', 'Raven, Schätzchen! Lange nicht gesehen! Komm runter, ich will dich drücken. Fest. Sehr fest.', 'freude'),
        l('raven', 'Aria. Du hast immer noch keinen Sinn für Privatsphäre.', 'neutral'),
        l('aria', 'Ich hab einen Sinn für Schwitzkästen. Das ist fast dasselbe.', 'signatur'),
      ],
      effects: [{ battle: 'enc-markt-raven' }],
    },
    {
      id: 'weg',
      lines: [
        nar('Du rennst. Raven rennt schneller. Zwischen dem Plattenstand und der Garküche verlierst du sie und gewinnst einen Fleck Sojasoße auf dem Ärmel.'),
        l('raven', 'Sag Hunter, ich komm heute Abend! Vielleicht! Wenn mir danach ist!', 'freude'),
      ],
      effects: [{ setFlag: 'raven_laufen_gelassen' }],
    },
    {
      id: 'laufen',
      lines: [
        l('raven', 'Gute Antwort. Vielleicht komm ich genau deswegen.', 'neutral'),
        nar('Sie springt vom Dach, wirft dem Händler eine Münze zu, die nicht reicht, und verschwindet in der Menge.'),
      ],
      effects: [{ setFlag: 'raven_laufen_gelassen' }, { relation: 'raven', delta: 10 }],
    },
  ],
};

// ---------------------------------------------------------------------------
// Rückfall: abends sitzt Raven selbst im High Voltage

const selbst: DialogueDef = {
  id: 'main-1-raven-selbst',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Am Tresen sitzt jemand in Schwarz und trinkt Hunters teuersten Whisky, ohne zu fragen.'),
        l('raven', 'Hunter hat gesagt, du holst mich ab. Hab mich selbst geholt. Spart Zeit.', 'signatur'),
        l('hunter', 'Raven.', 'neutral'),
        l('raven', 'Hunter.', 'neutral'),
        l('hunter', 'Du siehst scheiße aus.', 'neutral'),
        l('raven', 'Du siehst alt aus. Wir haben beide was zu tun.', 'signatur'),
        nar('Einen Moment lang sieht es so aus, als würden sie sich prügeln. Dann zieht Hunter die Sonnenbrille runter, und Raven grinst. Fast.'),
      ],
      choices: [
        { text: '„Willkommen zurück, Raven.“', next: 'party' },
        { text: '„Der Whisky geht auf dich, Hunter.“', next: 'whisky' },
      ],
    },
    {
      id: 'whisky',
      lines: [l('hunter', 'Alles geht auf mich. Das ist mein Problem. Das war immer mein Problem.', 'besorgt')],
      next: 'party',
    },
    {
      id: 'party',
      lines: [
        l('hunter', 'Barkeeper. Musik. Wir feiern. Jetzt, bevor sie es sich anders überlegt.', 'freude'),
        l('barkeeper', 'Sieben Jahre Stille / dann kommt sie durch die Tür rein / Musik, lauter, jetzt.', 'neutral'),
      ],
      effects: [
        { setFlag: 'raven_kommt_selbst' },
        { setFlag: 'raven_frei' },
        { setFlag: 'raven_party_begonnen' },
        { relation: 'raven', delta: 10 },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Freeze Raven und Stadt-TV mit Blade

const freeze: CutsceneDef = {
  id: 'main-1-raven-freeze',
  title: 'Raven',
  beats: [
    {
      image: 'black',
      caption: 'Stadt-TV · irgendwo in der Unterstadt',
      fade: 'in',
      lines: [
        l('collin-charleston', 'Und jetzt live aus der Oberstadt: Blade Nocturne, Sicherheitschef von Quantum, mit einer Botschaft an alle Bürger!', 'freude'),
        l('blade', 'Noxius war nie sicherer. Wer die Vergangenheit ruhen lässt, hat eine Zukunft. Wer nicht … nun.', 'signatur'),
        l('raven', 'Ich hab sieben Jahre geruht, du Arschloch.', 'wut'),
      ],
    },
    {
      image: 'black',
      caption: 'FREEZE',
      sfx: 'switch',
      lines: [
        l('vega', 'Das ist Raven. Einbrecherin. Die Beste, die Hunter je hatte.', 'neutral'),
        l('vega', 'Vor sieben Jahren hat Blade sie im Digitech-Tresor an ein Rohr gekettet und ist mit dem Chip abgehauen. Sie hat nie jemanden verpfiffen. Nicht mal ihn.', 'trauer'),
        l('vega', 'Lieblingsfarbe: Schwarz. Zweitliebste: auch Schwarz. Entfernung zum nächsten Ärger: unter einem Meter.', 'freude'),
      ],
    },
    { image: 'black', caption: 'RAVEN – zurück im Spiel.', hold: 1500 },
  ],
};

const telefon: PhoneMessageDef = {
  id: 'tel-hunter-raven-abholen',
  from: 'hunter',
  text: 'Raven kommt morgen früh am Eisenhof raus. Entlassungstor, ab sechs. Hol sie ab und bring sie heil her. Sie wird nicht wollen. Sie will nie. – H.',
  auto: active(Q),
  replies: [
    { text: 'Bin da.' },
    { text: 'Und wenn sie nicht will?' , effects: [{ message: 'Hunter: „Dann sitzt sie heute Abend trotzdem an meinem Tresen. Sie kann nicht anders.“' }] },
  ],
};

// ---------------------------------------------------------------------------

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [tor.id]: tor, [markt.id]: markt, [selbst.id]: selbst },
  cutscenes: { [freeze.id]: freeze },
  phone: { [telefon.id]: telefon },
  news: {
    'news-main-1-raven': {
      id: 'news-main-1-raven',
      anchor: 'collin-charleston',
      headline: 'Entlassung am Eisenhof',
      lines: [
        l('collin-charleston', 'Entlassung am Eisenhof! Wachtmeisterin Kessel hofft, „dass wir uns nicht wiedersehen“.', 'freude'),
        l('collin-charleston', 'Augenzeugen berichten: Sie meinte es nett. Unglaublich!', 'ueberrascht'),
      ],
      when: done(Q),
      priority: 3,
    },
  },
  mapAdditions: {
    eisenhof: {
      npcs: [
        {
          id: 'main-1-raven-am-tor',
          npc: 'raven',
          // Neben dem Tor (Spot entlassungstor ist Kessels Platz): leicht links davon.
          at: [1235, 505],
          facing: 's',
          dialogue: tor.id,
          when: all(active(Q), { time: 'morgen' }),
          hideWhen: { any: [flag('raven_entlassen'), flag('raven_frei')] },
        },
      ],
    },
    schrottmarkt: {
      npcs: [
        {
          id: 'main-1-raven-auf-dem-dach',
          npc: 'raven',
          at: 'marktstaende',
          facing: 's',
          dialogue: markt.id,
          when: all(active(Q), flag('raven_flucht'), { time: ['morgen', 'tag'] }),
          hideWhen: { any: [flag('raven_frei'), flag('raven_laufen_gelassen')] },
        },
      ],
    },
    'high-voltage': {
      npcs: [
        {
          id: 'main-1-raven-am-tresen',
          npc: 'raven',
          at: 'bar-hocker',
          facing: 's',
          dialogue: selbst.id,
          when: all(active(Q), noFlag('raven_frei'), { time: ['abend', 'nacht'] }),
        },
      ],
    },
  },
};
