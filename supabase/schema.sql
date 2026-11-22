-- AzubiPilot: Datenbankschema fuer Supabase (PostgreSQL)
-- Ausfuehren im Supabase-Dashboard unter "SQL Editor". Danach supabase/seed.sql ausfuehren.
-- Hinweis: Die Tabelle "users" ist bei Supabase die Tabelle auth.users (Supabase Auth).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- Inhalte
create table if not exists public.apprenticeship_programs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  active boolean not null default true
);

create table if not exists public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.apprenticeship_programs(id) on delete cascade,
  title text not null,
  description text not null default '',
  training_year smallint not null default 1 check (training_year between 1 and 3),
  position int not null default 0
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.learning_modules(id) on delete cascade,
  title text not null,
  goal text not null default '',
  explanation text[] not null default '{}',
  examples text[] not null default '{}',
  summary text not null default '',
  check_questions jsonb not null default '[]',
  position int not null default 0
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.learning_modules(id) on delete cascade,
  title text not null
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question text not null,
  options text[] not null,
  correct_index smallint not null,
  explanation text not null default '',
  position int not null default 0
);

-- ---------------------------------------------------------------- Nutzerdaten
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  program_id uuid references public.apprenticeship_programs(id),
  training_year smallint not null default 1 check (training_year between 1 and 3),
  daily_goal_minutes int not null default 30 check (daily_goal_minutes between 5 and 240),
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'premium', 'ultimate')),
  status text not null default 'active',
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score int not null,
  total int not null,
  points int not null,
  answers jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  exam_date date not null,
  daily_minutes int not null default 30,
  created_at timestamptz not null default now()
);

create table if not exists public.study_tasks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.study_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  due_date date not null,
  done boolean not null default false
);

create table if not exists public.learning_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 200),
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.user_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  topic text not null default '',
  file_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ki_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  count int not null default 0,
  primary key (user_id, day)
);

create index if not exists idx_lessons_module on public.lessons(module_id, position);
create index if not exists idx_tasks_user_due on public.study_tasks(user_id, due_date);
create index if not exists idx_materials_user on public.user_materials(user_id, created_at desc);

-- ---------------------------------------------------------------- Neues Konto: Profil + Free-Abo
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, program_id, training_year)
  values (
    new.id,
    coalesce(left(new.raw_user_meta_data ->> 'first_name', 60), ''),
    (select id from public.apprenticeship_programs where slug = 'buero-management' limit 1),
    case when (new.raw_user_meta_data ->> 'training_year') in ('1', '2', '3')
         then (new.raw_user_meta_data ->> 'training_year')::smallint else 1 end
  );
  insert into public.subscriptions (user_id, plan) values (new.id, 'free');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- Upload-Limit
-- Kostenlos: 5 eigene Dateien. Premium und Ultimate: unbegrenzt.
create or replace function public.material_limit(p_user uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select case
    when coalesce((select plan from public.subscriptions where user_id = p_user), 'free') = 'free'
    then 5 else 2147483647 end;
$$;

create or replace function public.enforce_material_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.user_materials where user_id = new.user_id) >= public.material_limit(new.user_id) then
    raise exception 'LIMIT_REACHED';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_material_limit on public.user_materials;
create trigger trg_material_limit
  before insert on public.user_materials
  for each row execute function public.enforce_material_limit();

