-- Session 7: agent_stats was insert-only, which meant a live-polling
-- agent (agents/health-factor-monitor, reporting every POLL_INTERVAL_MS)
-- would accumulate one row per metric per tick forever, and GET /agents
-- had no way to know which row was current. Add a uniqueness constraint
-- on (agent_id, metric) so reports upsert the latest value in place.
--
-- Safe to run even if agent_stats already has duplicate (agent_id,
-- metric) rows from before this migration — dedupes to the most recent
-- row per pair first, then adds the constraint.

delete from agent_stats a using agent_stats b
where a.agent_id = b.agent_id
  and a.metric = b.metric
  and a.recorded_at < b.recorded_at;

alter table agent_stats
  add constraint agent_stats_agent_metric_unique unique (agent_id, metric);
