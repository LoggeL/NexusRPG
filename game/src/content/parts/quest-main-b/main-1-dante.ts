// Hauptquest main-1-dante „Der Mann mit den Schallplatten“ (world.md §5.2). Anker: Dante lehnt ab.
// Wege: gc-19 Nyra darf schweigend mit · gc-18 Faxgerät (dante_notfall, side-eingehendes-fax) · [Schrott]
// wissen-zentrator · gc-20 am Fenster lauschen (Dantes Rat; Captain Kuschel geht an Nyra: nyra_hat_kuschel) ·
// Nachgespräch gc-21 → nyra_team. Wert-Flags nach Konvention §4.7 als boolesche Flags nyra_team_0 … nyra_team_3.
import type { ContentPart } from '../../part';
import type { DialogueDef, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import { VEX, active, all, done, flag, l, nar, noFlag } from './_lib';

const Q = 'main-1-dante';
const WACH = { time: ['morgen', 'tag', 'abend'] } as const;

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  title: 'Der Mann mit den Schallplatten',
  summary: 'Raven will Dante für Hunters Plan. Dante backt lieber Kekse. Vielleicht hat er recht. Vielleicht auch nicht.',
  giver: 'raven',
  act: 1,
  autoStart: done('main-1-auf-raven'),
  steps: [
    {
      id: 'tuer',
      text: 'Triff Raven vor Dantes Werkstatt in den Lötgassen (morgens bis abends – nachts schläft Dante).',
      done: flag('dante_tuer'),
      marker: { map: 'loetgassen' },
    },
    {
      id: 'besuch',
      text: 'Hör dir an, was Dante zu Hunters Plan sagt.',
      when: flag('dante_tuer'),
      done: flag('dante_abgelehnt'),
      marker: { map: 'dantes-werkstatt' },
    },
    {
      id: 'nyra',
      text: 'Rede mit Nyra, nachdem Dante abgelehnt hat.',
      when: flag('dante_abgelehnt'),
      done: flag('dante_nachgespraech'),
    },
  ],
  reward: {
    xp: 150,
    effects: [{ message: 'Dantes Werkstatt steht dir offen: Heilung, Einbau, und donnerstags Eins!' }],
  },
};

// ---------------------------------------------------------------------------
// Vor der Tür (loetgassen)

const tuer: DialogueDef = {
  id: 'main-1-dante-tuer',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Vor der Tür voller Aufkleber („Analog ist kein Verbrechen“, „Bitte nicht klingeln, Kekse im Ofen“) wartet Raven. Und neben ihr, mit einem Autogrammblock und sehr großen Augen: Nyra.'),
        l('raven', 'Sie ist uns gefolgt. Seit dem Club. Drei Häuserblocks. Sie denkt, ich merk das nicht.', 'neutral'),
        l('nyra', 'Ich bin nicht gefolgt! Ich hatte zufällig denselben Weg. Dreimal. Bitte, bitte, ich will ihn nur einmal sehen. Silent-Angel trifft den Meister! Ich sag auch nichts. Ich atme nicht mal laut.', 'freude'),
        l('raven', 'Nein. Dante hasst Fans. Dante hasst eigentlich alles, was nach 2060 gebaut wurde. Inklusive dir.', 'signatur'),
      ],
      choices: [
        { text: '„Sie kommt mit. Schweigend. Ein Wort, und sie wartet draußen.“', check: 'gc-19', next: 'mit' },
        { text: '„Lass die Kleine. Wer drei Blocks hinterherfährt, hat sich die Lieferung verdient.“', when: VEX, next: 'vex' },
        { text: '„Nyra, du wartest draußen. Sorry.“', next: 'draussen' },
      ],
    },
    {
      id: 'mit',
      lines: [
        l('raven', '…Na gut. Aber wenn sie quiekt, werf ich sie aus dem Fenster.', 'neutral'),
        nar('Nyra tut so, als würde sie ihren Mund abschließen und den Schlüssel verschlucken. Dann hustet sie, weil sie das zu überzeugend gemacht hat.'),
      ],
      effects: [{ setFlag: 'nyra_war_dabei' }, { relation: 'nyra', delta: 60 }, { setFlag: 'dante_tuer' }, { travel: 'dantes-werkstatt', entry: 'von-loetgassen' }],
    },
    {
      id: 'vex',
      lines: [
        l('raven', 'Kurierlogik. Großartig. Trotzdem nein.', 'neutral'),
        l('nyra', 'Danke, dass du’s versucht hast. Du bist cool. Also, so beängstigend cool.', 'freude'),
        nar('Nyra setzt sich auf die Kabeltrommel unter dem Werkstattfenster und tut so, als würde sie auf ihr Pad schauen.'),
      ],
      effects: [{ relation: 'nyra', delta: 20 }, { setFlag: 'dante_tuer' }, { travel: 'dantes-werkstatt', entry: 'von-loetgassen' }],
    },
    {
      id: 'draussen',
      lines: [
        l('nyra', 'Okay. Klar. Ich bin eh nur … Hintergrundrauschen.', 'trauer'),
        nar('Sie setzt sich auf die Kabeltrommel unter dem Werkstattfenster und tut so, als würde sie auf ihr Pad schauen.'),
      ],
      effects: [{ setFlag: 'dante_tuer' }, { travel: 'dantes-werkstatt', entry: 'von-loetgassen' }],
    },
  ],
};

