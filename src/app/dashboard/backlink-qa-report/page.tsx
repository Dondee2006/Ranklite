"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  Download,
  Loader2,
  Shield,
  Link2,
  BarChart3,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QAReport {
  summary: {
    total_backlinks: number;
    validated: number;
    broken: number;
    indexed: number;
    not_indexed: number;
    high_quality: number;
    low_quality: number;
    dofollow: number;
    nofollow: number;
  };
  validation_results: Array<{
    backlink_id: string;
    source_name: string;
    linking_url: string;
    exists: boolean;
    correct_url: boolean;
    anchor_text_found: string | null;
    is_dofollow: boolean | null;
    html_placement: string | null;
    response_code: number | null;
    error: string | null;
  }>;
  indexing_results: Array<{
    backlink_id: string;
    source_name: string;
    linking_url: string;
    is_indexed_google: boolean | null;
    robots_txt_allows: boolean | null;
    indexing_error: string | null;
    days_since_creation: number;
  }>;
  quality_assessments: Array<{
    backlink_id: string;
    source_name: string;
    source_domain: string;
    domain_rating: number | null;
    traffic: string | null;
    is_relevant: boolean;
    quality_score: "high" | "medium" | "low" | "spam";
    quality_notes: string;
  }>;
  errors: Array<{
    backlink_id: string;
    source_name: string;
    error_type: string;
    description: string;
  }>;
  generated_at: string;
}

