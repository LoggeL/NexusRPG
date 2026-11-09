// side-streaming-suenden „10.000 Stunden“ (world.md §6.2 Nr. 12) · Auftraggeber Richter · eisenhof · T.
// Wege: gc-69 Eintrag löschen (Beweismittellager, Dialog der Zone) · Server nachts holen (Schloss/Behördenkarte, Zone)
// · gc-70 Druck machen (Fahndung dauerhaft halb so teuer, Richter ♥ −100) · [Dante ♥4] legale Playlist (bester Ausgang).
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, ItemDef, QuestDef } from '../../../modules/contracts';
import { L, N, P, active, all, any, bye, flag, hearts, inactive, msg, node, noFlag, rel, set, tafel, time, xp } from './_lib';

const Q = 'side-streaming-suenden';
const R = 'richter';

const GELOESCHT = flag('richter_eintrag_geloescht');
const GEHOLT = flag('richter_server_geholt');
const PLAYLIST = { item: 'dantes-playlist' } as const;
const GELOEST = any(GELOESCHT, GEHOLT, flag('ss_druck'), flag('ss_playlist_uebergeben'));

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: '10.000 Stunden',
  summary: 'Der alte Streaming-Server der Unterstadt wird ausgewertet. Der Richter hat Angst vor einem Nutzernamen: „RichtigLauteMusik79“. Seinem.',
  giver: R,
  act: 1,
  steps: [
    {
      id: 'server',
      text: 'Kümmere dich um den Streaming-Server im Beweismittellager am Eisenhof – oder um den Richter selbst.',
      done: GELOEST,
      marker: { map: 'eisenhof', at: [320, 965] },
    },
    {
      id: 'weg-loeschen',
      text: 'Weg: Über das Wartungspanel im Beweismittellager den Eintrag löschen (Technik).',
      done: GELOESCHT, optional: true, marker: { map: 'eisenhof', at: [320, 965] },
    },
    {
      id: 'weg-nachts',
      text: 'Weg: Nachts das Lager knacken und den ganzen Server rausholen. Oder mit einer Behördenkarte, ganz offiziell inoffiziell.',
      done: GEHOLT, optional: true, marker: { map: 'eisenhof', at: [320, 965] },
    },
    {
      id: 'weg-dante',
      text: 'Weg: Dante war damals der Verurteilte. Vielleicht hat er eine bessere Idee als Löschen (Dante ♥4).',
      done: flag('ss_playlist_uebergeben'), optional: true, when: hearts('dante', 4), marker: { map: 'dantes-werkstatt', at: [600, 290] },
    },
    {
      id: 'zurueck',
      text: 'Geh zurück zum Richter (tagsüber im Gerichtsgarten, abends auf seiner Bank).',
      done: flag('ss_abgeschlossen'),
      when: GELOEST,
      marker: { map: 'eisenhof', at: [300, 470] },
    },
  ],
  reward: {
    xp: 200,
    effects: [msg('Der Richter summt. Leise. Im Takt. Zum ersten Mal seit Jahren.')],
  },
};