-- Auch der Speicher selbst prueft das Limit, damit Dateien nicht an der Tabelle vorbei hochgeladen werden.
create or replace function public.storage_quota_ok(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public, storage
as $$
  select (
    select count(*) from storage.objects
    where bucket_id = 'materials' and (storage.foldername(name))[1] = p_user::text
  ) < public.material_limit(p_user);
$$;

-- ---------------------------------------------------------------- Quiz serverseitig auswerten
create or replace function public.submit_quiz(p_quiz_id uuid, p_answers int[])
returns table (score int, total int, points int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_score int := 0;
  v_total int := 0;
  r record;
  i int := 1;
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;
  for r in
    select correct_index from public.quiz_questions where quiz_id = p_quiz_id order by position
  loop
    v_total := v_total + 1;
    if p_answers[i] is not null and p_answers[i] = r.correct_index then
      v_score := v_score + 1;
    end if;
    i := i + 1;
  end loop;
  if v_total = 0 then
    raise exception 'QUIZ_NOT_FOUND';
  end if;
  insert into public.quiz_results (user_id, quiz_id, score, total, points, answers)
  values (v_uid, p_quiz_id, v_score, v_total, v_score * 10, to_jsonb(p_answers));
  return query select v_score, v_total, v_score * 10;
end;
$$;

revoke all on function public.submit_quiz(uuid, int[]) from public, anon;
grant execute on function public.submit_quiz(uuid, int[]) to authenticated;

-- ---------------------------------------------------------------- Row Level Security
alter table public.apprenticeship_programs enable row level security;
alter table public.learning_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.learning_progress enable row level security;
alter table public.quiz_results enable row level security;
alter table public.study_plans enable row level security;
alter table public.study_tasks enable row level security;
alter table public.user_materials enable row level security;
alter table public.learning_goals enable row level security;
alter table public.ki_usage enable row level security;

-- Lerninhalte: lesen fuer angemeldete Nutzer, schreiben nur ueber das Dashboard (Service Role)
create policy "content read programs" on public.apprenticeship_programs for select to authenticated using (true);
create policy "content read modules" on public.learning_modules for select to authenticated using (true);
create policy "content read lessons" on public.lessons for select to authenticated using (true);
create policy "content read quizzes" on public.quizzes for select to authenticated using (true);
create policy "content read questions" on public.quiz_questions for select to authenticated using (true);

-- Eigene Daten
create policy "profiles select own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Abo: nur lesen. Aenderungen erfolgen serverseitig (spaeter durch den Zahlungsanbieter).
create policy "subscriptions select own" on public.subscriptions for select to authenticated using (user_id = auth.uid());

create policy "progress select own" on public.learning_progress for select to authenticated using (user_id = auth.uid());
create policy "progress insert own" on public.learning_progress for insert to authenticated with check (user_id = auth.uid());
create policy "progress delete own" on public.learning_progress for delete to authenticated using (user_id = auth.uid());

-- Quiz-Ergebnisse: nur lesen, schreiben nur ueber submit_quiz()
create policy "results select own" on public.quiz_results for select to authenticated using (user_id = auth.uid());

create policy "plans select own" on public.study_plans for select to authenticated using (user_id = auth.uid());
create policy "plans insert own" on public.study_plans for insert to authenticated with check (user_id = auth.uid());
create policy "plans delete own" on public.study_plans for delete to authenticated using (user_id = auth.uid());

create policy "tasks select own" on public.study_tasks for select to authenticated using (user_id = auth.uid());
create policy "tasks insert own" on public.study_tasks for insert to authenticated with check (user_id = auth.uid());
create policy "tasks update own" on public.study_tasks for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tasks delete own" on public.study_tasks for delete to authenticated using (user_id = auth.uid());

create policy "goals select own" on public.learning_goals for select to authenticated using (user_id = auth.uid());
create policy "goals insert own" on public.learning_goals for insert to authenticated with check (user_id = auth.uid());
create policy "goals update own" on public.learning_goals for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "goals delete own" on public.learning_goals for delete to authenticated using (user_id = auth.uid());

create policy "materials select own" on public.user_materials for select to authenticated using (user_id = auth.uid());
create policy "materials insert own" on public.user_materials for insert to authenticated with check (user_id = auth.uid());
create policy "materials delete own" on public.user_materials for delete to authenticated using (user_id = auth.uid());

create policy "ki usage select own" on public.ki_usage for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------- Speicher fuer eigene Dateien (privat)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('materials', 'materials', false, 10485760,
        array['application/pdf', 'image/png', 'image/jpeg', 'text/plain'])
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types,
      public = false;

create policy "materials storage read own" on storage.objects for select to authenticated
  using (bucket_id = 'materials' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "materials storage insert own" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'materials'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.storage_quota_ok(auth.uid())
  );

create policy "materials storage delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'materials' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------- KI-Nutzungszaehler (nur serverseitig mit Service-Rechten nicht noetig)
-- Der Zaehler wird ueber diese Funktion erhoeht. Sie gibt false zurueck, wenn das Tageslimit erreicht ist.
create or replace function public.ki_use(p_limit int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_count int;
begin
  if v_uid is null then
    return false;
  end if;
  insert into public.ki_usage (user_id, day, count) values (v_uid, current_date, 0)
  on conflict (user_id, day) do nothing;
  update public.ki_usage set count = count + 1
  where user_id = v_uid and day = current_date and count < p_limit
  returning count into v_count;
  return v_count is not null;
end;
$$;

revoke all on function public.ki_use(int) from public, anon;
grant execute on function public.ki_use(int) to authenticated;