// ---------------------------------------------------------------------------
// In der Werkstatt

const werkstatt: DialogueDef = {
  id: 'main-1-dante-werkstatt',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Die Werkstatt riecht nach Lötzinn, Vanille und angebranntem Zucker. Aus einem Plattenspieler knistert Swing. Auf dem Regal sitzt ein Plüschhase mit enormen Ohren und beobachtet euch.'),
        l('dante', 'Heiliges Kanonenrohr! Raven!', 'ueberrascht'),
        l('dante', 'Du bist draußen! Du bist … dünner! Willst du einen Keks? Der ist runtergefallen, aber: Drei-Sekunden-Regel!', 'freude'),
        l('raven', 'Hallo, Dante.', 'neutral'),
        nar('Einen Moment lang stehen die beiden da, zwei Meter auseinander, und keiner weiß, wohin mit den Händen. Captain Kuschel klappt ein Ohr nach unten.'),
        l('dante', 'Und du bist der Neuling. Hunter hat erzählt. Du riechst nach Club und Ehrgeiz. Fass nichts an, was blinkt. Und nichts, was nicht blinkt, das ist meistens schlimmer.', 'signatur'),
      ],
      choices: [
        { text: '(Zum Faxgerät gehen.) „Ist das ein Fernkopierer von 2060? Mit echtem Thermopapier?“', check: 'gc-18', next: 'fax' },
        { text: '„Dein Zentrator da drüben. Du hast die Kühlung umgedreht, oder? Damit er nicht überschwingt.“', tag: '[Schrott]', when: { origin: 'origin-schrott' }, next: 'zentrator' },
        { text: '(Den Keks nehmen. Drei Sekunden sind drei Sekunden.)', next: 'keks' },
        { text: '„Wir sind nicht zum Plaudern hier.“', next: 'frage' },
      ],
    },
    {
      id: 'fax',
      lines: [
        l('dante', 'Er hat „Thermopapier“ gesagt! Captain, hast du das gehört?', 'freude'),
        nar('Captain Kuschel stellt beide Ohren auf.'),
        l('dante', 'Das ist ein FX-Fernkopierer, Baujahr 2060. Das letzte Gerät in dieser Stadt, das keiner abhören kann, weil keiner mehr weiß, wie es funktioniert. Außer mir.', 'signatur'),
        l('dante', 'Wenn du mal in Not bist – echte Not, nicht „mein Implantat juckt“-Not – dann faxt du mir. Ich hab da so meine Nummer. Und morgens um sechs kommen manchmal Faxe, von denen ich nicht weiß, wer sie schickt. Interessiert dich das?', 'neutral'),
      ],
      effects: [{ relation: 'dante', delta: 60 }, { setFlag: 'dante_notfall' }, { setFlag: 'dante_vertraut' }],
      next: 'fax-quest',
    },
    {
      // Eigener Knoten: startQuest allein, damit eine fehlende Nebenquest den Rest nicht zurückrollt.
      id: 'fax-quest',
      lines: [l('dante', 'Später. Erst mal Raven. Sie guckt schon so, wie sie früher geguckt hat, kurz bevor sie Türen eingetreten hat.', 'besorgt')],
      effects: [{ startQuest: 'side-eingehendes-fax' }],
      next: 'frage',
    },
    {
      id: 'zentrator',
      lines: [
        l('dante', 'Umgedreht! Natürlich umgedreht! Endlich jemand, der nicht „Was ist ein Zentrator?“ fragt!', 'ueberrascht'),
        l('dante', 'Die Quantum-Dinger laufen alle mit Vorwärtskühlung, weißt du? Sieht hübsch aus, schwingt aber bei Last über. Dreh die Kühlung um, und das Ding wird fromm wie ein Lamm. Außer man zieht hier –', 'freude'),
        nar('Er kritzelt auf eine Serviette: Spulen, Pfeile, ein Totenkopf mit Sonnenbrille. Dann schiebt er sie dir rüber, als wäre es ein Liebesbrief.'),
        l('dante', 'Behalt das. Nur so. Falls du mal einem Zentrator begegnest, der dir unsympathisch ist.', 'signatur'),
      ],
      effects: [{ give: 'wissen-zentrator' }, { relation: 'dante', delta: 100 }, { setFlag: 'dante_vertraut' }],
      next: 'frage',
    },
    {
      id: 'keks',
      lines: [
        nar('Der Keks schmeckt nach Butter, Zimt und ganz leicht nach Werkstattboden.'),
        l('dante', 'Siehst du! Drei Sekunden! Die Wissenschaft lügt nicht.', 'freude'),
      ],
      effects: [{ relation: 'dante', delta: 20 }],
      next: 'frage',
    },
    {
      id: 'frage',
      lines: [
        l('raven', 'Dante. Hunter plant was. Was Großes. Quantum. Das Labor auf dem Campus.', 'neutral'),
        l('raven', 'Wir brauchen jemanden, der durch deren Netz kommt, ohne dass das Netz merkt, dass er da war. Wir brauchen dich.', 'besorgt'),
        nar('Dante hört auf zu lächeln. Er hebt die Nadel von der Platte. Die Stille ist lauter als der Swing.'),
        l('dante', 'Nein.', 'trauer'),
        l('raven', 'Du hast nicht mal –', 'wut'),
        l('dante', 'Ich hab zehntausend Stunden gesessen, Raven. Ich hab sie gezählt. Zehntausend. In der Zeit hab ich gelernt, wie man aus Zahnpasta und einem Radiowecker einen Lötkolben baut. Und dass ich da nie wieder reingehe.', 'trauer'),
        l('dante', 'Ich bin im Ruhestand. Ich backe Kekse. Ich verliere donnerstags beim Eins! gegen Kinder. Das ist mein Leben, und es ist ein gutes Leben. Um Himmels Willen, es ist ein gutes Leben!', 'wut'),
      ],
      choices: [
        { text: '„Ohne dich geht Raven trotzdem rein. Nur eben ohne Netz.“', next: 'druck' },
        { text: '„Okay. Dein Leben, deine Entscheidung.“', next: 'respekt' },
        { text: '„Zehntausend Stunden. Und jetzt hast du Angst vor einer einzigen Nacht?“', next: 'stich' },
      ],
    },
    {
      id: 'druck',
      lines: [
        l('dante', 'Das ist nicht fair.', 'besorgt'),
        l('raven', 'Nichts ist fair. Ich hab’s sieben Jahre lang nachgezählt.', 'wut'),
      ],
      next: 'raus',
    },
    {
      id: 'respekt',
      lines: [l('dante', 'Danke. Wirklich. Das sagt hier unten sonst keiner.', 'trauer')],
      effects: [{ relation: 'dante', delta: 20 }],
      next: 'raus',
    },
    {
      id: 'stich',
      lines: [
        l('dante', 'Vor einer Nacht? Nein. Vor dem, was danach kommt. Da kommt immer was danach.', 'wut'),
        l('dante', 'Nimm, was du kriegen kannst, und hau ab. Das hätte ich damals tun sollen.', 'trauer'),
      ],
      effects: [{ relation: 'dante', delta: -10 }],
      next: 'raus',
    },
    {
      id: 'raus',
      lines: [
        l('raven', 'Weißt du was? Vergiss es. Vergiss mich. Hast du ja eh sieben Jahre lang geübt.', 'wut'),
        nar('Die Tür knallt. Ein Aufkleber („Analog ist kein Verbrechen“) segelt zu Boden. Dante starrt auf die Tür, als könnte er sie mit Blicken wieder aufmachen.'),
        l('dante', 'Geh ihr nach, ja? Sie läuft sonst bis zur Flutmauer und wirft Steine ins Wasser. Und sie trifft immer was.', 'besorgt'),
      ],
      effects: [{ setFlag: 'dante_abgelehnt' }],
      choices: [
        { text: '(Zur Tür gehen.)', when: flag('nyra_war_dabei'), next: 'raus-nyra' },
        { text: '(Zur Tür gehen.)', when: noFlag('nyra_war_dabei'), next: 'raus-allein' },
      ],
    },
    {
      id: 'raus-nyra',
      lines: [
        l('dante', 'Und die Kleine – bleib kurz. Ja, du. Silent-Angel. Ich hab deinen Code gelesen. Den mit dem Fehler in Zeile vierzig.', 'neutral'),
        nar('Nyra wird rot bis unter den Haaransatz. Dante schiebt dich sanft, aber bestimmt hinaus. Hinter dir fällt die Tür zu. Das Fenster mit den VHS-Hüllen steht einen Spalt offen.'),
      ],
      next: 'fenster',
    },
    {
      id: 'raus-allein',
      lines: [
        nar('Draußen in den Lötgassen ist Raven schon um die Ecke. Hinter dir geht das Werkstattfenster auf. Dante lehnt sich hinaus, zu Nyra auf der Kabeltrommel.'),
        l('dante', 'Du. Silent-Angel. Ich hab deinen Code gelesen. Den mit dem Fehler in Zeile vierzig. Komm mal her.', 'neutral'),
      ],
      next: 'fenster',
    },
    {
      id: 'fenster',
      lines: [nar('Dantes Stimme wird leise. Er redet mit Nyra, und er klingt anders als eben. Älter. Ehrlicher.')],
      choices: [
        { text: '(Am Fenster stehen bleiben. Lauschen.)', check: 'gc-20', next: 'lauschen' },
        { text: '(Raven nachgehen.)', next: 'weiter' },
      ],
    },
    {
      id: 'lauschen',
      lines: [
        l('dante', 'Du willst zur Crew. Ich seh’s dir an. Du hast den Blick, den ich mit zwanzig hatte. Hunger.', 'neutral'),
        l('dante', 'Pass auf, Kleine. Die sagen dir, allein ist man frei. Keine Verantwortung, keine Rechnung, keiner, der dich verpfeift.', 'besorgt'),
        l('dante', 'Stimmt nicht. Allein ist man nicht frei. Nur allein.', 'trauer'),
        l('dante', 'Nimm den hier mit. Captain Kuschel. Er passt auf dich auf. Er ist sehr streng.', 'freude'),
        l('nyra', 'Den … den Captain? Ich darf den Captain …?', 'ueberrascht'),
        l('dante', 'Leihweise. Bring ihn heil zurück. Und bring dich heil zurück, das ist wichtiger. Viel wichtiger.', 'neutral'),
        nar('Captain Kuschel wechselt die Besitzerin. Ein Ohr hoch, eins geknickt. Skeptisch, aber einverstanden.'),
      ],
      effects: [{ setFlag: 'dantes_rat_gehoert' }, { setFlag: 'nyra_hat_kuschel' }, { relation: 'dante', delta: 20 }],
      next: 'nachgespraech',
    },
    {
      id: 'weiter',
      lines: [
        nar('Du gehst Raven nach. Sie lehnt an der Ecke und raucht nicht, sehr demonstrativ. Als du dich umdrehst, kommt Nyra aus der Gasse, einen Plüschhasen mit enormen Ohren fest an die Brust gedrückt, als hätte ihr jemand einen Stern geschenkt.'),
      ],
      effects: [{ setFlag: 'nyra_hat_kuschel' }],
      next: 'nachgespraech',
    },
    {
      id: 'nachgespraech',
      lines: [
        nar('Raven stapft voraus, Richtung Neon-Gasse. Nyra bleibt neben dir stehen, den Hasen im Arm.'),
        l('nyra', 'Er hat Nein gesagt. Dante hat Nein gesagt. Zu Raven. Zu uns.', 'besorgt'),
        l('nyra', 'Vielleicht hat er recht. Vielleicht ist es besser, man macht alles allein. Dann kann einen keiner hängen lassen. Ich bin eh gut allein. Ich bin super allein. Ich bin Weltmeisterin im Alleinsein.', 'trauer'),
      ],
      choices: [
        { text: '„Allein ist man nicht frei, Nyra. Nur allein.“', check: 'gc-21', next: 'team2' },
        { text: '„Er hat dir was gesagt, am Fenster. Ich hab’s gehört. Er meinte uns. Er meinte dich.“', tag: '[Dantes Rat]', when: flag('dantes_rat_gehoert'), next: 'team3' },
        { text: '„Du bist nicht allein. Du hast jetzt uns. Und einen Hasen.“', next: 'team1' },
        { text: '„Heul nicht. Wir brauchen ihn nicht.“', next: 'team0' },
      ],
    },
    {
      id: 'team2',
      lines: [
        l('nyra', '…Das hat er auch gesagt. Fast genau so.', 'ueberrascht'),
        l('nyra', 'Okay. Okay! Dann bin ich nicht allein. Ich bin Team. Team Silent-Angel. Nein. Team Crew. Team … ihr wisst schon.', 'freude'),
      ],
      effects: [{ setFlag: 'nyra_team_2' }, { relation: 'nyra', delta: 40 }, { setFlag: 'dante_nachgespraech' }],
    },
    {
      id: 'team3',
      lines: [
        l('nyra', 'Du hast gelauscht?', 'ueberrascht'),
        l('nyra', 'Er meinte … uns?', 'trauer'),
        l('nyra', 'Dann geh ich nirgendwo mehr allein hin. Versprochen. Und wenn doch, dann holt ihr mich. Ja? Versprochen?', 'freude'),
        l('player', 'Versprochen.', 'neutral'),
        nar('Captain Kuschel stellt beide Ohren auf. Das ist, sagt Dante später, ein Vertrag.'),
      ],
      effects: [{ setFlag: 'nyra_team_3' }, { relation: 'nyra', delta: 60 }, { setFlag: 'dante_nachgespraech' }],
    },
    {
      id: 'team1',
      lines: [l('nyra', 'Einen Hasen. Mit Ohren. Mit enorm guten Ohren. … Okay. Das ist was.', 'freude')],
      effects: [{ setFlag: 'nyra_team_1' }, { relation: 'nyra', delta: 20 }, { setFlag: 'dante_nachgespraech' }],
    },
    {
      id: 'team0',
      lines: [l('nyra', 'Wow. Danke. Sehr crewig von dir.', 'wut')],
      effects: [{ setFlag: 'nyra_team_0' }, { relation: 'nyra', delta: -20 }, { setFlag: 'dante_nachgespraech' }],
    },
  ],
};

