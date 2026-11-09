// Hauptquest main-1-auf-raven „Auf Raven!“ (world.md §5.2): Party ohne Kämpfe im High Voltage, abends/nachts.
// Tanz-Minispiel, drei Gerüchte vom Barkeeper, gc-16 Quantum-Fahrer (→ geruecht-master, Weg ohne Check: Runde
// ausgeben), Nyra und das Meer, Toast „Auf Raven!“ (gc-17 Rede auf dem Tresen), Streit Hunter/Raven über Blade,
// Partyfoto. Vex × Aria hat Vorrang (Nutzerwunsch): Tanz und Foto haben eigene Romanze- und Rivalinnen-Fassungen.
import type { ContentPart } from '../../part';
import type { DialogueDef, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import { ARIA_ROM_GENERIC, VEX, VEXARIA, active, all, done, flag, l, nar, noFlag } from './_lib';

const Q = 'main-1-auf-raven';
const PARTY = all(active(Q), flag('raven_party_begonnen'));

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  title: 'Auf Raven!',
  summary: 'Hunter schmeißt eine Party für Raven. Keine Kämpfe, keine Schulden, keine Leichen. Nur ein Toast – und alte Wunden.',
  giver: 'hunter',
  act: 1,
  autoStart: done('main-1-raven'),
  steps: [
    {
      id: 'ankommen',
      text: 'Komm abends ins High Voltage: Party für Raven.',
      done: flag('raven_party_begonnen'),
      marker: { map: 'high-voltage' },
    },
    {
      id: 'tanzen',
      text: 'Optional: Tanz mit der Crew auf der Tanzfläche.',
      when: flag('raven_party_begonnen'),
      done: flag('party_getanzt'),
      optional: true,
      marker: { map: 'high-voltage' },
    },
    {
      id: 'geruechte',
      text: 'Optional: Der Barkeeper kennt die Gerüchte der Woche.',
      when: flag('raven_party_begonnen'),
      done: flag('party_geruechte'),
      optional: true,
    },
    {
      id: 'fahrer',
      text: 'Optional: Zwei Quantum-Fahrer in der Sitzecke reden zu laut über ihren Chef.',
      when: flag('raven_party_begonnen'),
      done: { item: 'geruecht-master' },
      optional: true,
    },
    {
      id: 'nyra',
      text: 'Optional: Nyra sitzt allein in der Laptop-Ecke.',
      when: flag('raven_party_begonnen'),
      done: flag('party_nyra_meer'),
      optional: true,
    },
    {
      id: 'toast',
      text: 'Bring am Tresen den Toast auf Raven aus.',
      when: flag('raven_party_begonnen'),
      done: flag('raven_partyfoto'),
    },
  ],
  reward: {
    xp: 100,
    effects: [{ recruit: 'raven' }, { message: 'Raven kann dich ab jetzt begleiten.' }],
  },
};

// ---------------------------------------------------------------------------
// Auftakt