// --------------------------------------------------------------------------------------------- Auftakt
const auftrag: DialogueDef = {
  id: 'ss-richter-auftrag',
  start: 'start',
  nodes: [
    node('start', [
      N('Der Richter kniet im Kiesgarten und rupft Unkraut. Bei jedem Halm murmelt er „Schuldig.“ Bei einem besonders zähen: „Schuldig in allen Punkten, du Mistvieh.“'),
      L(R, 'Sie. Ja, Sie. Treten Sie näher. Nicht auf die Kresse. Die Kresse ist unschuldig.'),
      L(R, 'Paragraph 12, Absatz 3 der Unterstadtordnung: Wer schweigt, macht sich nicht strafbar. Ich mache von diesem Recht gerade sehr ausgiebig Gebrauch. Und trotzdem muss ich reden.'),
    ], {
      choices: [
        { text: '„Spucken Sie’s aus, Euer Ehren. Ich hab nicht den ganzen Tag.“', next: 'problem' },
        { text: '„Sie sehen aus, als hätten Sie ’ne Leiche im Beet.“', next: 'problem' },
        bye('„Ich hab hier nichts gesehen.“'),
      ],
    }),
    node('problem', [
      L(R, 'Der alte Streaming-Server der Unterstadt. Beschlagnahmt, verstaubt, vergessen. Und jetzt soll er ausgewertet werden. Öffentlich. „Transparenzinitiative.“ Ich hasse Transparenz. Transparenz ist was für Fenster.'),
      L(R, 'Darauf steht ein Nutzerkonto. Zehntausend Stunden Wiedergabe. Schlager-Remixe. Club-Versionen. Ein Lied namens „Paragraph der Liebe“, das ich … das jemand … zweitausendmal gehört hat.'),
      L(R, 'Der Nutzername lautet „RichtigLauteMusik79“.'),
      P('Und das sind Sie.'),
      L(R, 'Einspruch! … Abgelehnt. Ja. Das bin ich.'),
      L(R, 'Ich habe einen Mann zu zehntausend Stunden Sozialdienst verurteilt, weil er Musik verbreitet hat. Und ich habe in derselben Zeit zehntausend Stunden Musik GEHÖRT. Wenn das rauskommt, lacht mich die ganze Unterstadt aus dem Talar.'),
    ], {
      choices: [
        { text: '„Ich kümmere mich drum. Wo steht das Ding?“', next: 'ja' },
        { text: '„Was springt für mich raus?“', next: 'lohn' },
        { text: '„Der Mann, den Sie verurteilt haben – war das zufällig Dante?“', next: 'dante' },
        bye('„Klingt nach Ihrem Problem, Opa.“'),
      ],
    }),
    node('lohn', [
      L(R, 'Ein Gefallen. Ein richterlicher Gefallen. Einmal schaue ich weg, wenn die Ordnungshüter Ihren Namen rufen. Einmal. Nicht übertreiben.'),
      L(R, 'Und meine ewige Dankbarkeit. Die ist nicht viel wert, aber sie ist handgeschrieben.'),
    ], {
      choices: [
        { text: '„Deal. Wo steht der Server?“', next: 'ja' },
        bye('„Ich überleg’s mir.“'),
      ],
    }),
    node('dante', [
      L(R, 'Dante. Ja. Dante mit dem Faxgerät und den illegalen Platten. Er hat eine ganze Siedlung mit Musik versorgt, ohne Lizenz, ohne Genehmigung, ohne … Reue.'),
      L(R, 'Ich habe ihn verurteilt, weil das Gesetz es so wollte. Und dann bin ich nach Hause gegangen und habe seine Playlist gehört. Seine. Er hatte sie hochgeladen. Sie war … gut.'),
      N('Der Richter rupft sehr gründlich an einem Halm, der längst draußen ist.'),
    ], {
      choices: [
        { text: '„Okay. Ich regel das.“', next: 'ja' },
        bye('„Das ist das Traurigste, was ich heute gehört hab. Und ich hab Gully reden hören.“'),
      ],
    }),
    node('ja', [
      L(R, 'Das Beweismittellager. Unten an der Häuserzeile, das Rolltor mit dem Schild „ASSERVATE – ZUTRITT NUR MIT GRUND“. Neugier ist kein Grund. Ich sage das nur, weil ich es sagen muss.'),
      L(R, 'Wie Sie es anstellen, will ich nicht wissen. Als Richter. Als Mensch will ich es ganz dringend wissen, aber der Mensch hat hier nichts zu melden.'),
    ], { effects: [{ startQuest: Q }] }),
  ],
};

