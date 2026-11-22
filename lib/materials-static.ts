// Beispielinhalte, fachliche Pruefung steht aus.
export type Card = { module: string; front: string; back: string };
export type Note = { module: string; title: string; points: string[] };
export type Checklist = { title: string; items: string[] };
export type Template = { title: string; text: string };

export const cards: Card[] = [
  {
    "module": "Ausbildung und Recht",
    "front": "Probezeit: Dauer?",
    "back": "Mindestens 1 Monat, höchstens 4 Monate."
  },
  {
    "module": "Ausbildung und Recht",
    "front": "Was ist das Berichtsheft?",
    "back": "Der Ausbildungsnachweis. Voraussetzung für die Zulassung zur Abschlussprüfung."
  },
  {
    "module": "Kaufvertrag und Beschaffung",
    "front": "Antrag und Annahme ergeben …",
    "back": "… den Kaufvertrag (zwei übereinstimmende Willenserklärungen)."
  },
  {
    "module": "Kaufvertrag und Beschaffung",
    "front": "Reihenfolge der Rechte bei Mängeln",
    "back": "Zuerst Nacherfüllung, dann Rücktritt, Minderung oder Schadenersatz."
  },
  {
    "module": "Kaufvertrag und Beschaffung",
    "front": "Verzug ohne Mahnung",
    "back": "30 Tage nach Fälligkeit und Zugang der Rechnung."
  },
  {
    "module": "Büroorganisation",
    "front": "Eisenhower: wichtig und dringend",
    "back": "Sofort selbst erledigen."
  },
  {
    "module": "Büroorganisation",
    "front": "Aufbewahrung Geschäftsbriefe",
    "back": "Sechs Jahre."
  },
  {
    "module": "Büroorganisation",
    "front": "Betreffzeile nach DIN 5008",
    "back": "Ohne das Wort „Betreff“."
  }
];

export const notes: Note[] = [
  {
    "module": "Ausbildung und Recht",
    "title": "Duale Ausbildung auf einen Blick",
    "points": [
      "Orte: Betrieb und Berufsschule",
      "Dauer: in der Regel 3 Jahre",
      "Probezeit: 1 bis 4 Monate",
      "Prüfung: gestreckt in zwei Teilen"
    ]
  },
  {
    "module": "Kaufvertrag und Beschaffung",
    "title": "Vom Angebot zur Zahlung",
    "points": [
      "Antrag und Annahme ergeben den Vertrag",
      "Vertrag = Verpflichtungsgeschäft",
      "Lieferung und Zahlung = Erfüllungsgeschäft",
      "Mangel: erst Nacherfüllung"
    ]
  },
  {
    "module": "Büroorganisation",
    "title": "Fristen und Prioritäten",
    "points": [
      "Briefe 6 Jahre, Buchungsbelege 8 Jahre, Abschlüsse 10 Jahre",
      "Frist startet am Jahresende",
      "Eisenhower: wichtig/dringend vier Felder"
    ]
  }
];

export const checklists: Checklist[] = [
  {
    "title": "Erster Ausbildungstag",
    "items": [
      "Ausbildungsvertrag und Unterlagen mitbringen",
      "Ansprechperson und Ausbilder kennenlernen",
      "Arbeitsplatz, Zugangsdaten und Schlüssel erhalten",
      "Arbeitszeiten und Pausenregelung klären",
      "Berufsschultermine eintragen"
    ]
  },
  {
    "title": "Prüfungswoche",
    "items": [
      "Prüfungsort und Uhrzeit prüfen",
      "Ausweis und zugelassene Hilfsmittel einpacken",
      "Lernzettel einmal durchgehen",
      "Früh ins Bett, Wecker stellen",
      "Nach der Prüfung Pause einplanen"
    ]
  }
];

export const templates: Template[] = [
  {
    "title": "Wochenlernplan",
    "text": "Montag: Lektion lesen (30 Min.)\nDienstag: Quiz zum Thema (20 Min.)\nMittwoch: Karteikarten (15 Min.)\nDonnerstag: Berichtsheft-Eintrag (20 Min.)\nFreitag: Wochenrückblick und offene Fragen notieren"
  },
  {
    "title": "Lernzettel-Vorlage",
    "text": "Thema:\nLernziel:\nDrei Kernaussagen:\n1.\n2.\n3.\nBeispiel aus meinem Betrieb:\nOffene Fragen:"
  },
  {
    "title": "Berichtsheft-Eintrag",
    "text": "Woche vom … bis …\nAbteilung:\nTätigkeiten:\nGelernt habe ich:\nBerufsschule: Themen der Woche"
  }
];