// Rückfall: Wer das Gespräch vor dem Nachgespräch abbricht, findet Nyra danach vor der Werkstatt.
const nyraDanach: DialogueDef = {
  id: 'main-1-dante-nyra',
  start: 'nachholen',
  nodes: [
    {
      id: 'nachholen',
      lines: [nar('Nyra sitzt auf der Kabeltrommel vor der Werkstatt, einen Plüschhasen mit enormen Ohren fest im Arm. Dante hat ihn ihr durchs Fenster gereicht.')],
      effects: [{ setFlag: 'nyra_hat_kuschel' }],
      next: 'nachgespraech',
    },
    ...werkstatt.nodes.filter(node => node.id === 'nachgespraech' || node.id.startsWith('team')),
  ],
};

const telefon: PhoneMessageDef = {
  id: 'tel-raven-dante',
  from: 'raven',
  text: 'Wir brauchen Dante. Lötgassen, die Tür mit den Aufklebern. Ich rede, du nickst. Komm tagsüber, nachts schläft er wie ein Toter. Mit Schnarchen im Takt.',
  auto: active(Q),
  replies: [{ text: 'Ich nicke gut.' }, { text: 'Wer ist Dante?', effects: [{ message: 'Raven: „Der Beste. Früher. Frag nicht weiter.“' }] }],
};

