# AzubiPilot

Lernplattform für Auszubildende. Start mit Kaufleuten für Büromanagement.

Technik: Next.js 16 (App Router), Tailwind CSS, Supabase (PostgreSQL, Auth, Storage), Hosting auf Vercel.

## Was schon funktioniert

- Registrierung, Anmeldung, Abmeldung, geschützte Bereiche
- Dashboard mit Fortschritt, nächster Prüfung, Wochenübersicht, Aufgaben und Lernzielen
- Lernbereich mit Lektionen (Lernziel, Erklärung, Beispiele, Zusammenfassung, Verständnisfragen) und Fortschritt
- Quiz mit sofortigem Feedback; Auswertung und Punkte werden serverseitig gespeichert
- Prüfungsplaner mit automatisch erzeugtem Lernplan
- Lernmaterialien (Lernzettel, Zusammenfassungen, Karteikarten, Checklisten, Vorlagen)
- Eigene Dateien hochladen (PDF, PNG, JPG, TXT, bis 10 MB): im kostenlosen Plan höchstens 5, mit Premium und Ultimate unbegrenzt
- Profil, Lernziele, Preisseite, Impressum und Datenschutz (Platzhalter)
- AzubiPilot KI (nur Ultimate, braucht einen API-Schlüssel)

## Noch nicht fertig

- **Bezahlung:** Premium und Ultimate lassen sich noch nicht kaufen. Der Plan steht in der Tabelle `subscriptions` und kann bis dahin im Supabase-Dashboard von Hand geändert werden (zum Testen).
- **Inhaltsgrenzen:** Der Unterschied zwischen kostenlos und Premium bei Lernmaterialien und Quizzen ist noch nicht eingebaut. Aktuell sind alle Inhalte frei. Nur das Upload-Limit und die KI sind an den Plan gebunden.
- **Inhalte:** Die Lektionen und Quizfragen sind Beispiele. Bitte vor dem Livegang fachlich prüfen lassen.
- **Impressum und Datenschutz:** Platzhalter. Vor dem Livegang mit echten Angaben füllen und rechtlich prüfen lassen.

## Einrichtung

### 1. Supabase

1. Auf [supabase.com](https://supabase.com) ein neues Projekt anlegen.
2. Im Dashboard **SQL Editor** öffnen. Zuerst den Inhalt von `supabase/schema.sql` einfügen und ausführen, danach den Inhalt von `supabase/seed.sql`. Beide Dateien jeweils nur **einmal** ausführen.
3. **Project Settings > API**: `Project URL` und `anon public` Key kopieren.
4. **Authentication > URL Configuration**: Bei **Site URL** deine spätere Adresse eintragen (zum Beispiel `https://azubipilot.vercel.app`). Bei **Redirect URLs** zusätzlich `https://azubipilot.vercel.app/auth/callback` und `http://localhost:3000/auth/callback` eintragen.

### 2. Vercel

1. Auf [vercel.com](https://vercel.com) mit GitHub anmelden, **Add New > Project**, dieses Repository wählen.
2. Unter **Environment Variables** eintragen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (deine Adresse, ohne Schrägstrich am Ende)
   - optional `ANTHROPIC_API_KEY` für die KI
3. **Deploy** klicken.

### 3. Lokal starten (optional)

```
cp .env.example .env.local
npm install
npm run dev
```

## Sicherheit

- Alle Nutzertabellen haben Row Level Security: Jeder sieht und ändert nur seine eigenen Daten.
- Quiz-Ergebnisse und Punkte schreibt nur die Datenbankfunktion `submit_quiz`.
- Das Upload-Limit prüft die Datenbank (Trigger auf `user_materials` und Regel auf dem Dateispeicher). Es lässt sich nicht über die Oberfläche umgehen.
- Dateien liegen im privaten Bucket `materials`, Zugriff nur über kurzlebige Links.
- Der Anon-Key ist öffentlich vorgesehen. Den `service_role`-Key niemals im Projekt oder in Vercel mit `NEXT_PUBLIC_` verwenden.
- Der KI-Schlüssel wird nur auf dem Server gelesen.

## Plan manuell ändern (zum Testen)

Im Supabase **SQL Editor**:

```sql
update public.subscriptions set plan = 'premium' where user_id = '<Nutzer-ID aus Authentication > Users>';
```

Erlaubte Werte: `free`, `premium`, `ultimate`.
