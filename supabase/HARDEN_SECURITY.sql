-- SECURITY HARDENING: RLS Policies for missing tables
-- Ensure usage_tracking is isolated
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own usage" ON usage_tracking;
CREATE POLICY "Users can read their own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own usage" ON usage_tracking;
CREATE POLICY "Users can insert their own usage" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own usage" ON usage_tracking;
CREATE POLICY "Users can update their own usage" ON usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- Ensure sites have user_id checks (secondary verification)
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own sites" ON sites;
CREATE POLICY "Users can access their own sites" ON sites
  FOR ALL USING (auth.uid() = user_id);

-- Audit and enable RLS for backlink verification tables
ALTER TABLE backlink_verification ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own backlink verifications" ON backlink_verification;
CREATE POLICY "Users can view their own backlink verifications" ON backlink_verification
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM backlink_tasks
      WHERE backlink_tasks.id = backlink_verification.task_id
      AND backlink_tasks.user_id = auth.uid()
    )
  );

ALTER TABLE backlink_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own backlink logs" ON backlink_logs;
CREATE POLICY "Users can view their own backlink logs" ON backlink_logs
  FOR SELECT USING (auth.uid() = user_id);
