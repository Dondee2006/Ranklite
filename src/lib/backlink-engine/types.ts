export interface Platform {
  id: string;
  site_name: string;
  site_domain: string;
  submission_type: "api" | "form" | "profile";
  submission_url: string | null;
  automation_allowed: boolean;
  requires_login: boolean;
  has_captcha: boolean;
  robots_txt_allows: boolean;
  tos_allows_automation: boolean;
  domain_rating: number | null;
  monthly_traffic: string | null;
  api_schema: Record<string, string> | null;
  form_fields: Record<string, string> | null;
  category: string | null;
  notes: string | null;
  last_checked_at: string | null;
}

export interface BacklinkTask {
  id: string;
  user_id: string;
  article_id?: string | null;
  platform_id: string | null;
  website_url: string;
  status: TaskStatus;
  priority: number;
  submission_type: string | null;
  submission_data: SubmissionData | null;
  policy_check_result: PolicyCheckResult | null;
  attempt_count: number;
  max_attempts: number;
  last_attempt_at: string | null;
  next_attempt_at: string | null;
  scheduled_for: string | null;
  completed_at: string | null;
  error_message: string | null;
  screenshot_url: string | null;
  response_html: string | null;
  requires_manual_review: boolean;
  manual_review_reason: string | null;
  outreach_status: string | null;
  verification_status: string | null;
  created_at: string;
  updated_at: string;
  platform?: Platform;
}

export type TaskStatus =
  | "pending"
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "blocked"
  | "require_manual";

export interface SubmissionData {
  business_name?: string;
  website_url?: string;
  description?: string;
  email?: string;
  tagline?: string;
  category?: string;
  [key: string]: string | undefined;
}

export interface PolicyCheckResult {
  can_automate: boolean;
  reason?: string;
  robots_txt_checked: boolean;
  robots_txt_allows: boolean;
  tos_checked: boolean;
  tos_allows: boolean;
  has_captcha: boolean;
  requires_login: boolean;
  checked_at: string;
}

export interface BacklinkVerification {
  id: string;
  backlink_id: string;
  user_id: string;
  target_url: string;
  expected_anchor_text: string | null;
  found_anchor_text: string | null;
  link_type: "dofollow" | "nofollow" | null;
  is_dofollow: boolean | null;
  is_indexed: boolean;
  verification_status: "pending" | "verified" | "not_found" | "error";
  last_verified_at: string | null;
  next_verification_at: string | null;
  verification_count: number;
  response_status_code: number | null;
  html_snippet: string | null;
}

export interface BacklinkLog {
  id: string;
  user_id: string;
  task_id: string | null;
  platform_id: string | null;
  action: string;
  status: string | null;
  details: Record<string, unknown> | null;
  robots_txt_checked: boolean;
  tos_compliant: boolean;
  ip_address: string | null;
  user_agent: string | null;
  screenshot_url: string | null;
  created_at: string;
}

export interface WorkerResult {
  success: boolean;
  task_id: string;
  status: TaskStatus;
  error_message?: string;
  requires_manual_review?: boolean;
  manual_review_reason?: string;
  screenshot_url?: string;
  backlink_url?: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  website_url: string | null;
  status: string;
  agent_status: string;
  current_step: string | null;
  total_backlinks: number;
  unique_sources: number;
  avg_domain_rating: number;
  this_month_backlinks: number;
  is_paused: boolean;
  daily_submission_count: number;
  pending_tasks: number;
  manual_review_count: number;
  failed_tasks: number;
  max_daily_submissions: number;
  min_domain_rating: number;
  last_scan_at: string | null;
  next_scan_at: string | null;
}