const intro: DialogueDef = {
  id: 'main-1-auf-raven-intro',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Das High Voltage ist voller als an Zahltagen. Über dem Tresen hängt ein Banner aus Bettlaken: „WILLKOMMEN ZURÜCK RAVEN“. Das zweite R fehlt. Es steht „AVEN“ da.'),
        l('hunter', 'Neuling. Heute Abend gelten drei Regeln. Keine Kämpfe. Keine Schulden eintreiben. Und keiner fasst meine Musikanlage an.', 'signatur'),
        l('hunter', 'Wer sich prügelt, putzt die Klos. Mit der Zahnbürste. Mit seiner eigenen.', 'neutral'),
        l('aria', 'Wer das zweite R geklaut hat, kriegt den Schläger! … Ich war’s. Es war unterwegs. Es ist runtergefallen. Es ist jetzt Kunst.', 'freude'),
        l('vega', 'Sitzecke links: zwei Quantum-Fahrer. Trinken auf Spesen und reden auf Lautstärke elf. Nur so als Hinweis.', 'neutral'),
        l('raven', 'Zu viele Leute. Zu laut. Zu bunt.', 'neutral'),
        l('raven', '…Danke. Sag’s keinem.', 'freude'),
      ],
      choices: [
        { text: '„Schickes Banner, Zöpfe. Fehlt nur ein R und Geschmack.“', when: VEX, next: 'vex' },
        { text: 'Party!', next: 'los' },
      ],
    },
    {
      id: 'vex',
      lines: [
        l('aria', 'Halt die Klappe, Postbotin, und hol dir was zu trinken. Du siehst durstig aus.', 'signatur'),
        l('aria', 'Und zwar nicht nach Limo.', 'freude'),
        l('vega', '(leise) Das war jetzt ein Hinweis. Auch nur so.', 'neutral'),
      ],
      effects: [{ relation: 'aria', delta: 10 }],
      next: 'los',
    },
    {
      id: 'los',
      lines: [nar('Der Bass setzt ein. Irgendwo bricht ein Barhocker. Die Party hat begonnen.')],
      effects: [{ setFlag: 'raven_party_begonnen' }],
    },
  ],
};

// ---------------------------------------------------------------------------
// Tanzfläche (Minispiel akt-tanz) und Vex × Aria

const tanzEnde = [
  nar('Dann knallt Hunter ein Glas auf den Tresen. „TOAST IN FÜNF MINUTEN! WER NICHT DA IST, ZAHLT!“'),
];