// ---------------------------------------------------------------------------

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [tuer.id]: tuer, [werkstatt.id]: werkstatt, [nyraDanach.id]: nyraDanach },
  phone: { [telefon.id]: telefon },
  mapAdditions: {
    loetgassen: {
      onEnter: [
        { id: 'main-1-dante-vor-der-tuer', when: all(active(Q), noFlag('dante_tuer'), WACH), dialogue: tuer.id },
      ],
      hotspots: [
        {
          id: 'main-1-dante-klopfen',
          at: 'werkstatt-tuer',
          label: 'An Dantes Tür klopfen',
          kind: 'talk',
          dialogue: tuer.id,
          when: all(active(Q), noFlag('dante_tuer'), WACH),
        },
        {
          id: 'main-1-dante-nachts',
          at: 'werkstatt-tuer',
          label: 'Dantes Tür',
          kind: 'look',
          when: all(active(Q), noFlag('dante_tuer'), { time: 'nacht' }),
          lines: [nar('Hinter der Tür schnarcht jemand im Takt einer Schallplatte, die längst zu Ende ist. Raven hat recht: Tagsüber wiederkommen.')],
        },
      ],
      npcs: [
        {
          id: 'main-1-dante-nyra-fenster',
          npc: 'nyra',
          at: 'werkstatt-fenster',
          facing: 'n',
          when: all(active(Q), noFlag('dante_abgelehnt'), WACH),
        },
        {
          id: 'main-1-dante-nyra-danach',
          npc: 'nyra',
          at: 'werkstatt-fenster',
          facing: 's',
          dialogue: nyraDanach.id,
          when: all(active(Q), flag('dante_abgelehnt'), noFlag('dante_nachgespraech')),
        },
      ],
    },
    'dantes-werkstatt': {
      onEnter: [
        { id: 'main-1-dante-besuch', when: all(active(Q), flag('dante_tuer'), noFlag('dante_abgelehnt')), dialogue: werkstatt.id },
      ],
      hotspots: [
        {
          id: 'main-1-dante-reden',
          at: 'werkbank',
          label: 'Mit Dante reden (Hunters Plan)',
          kind: 'talk',
          dialogue: werkstatt.id,
          when: all(active(Q), flag('dante_tuer'), noFlag('dante_abgelehnt')),
        },
      ],
    },
  },
};
