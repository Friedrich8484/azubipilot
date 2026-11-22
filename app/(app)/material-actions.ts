'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from '@/lib/plans';

async function authed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht angemeldet');
  return { supabase, user };
}

export async function addMaterial(input: {
  title: string;
  topic: string;
  path: string;
  fileName: string;
  mime: string;
  size: number;
}): Promise<{ ok: true } | { error: string }> {
  const { supabase, user } = await authed();

  if (!input.path.startsWith(`${user.id}/`) || input.path.includes('..')) return { error: 'Ungültiger Dateipfad.' };
  if (!ALLOWED_UPLOAD_TYPES.includes(input.mime)) return { error: 'Dieser Dateityp ist nicht erlaubt.' };
  if (input.size <= 0 || input.size > MAX_UPLOAD_BYTES) return { error: 'Die Datei ist zu groß.' };
  const title = input.title.trim().slice(0, 100);
  if (!title) return { error: 'Bitte gib einen Titel an.' };

  const { error } = await supabase.from('user_materials').insert({
    user_id: user.id,
    title,
    topic: input.topic.trim().slice(0, 80),
    file_path: input.path,
    file_name: input.fileName.slice(0, 200),
    mime_type: input.mime,
    size_bytes: input.size,
  });

  if (error) {
    if (error.message.includes('LIMIT_REACHED')) {
      return { error: 'Du hast das Limit deines Plans erreicht. Mit Premium kannst du unbegrenzt hochladen.' };
    }
    return { error: 'Die Datei konnte nicht gespeichert werden.' };
  }
  revalidatePath('/materialien');
  return { ok: true };
}

export async function getMaterialUrl(id: string): Promise<{ url: string } | { error: string }> {
  const { supabase, user } = await authed();
  const { data: row } = await supabase
    .from('user_materials')
    .select('file_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!row) return { error: 'Datei nicht gefunden.' };
  const { data, error } = await supabase.storage.from('materials').createSignedUrl(row.file_path, 120);
  if (error || !data) return { error: 'Die Datei konnte nicht geöffnet werden.' };
  return { url: data.signedUrl };
}

export async function deleteMaterial(id: string): Promise<{ ok: true } | { error: string }> {
  const { supabase, user } = await authed();
  const { data: row } = await supabase
    .from('user_materials')
    .select('file_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!row) return { error: 'Datei nicht gefunden.' };

  const { error: stErr } = await supabase.storage.from('materials').remove([row.file_path]);
  if (stErr) return { error: 'Die Datei konnte nicht gelöscht werden.' };
  const { error } = await supabase.from('user_materials').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: 'Die Datei konnte nicht gelöscht werden.' };
  revalidatePath('/materialien');
  return { ok: true };
}