// --------------------------------------------------------------------------------------------- Rückweg zum Richter
const zurueck: DialogueDef = {
  id: 'ss-richter-zurueck',
  start: 'start',
  nodes: [
    node('start', [L(R, 'Und? Sprechen Sie leise. Die Kresse hört mit.')], {
      choices: [
        { text: '„Ihr Eintrag ist weg. Gelöscht. RichtigLauteMusik79 hat nie existiert.“', when: GELOESCHT, next: 'geloescht' },
        { text: '„Ich hab hier was für Sie. Schwer. Brummt. Riecht nach Schlager.“', when: all(GEHOLT, noFlag('richter_eintrag_geloescht')), next: 'server' },
        {
          text: '„Dante schickt Ihnen was. Seine Playlist. Legal. Mit Widmung.“', tag: '[Dante ♥4]', when: PLAYLIST, next: 'playlist',
          effects: [{ take: 'dantes-playlist' }],
        },
        {
          text: '„Ich weiß, wer RichtigLauteMusik79 ist. Und ab heute weiß ich auch, was Sie mir schulden.“', check: 'gc-70',
          when: all(noFlag('ss_druck'), noFlag('ss_abgeschlossen')), next: 'druck',
        },
        { text: '„Wo war das Lager noch mal?“', when: noFlag('ss_abgeschlossen'), next: 'wo' },
        bye('„Noch nichts. Bleiben Sie ruhig, Euer Ehren.“'),
      ],
    }),
    node('wo', [L(R, 'Rolltor, Häuserzeile, unten. „ASSERVATE“. Nachts ist dort niemand. Das sage ich nicht als Hinweis. Das sage ich als … Wetterbericht.')]),
    node('geloescht', [
      L(R, 'Weg? Ganz weg? Auch „Paragraph der Liebe (Club Mix)“?'),
      P('Auch der Club Mix.'),
      L(R, 'Ein schwerer Verlust für die Kunst. Ein großer Gewinn für die Justiz.'),
      L(R, 'Hier. Mein Gefallen. Schriftlich. Ich habe ihn dreimal neu geschrieben, die erste Fassung klang zu dankbar.'),
    ], { effects: [{ give: 'richters-gefallen' }, set('ss_abgeschlossen'), rel(R, 60), { completeQuest: Q }] }),
    node('server', [
      N('Du stellst den Server auf die Gartenbank. Der Richter betrachtet ihn wie einen Angeklagten, der ihm zu ähnlich sieht.'),
      L(R, 'Zehntausend Stunden. In dieser Kiste.'),
      N('Er holt einen Holzhammer aus dem Gartenschuppen. Einen sehr großen. Er hebt ihn. Er zögert.'),
      L(R, 'Schuldig.'),
      N('KRACH. Funken, Plastiksplitter, ein letztes verzerrtes „Paragraph der Lieeeebe …“ aus einem sterbenden Lautsprecher. Dann Stille. Der Richter atmet aus, als hätte er sieben Jahre lang die Luft angehalten.'),
      L(R, 'Das Urteil ist vollstreckt. Ihr Gefallen. Gehen Sie, bevor jemand fragt, warum hier ein Server im Beet liegt.'),
    ], { effects: [{ give: 'richters-gefallen' }, set('ss_abgeschlossen'), rel(R, 60), { completeQuest: Q }] }),
    node('druck', [
      P('Zehntausend Stunden Sozialdienst für Dante. Zehntausend Stunden Schlager für Sie. Ich hab den Server. Ich hab Freunde beim Fernsehen. Und ich hab Zeit.'),
      L(R, 'Das … das ist Erpressung. Paragraph 89. Bis zu fünf Jahre.'),
      P('Dann rufen Sie die Wache. Ich warte. Ich summ solange was. Wie ging der Club Mix noch?'),
      N('Dem Richter fällt das Unkraut aus der Hand. Er sieht auf einmal sehr alt aus. Und sehr wütend.'),
      L(R, 'Was wollen Sie?'),
      P('Wenn mich die Ordnungshüter suchen, wird’s billiger. Für immer. Ich zahl die Hälfte. Sie regeln den Rest.'),
      L(R, 'Gut. Die Hälfte. Ab sofort. Und jetzt verschwinden Sie aus meinem Garten, Sie elende Zecke. Die Kresse wird sich nie davon erholen.'),
    ], { effects: [set('ss_druck'), set('richter_fahndung_halb'), set('richter_erpresst'), rel(R, -100), set('ss_abgeschlossen'), { completeQuest: Q }] }),
    node('playlist', [
      N('Du legst eine handbeschriftete Kassette auf die Gartenbank. „Zehntausend Stunden – die legale Playlist. Für RLM79. Ohne Groll. Na gut, mit ein bisschen Groll. – D.“'),
      L(R, 'Er … weiß es?'),
      P('Er weiß es seit Jahren. Er hat nie was gesagt. Er findet, Sie haben einen grauenhaften Geschmack. Und er hat Ihnen trotzdem die besten Tracks rausgesucht.'),
      N('Der Richter dreht die Kassette in den Händen. Dann noch mal. Dann setzt er sich. Auf die Kresse. Er merkt es nicht.'),
      L(R, 'Ich habe ihn verurteilt, weil Musik verboten war. Er schenkt mir Musik, obwohl ich ihn verurteilt habe.'),
      L(R, 'Ich glaube, ich muss mein Urteil revidieren. Nicht das über ihn. Das über mich.'),
      L(R, 'Sagen Sie ihm … nein. Ich sage es ihm selbst. Donnerstag. Im High Voltage. Am Kartentisch. Er soll mir einen Platz freihalten. Und die Lautsprecher aufdrehen.'),
      L(R, 'Und Sie: Mein Gefallen. Mit Dank. Diesmal klingt er dankbar, und das ist Absicht.'),
    ], {
      effects: [
        { give: 'richters-gefallen' }, set('ss_playlist_uebergeben'), set('richter_dante_versoehnt'), set('ss_abgeschlossen'),
        rel(R, 120), rel('dante', 60), xp(20), { completeQuest: Q },
      ],
      next: 'nachspiel',
    }),
    node('nachspiel', [], { effects: [{ cutscene: 'ss-versoehnung' }] }),
  ],
};