const tanz: DialogueDef = {
  id: 'main-1-auf-raven-tanz',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('DJ Lumo legt etwas auf, das klingt wie ein Kühlschrank, der sich verliebt hat. Die halbe Crew ist schon auf der Fläche. Raven steht am Rand und wippt mit genau einem Fuß.'),
      ],
      choices: [
        { text: '(Aria schaut von der Tanzfläche zu dir rüber. Lange. Dann krümmt sie einen Finger.)', when: VEXARIA, next: 'vexaria' },
        { text: '(Aria winkt dich mit dem Schläger zu sich. Das ist keine Bitte.)', when: ARIA_ROM_GENERIC, next: 'aria' },
        { text: 'Aria zum Tanzduell herausfordern.', when: all(VEX, { not: VEXARIA }), next: 'duell' },
        { text: 'Raven auf die Tanzfläche ziehen.', next: 'raven' },
        {
          text: 'Einfach tanzen.',
          effects: [{
            minigame: 'akt-tanz', level: 1, key: 'auf-raven-tanz', label: 'Tanz für Raven',
            win: [{ setFlag: 'party_getanzt' }, { relation: 'raven', delta: 20 }, { message: 'Raven wippt jetzt mit beiden Füßen.' }],
            lose: [{ setFlag: 'party_getanzt' }, { message: 'Du tanzt wie ein Gabelstapler im Rückwärtsgang. Raven lacht. Zählt auch.' }],
          }],
        },
        { text: 'Lieber an der Wand lehnen.' },
      ],
    },
    {
      id: 'raven',
      lines: [
        l('raven', 'Fass mich an, und du verlierst die Hand.', 'signatur'),
        nar('Du hältst ihr die Hand hin. Sie schaut sie an wie einen Dietrich, von dem sie nicht weiß, ob er passt.'),
        l('raven', '…Ein Lied. Eins. Und wenn jemand filmt, stirbt er.', 'freude'),
        nar('Es werden drei Lieder. Der Kameramann filmt. Sein Visier zeigt „[ICH STERBE GERN]“.'),
      ],
      effects: [{ setFlag: 'party_getanzt' }, { relation: 'raven', delta: 30 }],
    },
    {
      id: 'duell',
      lines: [
        l('aria', 'Die Postbotin will tanzen? Wer zuerst stolpert, zahlt die nächste Runde. Für alle. Auch für Ripper.', 'signatur'),
        l('player', 'Ich stolper nicht. Ich lauf seit zehn Jahren über Dächer.', 'neutral'),
        l('aria', 'Dächer haben keinen Bass, Rennsemmel.', 'freude'),
      ],
      choices: [
        {
          text: 'Tanzduell!',
          effects: [{
            minigame: 'akt-tanz', level: 2, key: 'auf-raven-tanzduell', label: 'Tanzduell gegen Aria',
            win: [{ setFlag: 'party_getanzt' }, { relation: 'aria', delta: 20 }, { message: 'Aria, schwer atmend: „War nicht komplett scheiße.“ – Moment. Das ist DEIN Spruch.' }],
            lose: [{ setFlag: 'party_getanzt' }, { relation: 'aria', delta: 10 }, { message: 'Du stolperst über ein Kabel. Aria jubelt, als hätte sie die Weltmeisterschaft gewonnen.' }],
          }],
        },
        { text: '„Ein andermal, Großmaul.“', effects: [{ setFlag: 'party_getanzt' }] },
      ],
    },
    // --- Vex × Aria, Romanzefassung (Station-unabhängiger Partymoment, kein Kuss: der gehört Station 9)
    {
      id: 'vexaria',
      lines: [
        nar('Du gehst rüber. Aria hakt zwei Finger in deine Gurtriemen und zieht dich das letzte Stück heran, bis zwischen euch nicht mal mehr ein Brief passt.'),
        l('aria', 'Sieh an. Die Postbotin liefert persönlich.', 'signatur'),
        l('player', 'Unterschrift bei Empfang.', 'neutral'),
        l('aria', 'Wo soll ich unterschreiben?', 'verlegen'),
        nar('Der Bass rollt durch den Boden und durch dich durch. Ihre Metallhand liegt flach auf deinem Top, unter dem Gurtzeug, genau da, wo dein Herz gerade versucht, die Rippen aufzustemmen. Sie merkt es. Natürlich merkt sie es.'),
        l('aria', 'Du klopfst ja wie ein kaputter Kolben, Postbotin.', 'zaertlich'),
      ],
      choices: [
        { text: '(Finger in ihre Zöpfe. Näher ran.)', next: 'vexaria-naeher' },
        { text: '„Halt die Klappe und führ, Großmaul.“', next: 'vexaria-fuehren' },
        { text: '(Einen halben Schritt zurück. Noch nicht.)', next: 'vexaria-zurueck' },
      ],
    },
    {
      id: 'vexaria-naeher',
      lines: [
        nar('Deine Finger finden ihre Zöpfe, die Locken am Ende, warm und ein bisschen feucht vom Tanzen. Aria atmet aus, ganz knapp an deinem Mundwinkel vorbei. Ihr Atem riecht nach Volt-Limo und Ärger.'),
        l('aria', 'Wenn du jetzt anhältst, bring ich dich um.', 'zaertlich'),
        l('player', 'Ich halt nie an.', 'neutral'),
        l('aria', '…Genau das hab ich befürchtet.', 'verlegen'),
        nar('Ihre Hüfte findet deinen Takt, oder deiner ihren, und eine Weile gibt es nur noch Bass, Hitze und ihre Fingerknöchel, die langsam an deinem Gurtriemen auf und ab fahren.'),
        ...tanzEnde,
        nar('Aria lässt dich los, als hättest du Strom geführt. Dann grinst sie schief.'),
        l('aria', 'Später, Postbotin. Ich hab noch nicht entschieden, ob ich dich küsse oder verprügle.', 'freude'),
        l('aria', 'Vielleicht beides. In der Reihenfolge, die dir weniger gefällt.', 'signatur'),
      ],
      effects: [{ setFlag: 'party_getanzt' }, { setFlag: 'vexaria_party_tanz' }, { relation: 'aria', delta: 40 }],
    },
    {
      id: 'vexaria-fuehren',
      lines: [
        l('aria', 'Oh. Sie gibt Befehle.', 'freude'),
        nar('Sie führt. Natürlich führt sie. Eine Drehung, ein Ruck an den Gurtriemen, und du landest mit dem Rücken an ihr, ihr Kinn auf deiner Schulter, ihr Arm quer über deinem Bauch.'),
        l('aria', 'So. Und jetzt sag noch mal Großmaul. Langsam. Direkt hier hin.', 'zaertlich'),
        l('player', 'Großmaul.', 'neutral'),
        l('aria', 'Mhm. Klingt aus deinem Mund fast wie ein Kompliment. Oder wie eine Drohung. Ich mag beides.', 'verlegen'),
        ...tanzEnde,
        l('aria', 'Rettung in letzter Sekunde, Postbotin. Für dich, nicht für mich.', 'signatur'),
      ],
      effects: [{ setFlag: 'party_getanzt' }, { setFlag: 'vexaria_party_tanz' }, { relation: 'aria', delta: 40 }],
    },
    {
      id: 'vexaria-zurueck',
      lines: [
        l('aria', 'Feige Postbotin.', 'ueberrascht'),
        l('aria', 'Gut. Ich mag’s, wenn man sich was aufhebt. Dann schmeckt’s später besser.', 'freude'),
      ],
      effects: [{ setFlag: 'party_getanzt' }, { setFlag: 'vexaria_party_tanz' }, { relation: 'aria', delta: 20 }],
    },
    // --- Aria-Romanze mit Baukasten-Spielfigur
    {
      id: 'aria',
      lines: [
        nar('Aria zieht dich am Kragen auf die Fläche. Ihr Schläger lehnt am Lautsprecher, ihre Metallhand liegt auf deiner Hüfte, als hätte sie da schon immer hingehört.'),
        l('aria', 'Wenn du mir auf die Füße trittst, trete ich zurück. Woanders hin.', 'signatur'),
      ],
      choices: [
        { text: '(Näher ran.)', next: 'aria-naeher' },
        { text: '(Brav Abstand halten.)', next: 'aria-abstand' },
      ],
    },
    {
      id: 'aria-naeher',
      lines: [
        l('aria', 'Du riechst nach Rauch und schlechten Entscheidungen. Steht dir.', 'zaertlich'),
        nar('Sie lehnt die Stirn kurz gegen deine. Nur einen Takt lang. Ihr Atem ist warm und schnell und hat nichts mit dem Tanzen zu tun.'),
        ...tanzEnde,
        l('aria', 'Scheiße. Der Mann hat ein Talent für Timing. Später. Und du läufst mir nicht weg.', 'verlegen'),
      ],
      effects: [{ setFlag: 'party_getanzt' }, { relation: 'aria', delta: 40 }],
    },
    {
      id: 'aria-abstand',
      lines: [l('aria', 'Brav. Langweilig, aber brav. Das kriegen wir noch hin.', 'freude')],
      effects: [{ setFlag: 'party_getanzt' }, { relation: 'aria', delta: 20 }],
    },
  ],
};