export default function BacklinkQAReportPage() {
  const [report, setReport] = useState<QAReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "validation" | "indexing" | "quality" | "errors"
  >("overview");

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const response = await fetch("/api/backlinks/qa-report");
        if (!response.ok) {
          throw new Error("Failed to generate report");
        }
        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, []);

  const downloadReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backlink-qa-report-${new Date().toISOString()}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFFFE] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#8B5CF6] mx-auto mb-4" />
          <p className="text-muted-foreground">Generating QA Report...</p>
          <p className="text-sm text-muted-foreground mt-2">
            This may take a few minutes
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFFFE] flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-foreground font-semibold mb-2">Error</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const validationRate = (report.summary.validated / report.summary.total_backlinks) * 100;
  const indexingRate = report.summary.indexed / report.summary.total_backlinks * 100;
  const qualityRate = (report.summary.high_quality / report.summary.total_backlinks) * 100;
  const dofollowRate = (report.summary.dofollow / (report.summary.dofollow + report.summary.nofollow)) * 100;

  return (
    <div className="min-h-screen bg-[#FAFFFE]">
      <header className="sticky top-0 z-30 border-b border-border bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-xl font-semibold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Backlink QA Report
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Generated: {new Date(report.generated_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 rounded-lg bg-[#8B5CF6] px-4 py-2 text-sm font-medium text-white hover:bg-[#7C3AED] transition-all"
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">
                {validationRate.toFixed(0)}%
              </span>
            </div>
            <p className="text-sm font-medium text-foreground">Validation Rate</p>
            <p className="text-xs text-muted-foreground mt-1">
              {report.summary.validated} of {report.summary.total_backlinks} validated
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {indexingRate.toFixed(0)}%
              </span>
            </div>
            <p className="text-sm font-medium text-foreground">Indexing Rate</p>
            <p className="text-xs text-muted-foreground mt-1">
              {report.summary.indexed} indexed by Google
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {qualityRate.toFixed(0)}%
              </span>
            </div>
            <p className="text-sm font-medium text-foreground">High Quality</p>
            <p className="text-xs text-muted-foreground mt-1">
              {report.summary.high_quality} high-quality links
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <Link2 className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-2xl font-bold text-emerald-600">
                {dofollowRate.toFixed(0)}%
              </span>
            </div>
            <p className="text-sm font-medium text-foreground">Dofollow Rate</p>
            <p className="text-xs text-muted-foreground mt-1">
              {report.summary.dofollow} dofollow links
            </p>
          </div>
        </div>

        <div className="mb-6 border-b border-border bg-white rounded-t-2xl overflow-hidden">
          <div className="flex gap-2 p-2">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "validation", label: "Validation", icon: CheckCircle2 },
              { id: "indexing", label: "Indexing", icon: BarChart3 },
              { id: "quality", label: "Quality", icon: Shield },
              { id: "errors", label: "Errors", icon: AlertTriangle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  selectedTab === tab.id
                    ? "bg-[#8B5CF6] text-white"
                    : "text-muted-foreground hover:bg-gray-100"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {selectedTab === "overview" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Summary Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-muted-foreground">Total Backlinks</p>
                  <p className="text-2xl font-bold text-foreground">
                    {report.summary.total_backlinks}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-50">
                  <p className="text-sm text-green-700">Validated</p>
                  <p className="text-2xl font-bold text-green-700">
                    {report.summary.validated}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-red-50">
                  <p className="text-sm text-red-700">Broken</p>
                  <p className="text-2xl font-bold text-red-700">
                    {report.summary.broken}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50">
                  <p className="text-sm text-blue-700">Indexed</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {report.summary.indexed}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50">
                  <p className="text-sm text-purple-700">High Quality</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {report.summary.high_quality}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-orange-50">
                  <p className="text-sm text-orange-700">Low Quality</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {report.summary.low_quality}
                  </p>
                </div>
              </div>
            </div>

            {report.errors.length > 0 && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h2 className="text-lg font-semibold text-red-900">
                    Critical Issues Found: {report.errors.length}
                  </h2>
                </div>
                <div className="space-y-2">
                  {report.errors.slice(0, 5).map((err, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white"
                    >
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-red-900">{err.source_name}</p>
                        <p className="text-sm text-red-700">
                          {err.error_type}: {err.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedTab === "validation" && (
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Validation Results</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Source
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      URL
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                      Link Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Anchor Text
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.validation_results.map((result) => (
                    <tr key={result.backlink_id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">
                        {result.source_name}
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={result.linking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#8B5CF6] hover:underline flex items-center gap-1"
                        >
                          <span className="truncate max-w-[200px]">
                            {result.linking_url}
                          </span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {result.exists ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs">Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <XCircle className="h-4 w-4" />
                            <span className="text-xs">Broken</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {result.is_dofollow === true ? (
                          <span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            Dofollow
                          </span>
                        ) : result.is_dofollow === false ? (
                          <span className="inline-block px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                            Nofollow
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {result.anchor_text_found || "Not found"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === "indexing" && (
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Indexing Status</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Source
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                      Google Indexed
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                      Robots.txt
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                      Days Old
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      URL
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.indexing_results.map((result) => (
                    <tr key={result.backlink_id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">
                        {result.source_name}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {result.is_indexed_google === true ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                          </span>
                        ) : result.is_indexed_google === false ? (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <XCircle className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unknown</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {result.robots_txt_allows === true ? (
                          <span className="text-green-600">✓</span>
                        ) : result.robots_txt_allows === false ? (
                          <span className="text-red-600">✗</span>
                        ) : (
                          <span className="text-muted-foreground">?</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-xs",
                            result.days_since_creation > 7
                              ? "text-orange-600"
                              : "text-muted-foreground"
                          )}
                        >
                          <Clock className="h-3 w-3" />
                          {result.days_since_creation}d
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={result.linking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#8B5CF6] hover:underline truncate max-w-[200px] inline-block"
                        >
                          {result.linking_url}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === "quality" && (
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Quality Assessment</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Source
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                      DR
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                      Traffic
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                      Quality
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.quality_assessments.map((assessment) => (
                    <tr key={assessment.backlink_id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">
                        {assessment.source_name}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={cn(
                            "inline-block px-2 py-1 rounded-lg text-xs font-bold text-white",
                            (assessment.domain_rating || 0) >= 70
                              ? "bg-green-500"
                              : (assessment.domain_rating || 0) >= 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          )}
                        >
                          {assessment.domain_rating || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                        {assessment.traffic || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={cn(
                            "inline-block px-3 py-1 rounded-full text-xs font-medium",
                            assessment.quality_score === "high"
                              ? "bg-green-100 text-green-700"
                              : assessment.quality_score === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : assessment.quality_score === "low"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {assessment.quality_score.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {assessment.quality_notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === "errors" && (
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              Error Log ({report.errors.length})
            </h2>
            <div className="space-y-3">
              {report.errors.map((err, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-lg border border-red-200 bg-red-50"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0",
                      err.error_type === "Broken Link"
                        ? "bg-red-100"
                        : err.error_type === "Not Indexed"
                        ? "bg-orange-100"
                        : "bg-yellow-100"
                    )}
                  >
                    {err.error_type === "Broken Link" ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : err.error_type === "Not Indexed" ? (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">
                        {err.source_name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                        {err.error_type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{err.description}</p>
                  </div>
                </div>
              ))}
              {report.errors.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-foreground font-medium">No errors found!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All backlinks passed validation
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