// --------------------------------------------------------------------------------------------- Dantes Weg
const dante: DialogueDef = {
  id: 'ss-dante-playlist',
  start: 'start',
  nodes: [
    node('start', [
      P('Dante. Der Richter, der dich verurteilt hat. Der hat heimlich gestreamt. Zehntausend Stunden. Schlager.'),
      L('dante', 'RichtigLauteMusik79.', 'signatur'),
      P('Du wusstest das?'),
      L('dante', 'Heiliges Kanonenrohr, natürlich wusste ich das! Der Mann hat meine Playlist zweitausendmal gehört! Ich hab die Abrufzahlen jeden Abend im Knast auf einem geschmuggelten Taschenrechner nachgerechnet! Das war mein Fernsehprogramm!', 'freude'),
      L('dante', 'Und jetzt will er den Eintrag löschen lassen, ja? Damit keiner merkt, dass ein Richter Geschmack hat. Na ja. Geschmack. Er hört „Paragraph der Liebe“ im Club Mix. Das ist kein Geschmack, das ist eine Diagnose.'),
    ], {
      choices: [
        { text: '„Ich soll den Eintrag löschen. Hast du ’ne bessere Idee?“', next: 'idee' },
        bye('„Vergiss es. Ich mach das auf meine Art.“'),
      ],
    }),
    node('idee', [
      L('dante', 'Eine bessere Idee? Ich habe IMMER eine bessere Idee. Meistens sogar drei, und zwei davon brennen.'),
      N('Dante wühlt in einer Kiste mit VHS-Kassetten, Faxpapier und einem halben Toaster. Er zieht eine leere Musikkassette hervor und pustet den Staub runter wie ein Revolverheld.'),
      L('dante', 'Löschen ist feige. Löschen ist, was die Oberstadt macht. Wir machen es anders: Ich schenk ihm die Playlist. Legal. Mit Lizenz. Ich hab seit letztem Jahr eine, die hat mich drei Faxe und eine Nougatbombe gekostet.'),
      L('dante', 'Dann muss er sich nicht mehr schämen. Dann ist er einfach nur ein alter Mann, der Musik mag. Das ist erlaubt. Ich hab’s nachgelesen. Paragraph Dante, Absatz Ich.'),
      N('Er nimmt eine Kassette auf. Dreißig Minuten, in denen er jeden Track ansagt, als stünde er auf einer Bühne. Bei „Paragraph der Liebe“ seufzt er tief und nimmt ihn trotzdem auf.'),
      L('dante', 'Drei-Sekunden-Regel für Groll. Ich bin bei sieben Jahren. Wird Zeit, dass ich ihn aufhebe und wegwerfe.', 'zaertlich'),
    ], { effects: [{ give: 'dantes-playlist' }, { advanceTime: 30 }, rel('dante', 20), msg('Erhalten: Dantes Playlist. Bring sie dem Richter.')] }),
  ],
};