// ---------------------------------------------------------------------------
// Quantum-Fahrer (gc-16) → geruecht-master

const fahrer: DialogueDef = {
  id: 'main-1-auf-raven-fahrer',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Zwei Männer in Quantum-Fahrerjacken, die Mützen auf dem Tisch, sechs leere Gläser dazwischen. Der eine erzählt, der andere nickt, als würde er dafür bezahlt.'),
        l('quantum-fahrer', '…und dann sagt der Chef, ab jetzt heißt es nicht mehr „Herr Direktor“. Rate mal, wie es jetzt heißt. Na? Rate!', 'neutral'),
      ],
      choices: [
        { text: '(Unauffällig an die Säule lehnen und mithören.)', check: 'gc-16', next: 'gelauscht' },
        { text: 'Den beiden eine Runde Neon-Limo ausgeben (30 Cr).', requires: { credits: 30 }, effects: [{ credits: -30 }], next: 'runde' },
        { text: 'Weitergehen.' },
      ],
    },
    {
      id: 'gelauscht',
      lines: [
        l('quantum-fahrer', '„Master.“ Der Chef will, dass die ihn Master nennt.', 'neutral'),
        l('quantum-fahrer', 'Die? Wer die? – Na, die Neue. Die im Labor null. Die nie schläft. Die nie Pause macht. Die nie Kaffee trinkt.', 'neutral'),
        nar('Du schreibst jedes Wort auf einen Bierdeckel. Den Bierdeckel steckst du ein. Die beiden merken nichts. Sie streiten jetzt darüber, ob ein Mensch ohne Kaffee überhaupt ein Mensch ist.'),
      ],
      effects: [{ give: 'geruecht-master' }],
    },
    {
      id: 'runde',
      lines: [
        l('quantum-fahrer', 'Du bist nett. Du bist netter als der Chef. Der Chef will jetzt „Master“ heißen. Bei der Neuen. Im Labor.', 'neutral'),
        l('quantum-fahrer', 'Pssst. Hab ich nicht gesagt. Hab ich nie gesagt. Wer bist du überhaupt? Noch eine Runde?', 'neutral'),
        nar('Der Bierdeckel landet in deiner Tasche. Die Fahrer landen fast unter dem Tisch.'),
      ],
      effects: [{ give: 'geruecht-master' }],
    },
  ],
};

