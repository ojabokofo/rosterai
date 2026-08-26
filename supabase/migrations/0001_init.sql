-- Roster — core schema (Session 1)
-- Run via `supabase db push`, or paste into your Supabase project's SQL editor.

create extension if not exists "pgcrypto";

create type agent_category as enum (
  'rebalancing',
  'grid-trading',
  'yield-optimisation',
  'health-factor'
);

create type agent_status as enum ('live', 'paused', 'retired');
create type agent_chain as enum ('bsc', 'bsc-testnet');
create type activation_status as enum ('pending', 'active', 'revoked');

create table agents (
  id uuid primary key default gen_random_uuid(),
  callsign text not null,
  category agent_category not null,
  description text not null default '',
  wallet_address text not null,
  chain agent_chain not null default 'bsc',
  status agent_status not null default 'live',
  a2a_card_url text,
  created_at timestamptz not null default now()
);

create index agents_category_idx on agents (category);
create index agents_status_idx on agents (status);

create table agent_stats (
  id bigint generated always as identity primary key,
  agent_id uuid not null references agents (id) on delete cascade,
  metric text not null,           -- 'APY' | 'WIN RATE' | 'UPTIME' | 'MIN HF' | ...
  value numeric not null,
  unit text,                      -- '%' | '$M' | null
  recorded_at timestamptz not null default now()
);

create index agent_stats_agent_idx on agent_stats (agent_id, metric, recorded_at desc);

create table activations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents (id) on delete cascade,
  user_wallet text not null,
  status activation_status not null default 'pending',
  activated_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index activations_wallet_idx on activations (user_wallet);
create index activations_agent_idx on activations (agent_id);

create table advantage_report_tasks (
  id bigint generated always as identity primary key,
  title text not null,
  category text not null,          -- one of agent_category, or 'trading' | 'stock' | 'security'
  agent_id uuid references agents (id) on delete set null,
  with_agent_time_seconds integer,
  without_agent_time_seconds integer,
  with_agent_cost_usd numeric,
  without_agent_cost_usd numeric,
  with_agent_output_url text,
  without_agent_output_url text,
  quality_notes text,
  created_at timestamptz not null default now()
);

-- RLS: agents/stats/report are public read (it's a public marketplace);
-- writes go through the API using the service role key, which bypasses RLS.
alter table agents enable row level security;
alter table agent_stats enable row level security;
alter table advantage_report_tasks enable row level security;
alter table activations enable row level security;

create policy "agents are publicly readable" on agents for select using (true);
create policy "agent_stats are publicly readable" on agent_stats for select using (true);
create policy "advantage report is publicly readable" on advantage_report_tasks for select using (true);
-- activations has no select policy — only the service role (apps/api) can read/write them.