const versoehnung: CutsceneDef = {
  id: 'ss-versoehnung',
  title: 'Paragraph der Liebe',
  beats: [
    tafel('Donnerstag. High Voltage. Kartentisch.', undefined, 'in'),
    tafel('Der Richter kommt in Zivil. Strickjacke. Dante steht auf, und für einen Moment weiß keiner, wer zuerst etwas sagen soll.', [
      L('dante', 'Euer Ehren.'),
      L(R, 'Herr … Dante.'),
      L('dante', 'Club Mix oder Original?'),
      L(R, '… Club Mix. Selbstverständlich.'),
    ]),
    tafel('Hunter dreht die Anlage auf. Zwei Männer, die sich sieben Jahre lang nicht in die Augen sehen konnten, spielen „Eins!“ und brüllen den Refrain mit. Falsch. Laut. Glücklich.', [
      L('hunter', 'Wenn einer von euch auf meinen Tisch steigt, gibt’s Hausverbot. Für beide. Gleiches Recht für alle.'),
    ]),
  ],
};

const playlistItem: ItemDef = {
  id: 'dantes-playlist',
  name: 'Dantes Playlist',
  category: 'quest',
  icon: 'dantes-playlist',
  price: 0,
  sellable: false,
  description: 'Eine handbeschriftete Musikkassette: „Zehntausend Stunden – die legale Playlist. Für RLM79. Ohne Groll. Na gut, mit ein bisschen Groll. – D.“',
};

const TAGS = time('tag');
const ABENDS = all(time('abend'), { not: { weekday: ['do', 'fr'] } });

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [auftrag.id]: auftrag, [zurueck.id]: zurueck, [dante.id]: dante },
  cutscenes: { [versoehnung.id]: versoehnung },
  items: { [playlistItem.id]: playlistItem },
  mapAdditions: {
    eisenhof: {
      hotspots: [
        { id: 'ss-richter-auftrag', at: 'gerichtsgarten', label: 'Mit dem Richter reden', kind: 'talk', dialogue: auftrag.id, when: all(inactive(Q), TAGS) },
        { id: 'ss-richter-garten', at: 'gerichtsgarten', label: 'Richter: 10.000 Stunden', kind: 'talk', dialogue: zurueck.id, when: all(active(Q), TAGS) },
        { id: 'ss-richter-bank', at: 'richter-bank', label: 'Richter: 10.000 Stunden', kind: 'talk', dialogue: zurueck.id, when: all(active(Q), ABENDS) },
      ],
    },
    'dantes-werkstatt': {
      hotspots: [
        {
          id: 'ss-dante-playlist', at: 'werkbank', label: 'Dante: Der Richter und die Playlist', kind: 'talk', dialogue: dante.id,
          when: all(active(Q), hearts('dante', 4), { noItem: 'dantes-playlist' }, noFlag('ss_playlist_uebergeben'), time('morgen', 'tag', 'abend')),
        },
      ],
    },
  },
};