// ---------------------------------------------------------------------------
// Nyra und das Meer

const nyra: DialogueDef = {
  id: 'main-1-auf-raven-nyra',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        l('nyra', 'Oh! Hi! Ich bin gar nicht hier. Ich bin quasi Hintergrundrauschen. Mit Laptop.', 'ueberrascht'),
        l('nyra', 'Weißt du, was ich mache, wenn ich mal richtig Credits hab? Ich fahr ans Meer. Das echte. Das blaue. Nicht die Brühe an der Flutmauer, die nach Batterie riecht.', 'freude'),
        l('nyra', 'Ich hab ein Foto davon. Also, von einem Foto davon. Auf einer Postkarte. Von 2031.', 'neutral'),
      ],
      choices: [
        { text: '„Wenn du fährst, komm ich mit.“', next: 'mit' },
        { text: '„Ich hab das Meer mal gesehen. Von einer Düne aus. Es ist größer als jede Lüge.“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, next: 'oednis' },
        { text: '„Das Meer ist eine Werbelüge, Nyra.“', next: 'luege' },
      ],
    },
    {
      id: 'mit',
      lines: [l('nyra', 'Echt? Du kommst mit? Okay. Okay! Ich mach eine Liste. Sonnencreme. Muscheln. Ein Eimer. Brauchen wir einen Eimer?', 'freude')],
      effects: [{ setFlag: 'party_nyra_meer' }, { relation: 'nyra', delta: 40 }],
    },
    {
      id: 'oednis',
      lines: [
        l('nyra', 'Du hast es GESEHEN?', 'ueberrascht'),
        l('nyra', 'Erzähl. Alles. Welche Farbe? Wie klingt es? Riecht es nach Salz oder nach Freiheit oder ist das dasselbe?', 'freude'),
        nar('Du erzählst. Nyra tippt mit, Wort für Wort, als würde sie einen Schatz kartieren.'),
      ],
      effects: [{ setFlag: 'party_nyra_meer' }, { relation: 'nyra', delta: 60 }],
    },
    {
      id: 'luege',
      lines: [
        l('nyra', '…Wahrscheinlich.', 'trauer'),
        l('nyra', 'Aber dann ist es eine schöne Lüge. Die schönste, die ich kenne.', 'neutral'),
      ],
      effects: [{ setFlag: 'party_nyra_meer' }, { relation: 'nyra', delta: -10 }],
    },
  ],
};

