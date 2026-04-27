-- Esenza · 0004 · Pulido PQRSF + Reviews (Sprint 4B)
-- Correlo en Supabase Dashboard → SQL Editor → Run

-- ============================================================================
-- COMPLAINTS: attachments + AI fields
-- ============================================================================
alter table public.complaints
  add column if not exists attachments jsonb not null default '[]'::jsonb,
  add column if not exists ai_classification jsonb,  -- {suggested_type, area, confidence, summary}
  add column if not exists ai_sentiment text check (ai_sentiment in ('positive', 'neutral', 'negative', 'urgent') or ai_sentiment is null);

-- ============================================================================
-- REVIEWS: subratings + photos + sentiment
-- ============================================================================
alter table public.reviews
  add column if not exists sub_ratings jsonb,  -- {comida, limpieza, atencion, ubicacion, valor} ints 1-5
  add column if not exists photos jsonb not null default '[]'::jsonb,
  add column if not exists ai_sentiment text check (ai_sentiment in ('positive', 'neutral', 'negative') or ai_sentiment is null),
  add column if not exists ai_tags jsonb;  -- array of short tags extraídos por AI

-- ============================================================================
-- SITE CONFIG: templates de respuesta + otras
-- ============================================================================
insert into public.site_config (key, value) values
  ('pqrsf_response_templates', '[]'),
  ('monthly_report_last_run', '""')
on conflict (key) do nothing;
