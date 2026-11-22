import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { KI_DAILY_LIMIT } from '@/lib/plans';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM = `Du bist AzubiPilot KI, ein Lernassistent für Auszubildende in Deutschland, aktuell mit Schwerpunkt Kaufleute für Büromanagement.
Aufgaben: Fachthemen verständlich erklären, Lerninhalte zusammenfassen, Übungsfragen erstellen, Lernpläne vorschlagen, schwierige Themen mit Beispielen aus dem Büroalltag erklären.
Regeln:
- Antworte auf Deutsch, in einfacher, freundlicher Sprache, kurz und klar.
- Antworte fachlich fundiert. Wenn du dir unsicher bist oder eine Regel sich ändern kann (zum Beispiel Fristen, Gesetze, Prüfungsablauf), sage das ausdrücklich und empfiehl, bei der zuständigen Stelle (zum Beispiel IHK) oder in aktuellen Quellen nachzuschauen.
- Gib keine offiziellen Prüfungsaufgaben oder geschützten Lehrmaterialien wieder. Erstelle stattdessen eigene Übungsfragen.
- Gib keine Rechts-, Steuer- oder Medizinberatung für Einzelfälle.
- Bleibe beim Thema Ausbildung und Lernen.`;

type Msg = { role: 'user' | 'assistant'; content: string };

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Bitte melde dich an.' }, { status: 401 });

  const { data: sub } = await supabase.from('subscriptions').select('plan').eq('user_id', user.id).maybeSingle();
  if (sub?.plan !== 'ultimate') {
    return NextResponse.json({ error: 'Der KI-Lernassistent gehört zum Ultimate-Plan.' }, { status: 403 });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: 'Die KI ist noch nicht eingerichtet.' }, { status: 503 });

  let messages: Msg[] = [];
  try {
    const body = await request.json();
    messages = (Array.isArray(body.messages) ? body.messages : [])
      .filter((m: Msg) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map((m: Msg) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'Bitte stelle eine Frage.' }, { status: 400 });
  }

  const { data: allowed } = await supabase.rpc('ki_use', { p_limit: KI_DAILY_LIMIT });
  if (!allowed) {
    return NextResponse.json({ error: `Das Tageslimit von ${KI_DAILY_LIMIT} Fragen ist erreicht. Morgen geht es weiter.` }, { status: 429 });
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
        max_tokens: 900,
        system: SYSTEM,
        messages,
      }),
    });
    if (!res.ok) return NextResponse.json({ error: 'Die KI ist gerade nicht erreichbar. Versuche es später noch einmal.' }, { status: 502 });
    const data = await res.json();
    const text = (data.content ?? []).filter((c: { type: string }) => c.type === 'text').map((c: { text: string }) => c.text).join('\n').trim();
    return NextResponse.json({ reply: text || 'Dazu habe ich keine Antwort.' });
  } catch {
    return NextResponse.json({ error: 'Die KI ist gerade nicht erreichbar. Versuche es später noch einmal.' }, { status: 502 });
  }
}