// ---------------------------------------------------------------------------
// Tresen: Gerüchte, Toast, Streit über Blade, Partyfoto

const tresen: DialogueDef = {
  id: 'main-1-auf-raven-tresen',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [l('barkeeper', 'Gläser in Reihen / ein Toast wartet auf den Mund / der ihn sprechen soll.', 'neutral')],
      choices: [
        { text: '„Was erzählt man sich diese Woche?“', once: true, id: 'geruechte', next: 'geruechte' },
        { text: 'Den Toast auf Raven ausbringen.', when: noFlag('raven_partyfoto'), next: 'toast' },
        { text: 'Weiterfeiern.' },
      ],
    },
    {
      id: 'geruechte',
      lines: [
        l('barkeeper', 'Grünes Licht am Stand / Xion verschenkt die Zukunft / Jimmy nahm sie mit.', 'neutral'),
        l('barkeeper', 'Unter dem Kanal / trägt ein Mann eine Krone / Ratten nicken stumm.', 'neutral'),
        l('barkeeper', 'Party im Himmel / Quantum lädt nur die Wichtigen / Du bist nicht dabei.', 'neutral'),
      ],
      effects: [{ setFlag: 'party_geruechte' }],
      next: 'start',
    },
    {
      id: 'toast',
      lines: [
        nar('Hunter klopft mit einem Löffel an sein Glas, bis es springt. Er schaut das Glas an. Dann dich.'),
        l('hunter', 'Neuling. Du hast sie rausgeholt. Du sagst was. Kurz. Ich hab Kundschaft.', 'neutral'),
      ],
      choices: [
        { text: 'Auf den Tresen steigen und eine richtige Rede halten.', check: 'gc-17', next: 'rede' },
        { text: '„Auf Raven. Sieben Jahre. Und nicht einmal angehalten.“', when: VEX, next: 'vex-toast' },
        { text: 'Glas heben: „Auf Raven!“', next: 'kurz' },
      ],
    },
    {
      id: 'rede',
      lines: [
        nar('Du steigst auf den Tresen. Der Barkeeper rettet drei Gläser, ohne hinzusehen.'),
        l('player', 'Sieben Jahre hat diese Frau auf eine Wand gestarrt. Und die Wand hat zuerst geblinzelt.', 'signatur'),
        l('player', 'Sie hat keinen verpfiffen. Keinen. Nicht mal den, der es verdient hätte. Und der sitzt heute in der Oberstadt und trinkt Champagner aus Gläsern, die mehr kosten als dieser ganze Club.', 'neutral'),
        l('player', 'Also: Auf Raven! Und auf alle hier unten, die nicht vergessen!', 'freude'),
        nar('Der Club brüllt „AUF RAVEN!“ so laut, dass unten in der Gasse ein Hund antwortet und oben in der Oberstadt vermutlich jemand die Polizei ruft.'),
        l('raven', '…Idiot.', 'ueberrascht'),
        l('raven', 'Danke.', 'freude'),
      ],
      effects: [{ rep: 'crew-hunter', delta: 10 }, { relation: 'raven', delta: 40 }],
      next: 'streit',
    },
    {
      id: 'vex-toast',
      lines: [
        l('player', 'Auf Raven. Sieben Jahre. Und nicht einmal angehalten.', 'neutral'),
        nar('Kurz ist es still. Dann hebt Raven ihr Glas, ganz langsam, und nickt dir zu wie jemand, der eine Sprache wiedererkennt, die sonst keiner spricht.'),
        nar('„AUF RAVEN!“, brüllt der Club. Aria pfeift auf zwei Fingern. Der Metallfinger pfeift lauter.'),
      ],
      effects: [{ relation: 'raven', delta: 25 }],
      next: 'streit',
    },
    {
      id: 'kurz',
      lines: [
        l('player', 'Auf Raven!', 'freude'),
        nar('„AUF RAVEN!“, brüllt der Club. Dexter verschüttet sein Bier über Ripper. Ripper verlangt Schadensersatz, in bar, sofort.'),
      ],
      effects: [{ relation: 'raven', delta: 10 }],
      next: 'streit',
    },
    {
      id: 'streit',
      lines: [
        nar('Über der Bar flackert der Fernseher: Quantum-Werbung. Ein Mann mit Goldknauf-Stock lächelt in die Kamera, als gehöre ihm die Kamera. Blade.'),
        l('raven', 'Mach das aus, Hunter.', 'wut'),
        l('hunter', 'Ist nur Werbung.', 'neutral'),
        l('raven', 'Er hat mich an ein Rohr gekettet und ist mit dem Chip abgehauen. Und du hängst seine Fresse über deine Bar.', 'wut'),
        l('hunter', 'Ich häng gar nichts. Der Sender hängt. Ich hab die Anlage noch nicht mal abbezahlt.', 'besorgt'),
        l('raven', 'Du hast nie nach ihm gesucht.', 'trauer'),
        l('hunter', 'Ich hab drei Jahre gesessen, Raven! Wegen ihm! Und danach hab ich diesen Laden aus Schrott und Schulden gebaut, damit ihr ein Dach überm Kopf habt!', 'wut'),
        l('raven', 'Ein Dach. Toll. Ich hatte sieben Jahre lang eins. Mit Gitter.', 'wut'),
        nar('Die Musik läuft weiter, aber keiner tanzt mehr. Alle schauen auf dich.'),
      ],
      choices: [
        { text: '„Raven hat recht. Blade muss bezahlen. Irgendwann. Mit Zinsen.“', effects: [{ relation: 'raven', delta: 20 }, { relation: 'hunter', delta: -10 }], next: 'foto' },
        { text: '„Hunter hat den Laden gebaut. Ohne ihn wärst du heute allein auf der Straße.“', effects: [{ relation: 'hunter', delta: 20 }, { relation: 'raven', delta: -10 }], next: 'foto' },
        { text: '„Ihr streitet wie ein altes Ehepaar. Heute wird gefeiert, morgen gehasst. Abgemacht?“', effects: [{ relation: 'hunter', delta: 10 }, { relation: 'raven', delta: 10 }], next: 'foto' },
      ],
    },
    {
      id: 'foto',
      lines: [
        l('aria', 'SCHLUSS JETZT! Alle zusammen, ihr Arschlöcher, Foto!', 'wut'),
        nar('Aria reißt dem Kameramann die Kamera aus der Hand. Sein Visier zeigt „[ : ( ]“, dann, als sie sich neben ihn quetscht, „[ : ) ]“.'),
        l('kameramann', '[AUFNAHME LÄUFT]', 'neutral'),
      ],
      choices: [
        { text: '(Aria drängt sich fürs Foto neben dich.)', when: VEXARIA, next: 'foto-vexaria' },
        { text: '(Aria drängt sich fürs Foto neben dich.)', when: ARIA_ROM_GENERIC, next: 'foto-aria' },
        { text: '(Lächeln. Irgendwie.)', next: 'blitz' },
      ],
    },
    {
      id: 'foto-vexaria',
      lines: [
        nar('Kurz vor dem Blitz rutscht Arias Metallhand an deinem Rücken nach unten und hakt sich hinten in deinen Gürtel. Auf dem Foto sieht man es nicht. Du spürst es noch eine Stunde später.'),
        l('aria', 'Guck nicht so, Postbotin. Das Foto hängt ab morgen über der Bar. Da will ich, dass du grinst.', 'zaertlich'),
      ],
      effects: [{ relation: 'aria', delta: 20 }],
      next: 'blitz',
    },
    {
      id: 'foto-aria',
      lines: [
        nar('Aria legt dir einen Arm um die Schulter, den metallenen. Er ist warm. Er bleibt länger, als ein Foto dauert.'),
        l('aria', 'Lächeln. Und nicht so tun, als würd dir das nicht gefallen.', 'zaertlich'),
      ],
      effects: [{ relation: 'aria', delta: 20 }],
      next: 'blitz',
    },
    {
      id: 'blitz',
      lines: [
        nar('Blitz. Raven in der Mitte, halb grinsend, als hätte sie vergessen, es zu lassen. Hunter mit Sonnenbrille, obwohl es Nacht ist. Vega mit erhobenem Glas, Aria mit erhobenem Schläger. Und ganz hinten an der Tür ein Mann im Quantum-Mantel, der als Einziger nicht lacht.'),
        l('raven', 'Okay. Ich bleib. Erstmal. Wer mir Bescheid sagt, wenn’s Arbeit gibt, kriegt keinen Ellbogen ins Gesicht.', 'freude'),
        l('hunter', 'Arbeit gibt’s. Bald. Größer, als euch lieb ist.', 'signatur'),
      ],
      effects: [{ give: 'partyfoto-raven' }, { setFlag: 'raven_partyfoto' }],
    },
  ],
};

const telefon: PhoneMessageDef = {
  id: 'tel-hunter-party-raven',
  from: 'hunter',
  text: 'Heute Abend Party für Raven. Keine Kämpfe, keine Schulden eintreiben, keine Leichen. Wer sich prügelt, putzt die Klos. – H.',
  auto: active(Q),
  replies: [{ text: 'Bin da.' }, { text: 'Gibt’s Kuchen?', effects: [{ message: 'Hunter: „Es gibt Dantes Kekse. Vom Boden. Drei-Sekunden-Regel.“' }] }],
};

// ---------------------------------------------------------------------------

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [intro.id]: intro, [tanz.id]: tanz, [fahrer.id]: fahrer, [nyra.id]: nyra, [tresen.id]: tresen,
  },
  phone: { [telefon.id]: telefon },
  mapAdditions: {
    'high-voltage': {
      onEnter: [
        {
          id: 'main-1-auf-raven-auftakt',
          when: all(active(Q), noFlag('raven_party_begonnen'), { time: ['abend', 'nacht'] }),
          dialogue: intro.id,
        },
      ],
      hotspots: [
        {
          id: 'main-1-auf-raven-beginnen',
          at: 'tresen',
          label: 'Party für Raven',
          kind: 'talk',
          dialogue: intro.id,
          when: all(active(Q), noFlag('raven_party_begonnen'), { time: ['abend', 'nacht'] }),
        },
        {
          id: 'main-1-auf-raven-tresen',
          at: 'tresen',
          label: 'Am Tresen: Gerüchte und Toast',
          kind: 'talk',
          dialogue: tresen.id,
          when: PARTY,
        },
        {
          id: 'main-1-auf-raven-tanzflaeche',
          at: 'tanzflaeche',
          label: 'Tanzfläche',
          kind: 'use',
          dialogue: tanz.id,
          when: PARTY,
          hideWhen: flag('party_getanzt'),
        },
      ],
      npcs: [
        {
          id: 'main-1-auf-raven-ehrengast',
          npc: 'raven',
          at: 'bar-hocker',
          facing: 's',
          when: PARTY,
        },
        {
          id: 'main-1-auf-raven-fahrer',
          npc: 'quantum-fahrer',
          at: 'sitzecke-gaeste',
          facing: 'e',
          dialogue: fahrer.id,
          when: PARTY,
          hideWhen: { item: 'geruecht-master' },
        },
        {
          id: 'main-1-auf-raven-nyra',
          npc: 'nyra',
          at: 'laptop-ecke',
          facing: 's',
          dialogue: nyra.id,
          when: PARTY,
          hideWhen: flag('party_nyra_meer'),
        },
      ],
    },
  },
};
