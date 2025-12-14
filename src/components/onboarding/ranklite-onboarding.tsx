"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Loader2, Sparkles, Globe, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CMS_TYPES = [
  { id: "wordpress", name: "WordPress", icon: "🔷" },
  { id: "webflow", name: "Webflow", icon: "🔵" },
  { id: "shopify", name: "Shopify", icon: "🟢" },
  { id: "wix", name: "Wix", icon: "🟡" },
  { id: "framer", name: "Framer", icon: "🔵" },
  { id: "notion", name: "Notion", icon: "⚫" },
  { id: "ghost", name: "Ghost", icon: "👻" },
  { id: "custom", name: "Custom / API", icon: "⚡" },
];

const INTEGRATIONS = [
  { id: "gsc", name: "Google Search Console", icon: "🔍", description: "Track rankings & performance" },
  { id: "ga", name: "Google Analytics", icon: "📊", description: "Monitor traffic & engagement" },
  { id: "cms-plugin", name: "CMS Plugin", icon: "🔌", description: "Auto-publish directly to your CMS" },
];

export function RankliteOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "failed">("idle");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    websiteUrl: "",
    cmsType: "",
    postsPerMonth: "10",
    backlinksPerPost: "20",
    minDR: "30",
    dailyLimit: "10",
    selectedIntegrations: [] as string[],
  });

  const updateFormData = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleIntegration = (integrationId: string) => {
    const current = formData.selectedIntegrations;
    if (current.includes(integrationId)) {
      updateFormData("selectedIntegrations", current.filter(id => id !== integrationId));
    } else {
      updateFormData("selectedIntegrations", [...current, integrationId]);
    }
  };

  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus("idle");
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setConnectionStatus("success");
    setTestingConnection(false);
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/onboarding/seo-cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrl: formData.websiteUrl,
          cmsType: formData.cmsType,
          postsPerMonth: parseInt(formData.postsPerMonth),
          backlinksPerPost: parseInt(formData.backlinksPerPost),
          minDR: parseInt(formData.minDR),
          dailyLimit: parseInt(formData.dailyLimit),
          integrations: formData.selectedIntegrations,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create SEO cycle");
      }

      setCurrentStep(5);
      
      setTimeout(() => {
        router.push("/dashboard/overview");
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderProgressIndicator = () => {
    const steps = ["Connect Website", "SEO Cycle", "Integrations"];
    
    return (
      <div className="flex items-center justify-center gap-3 pb-8">
        {steps.map((label, index) => {
          const isCompleted = currentStep > index + 1 || (currentStep === 5 && index < 3);
          const isActive = currentStep === index + 1;

          return (
            <div key={index} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all",
                    isCompleted
                      ? "bg-[#22C55E] text-white shadow-lg shadow-green-200"
                      : isActive
                        ? "bg-[#22C55E] text-white shadow-lg shadow-green-200 ring-4 ring-green-100"
                        : "bg-gray-100 text-gray-400"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive ? "text-gray-900" : isCompleted ? "text-green-600" : "text-gray-400"
                  )}
                >
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-12 transition-colors",
                    isCompleted ? "bg-[#22C55E]" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderWelcomeStep = () => (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] shadow-2xl shadow-green-200">
        <Sparkles className="h-10 w-10 text-white" />
      </div>
      <h1 className="mb-4 text-center text-4xl font-bold text-gray-900">
        Welcome to Ranklite
      </h1>
      <p className="mb-8 max-w-lg text-center text-lg text-gray-600">
        Set up your first automated SEO cycle in 5 minutes
      </p>
      <div className="grid max-w-2xl grid-cols-3 gap-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <span className="text-2xl">📝</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">Step 1</div>
          <div className="mt-1 text-sm text-gray-600">Connect Website</div>
        </div>
        <div className="text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <span className="text-2xl">⚙️</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">Step 2</div>
          <div className="mt-1 text-sm text-gray-600">Configure Cycle</div>
        </div>
        <div className="text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
              <span className="text-2xl">🚀</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">Step 3</div>
          <div className="mt-1 text-sm text-gray-600">Go Live</div>
        </div>
      </div>
      <Button
        onClick={handleNext}
        size="lg"
        className="mt-12 h-14 rounded-full bg-[#22C55E] px-12 text-lg font-semibold text-white shadow-xl shadow-green-200 transition-all hover:scale-105 hover:bg-[#16A34A] hover:shadow-2xl"
      >
        Get Started
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );

  const renderConnectWebsiteStep = () => (
    <div className="flex flex-1 flex-col px-8 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-900">Connect Your Website</h2>
          <p className="text-gray-600">
            Enter your website URL and select your CMS platform
          </p>
        </div>

        <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-900">
              Website URL
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="https://yourwebsite.com"
                  value={formData.websiteUrl}
                  onChange={(e) => updateFormData("websiteUrl", e.target.value)}
                  className="h-14 rounded-xl border-gray-200 pl-12 text-base shadow-sm focus:border-[#22C55E] focus:ring-2 focus:ring-green-100"
                />
              </div>
              <Button
                onClick={testConnection}
                disabled={!formData.websiteUrl || testingConnection}
                variant="outline"
                className="h-14 rounded-xl border-2 border-gray-200 px-8 font-semibold shadow-sm hover:border-[#22C55E] hover:bg-green-50"
              >
                {testingConnection ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test"
                )}
              </Button>
            </div>
            {connectionStatus === "success" && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Connected successfully!</span>
              </div>
            )}
            {connectionStatus === "failed" && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Connection failed. Please check your URL.</span>
              </div>
            )}
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-900">
              CMS Platform
            </label>
            <div className="grid grid-cols-4 gap-3">
              {CMS_TYPES.map((cms) => (
                <button
                  key={cms.id}
                  onClick={() => updateFormData("cmsType", cms.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:shadow-md",
                    formData.cmsType === cms.id
                      ? "border-[#22C55E] bg-green-50 shadow-lg shadow-green-100"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <span className="text-3xl">{cms.icon}</span>
                  <span className="text-xs font-medium text-gray-700">{cms.name}</span>
                </button>
              ))}
            </div>
          </div>

          {formData.cmsType && (
            <div className="rounded-xl bg-blue-50 p-4">
              <div className="flex gap-3">
                <div className="text-blue-600">ℹ️</div>
                <div className="flex-1">
                  <div className="font-semibold text-blue-900">Setup guide available</div>
                  <div className="mt-1 text-sm text-blue-700">
                    We&apos;ll guide you through connecting {CMS_TYPES.find(c => c.id === formData.cmsType)?.name} after configuration.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderConfigureCycleStep = () => (
    <div className="flex flex-1 flex-col px-8 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-900">Configure SEO Cycle</h2>
          <p className="text-gray-600">
            Set your automation preferences and quality standards
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
            <h3 className="mb-6 text-lg font-bold text-gray-900">Content Generation</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  Posts per Month
                </label>
                <Select value={formData.postsPerMonth} onValueChange={(v) => updateFormData("postsPerMonth", v)}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 posts/month</SelectItem>
                    <SelectItem value="10">10 posts/month</SelectItem>
                    <SelectItem value="15">15 posts/month</SelectItem>
                    <SelectItem value="20">20 posts/month</SelectItem>
                    <SelectItem value="30">30 posts/month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  Backlinks per Post
                </label>
                <Select value={formData.backlinksPerPost} onValueChange={(v) => updateFormData("backlinksPerPost", v)}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 backlinks</SelectItem>
                    <SelectItem value="20">20 backlinks</SelectItem>
                    <SelectItem value="30">30 backlinks</SelectItem>
                    <SelectItem value="50">50 backlinks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
            <h3 className="mb-6 text-lg font-bold text-gray-900">Quality Standards</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  Min DR for Backlinks
                </label>
                <Select value={formData.minDR} onValueChange={(v) => updateFormData("minDR", v)}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">DR 20+</SelectItem>
                    <SelectItem value="30">DR 30+</SelectItem>
                    <SelectItem value="40">DR 40+</SelectItem>
                    <SelectItem value="50">DR 50+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  Daily Automation Limit
                </label>
                <Select value={formData.dailyLimit} onValueChange={(v) => updateFormData("dailyLimit", v)}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per day</SelectItem>
                    <SelectItem value="10">10 per day</SelectItem>
                    <SelectItem value="15">15 per day</SelectItem>
                    <SelectItem value="20">20 per day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-green-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-green-900">
                <CheckCircle className="h-5 w-5 text-green-600" />
                QA Validation: Enabled
              </div>
              <p className="mt-1 text-xs text-green-700">
                All content and backlinks will be automatically validated before publishing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsStep = () => (
    <div className="flex flex-1 flex-col px-8 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-900">Invite Integrations</h2>
          <p className="text-gray-600">
            Connect additional tools to enhance your SEO workflow (optional)
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
          {INTEGRATIONS.map((integration) => {
            const isSelected = formData.selectedIntegrations.includes(integration.id);
            
            return (
              <button
                key={integration.id}
                onClick={() => toggleIntegration(integration.id)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-xl border-2 p-6 text-left transition-all hover:shadow-md",
                  isSelected
                    ? "border-[#22C55E] bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">
                  <span className="text-3xl">{integration.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{integration.name}</div>
                  <div className="text-sm text-gray-600">{integration.description}</div>
                </div>
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                    isSelected
                      ? "border-[#22C55E] bg-[#22C55E]"
                      : "border-gray-300"
                  )}
                >
                  {isSelected && <Check className="h-4 w-4 text-white" />}
                </div>
              </button>
            );
          })}

          <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
            <strong>Note:</strong> You can skip this step and configure integrations later in your dashboard.
          </div>
        </div>
      </div>
    </div>
  );

  const renderCycleSummaryStep = () => (
    <div className="flex flex-1 flex-col px-8 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-900">First Cycle Summary</h2>
          <p className="text-gray-600">
            Review your automated SEO cycle configuration
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#22C55E]">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">What Ranklite will do automatically:</div>
                  <div className="text-lg font-bold text-gray-900">Your SEO Cycle</div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Post Title</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Target Keyword</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Backlinks</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          Post {i + 1} - AI Generated
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Auto-detected
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            {formData.backlinksPerPost} links
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            Planned
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-green-100 p-6 text-center shadow-lg">
              <div className="mb-2 text-3xl font-bold text-green-900">{formData.postsPerMonth}</div>
              <div className="text-sm font-medium text-green-700">Posts/Month</div>
              <div className="mt-1 text-xs text-green-600">Generated automatically</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center shadow-lg">
              <div className="mb-2 text-3xl font-bold text-blue-900">{parseInt(formData.postsPerMonth) * parseInt(formData.backlinksPerPost)}</div>
              <div className="text-sm font-medium text-blue-700">Backlinks/Month</div>
              <div className="mt-1 text-xs text-blue-600">Built within 24 hours</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 text-center shadow-lg">
              <div className="mb-2 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-purple-900" />
              </div>
              <div className="text-sm font-medium text-purple-700">QA Active</div>
              <div className="mt-1 text-xs text-purple-600">Quality validated</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] shadow-2xl shadow-green-200">
        <CheckCircle className="h-14 w-14 text-white" />
      </div>
      <h1 className="mb-4 text-center text-4xl font-bold text-gray-900">
        You&apos;re All Set! 🎉
      </h1>
      <p className="mb-8 max-w-xl text-center text-lg text-gray-600">
        Your SEO cycle is now active. Ranklite will automatically:
      </p>
      
      <div className="mb-12 grid max-w-2xl grid-cols-1 gap-4">
        {[
          { icon: "📝", title: "Generate your first 5 posts automatically", desc: "High-quality, SEO-optimized content" },
          { icon: "🔗", title: "Build backlinks within 24 hours", desc: `${formData.backlinksPerPost} quality backlinks per post` },
          { icon: "✅", title: "QA & Indexing tracking is active", desc: "Automated validation and monitoring" },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-green-50">
              <span className="text-2xl">{item.icon}</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{item.title}</div>
              <div className="mt-1 text-sm text-gray-600">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Loader2 className="h-4 w-4 animate-spin text-[#22C55E]" />
        <span>Redirecting to your dashboard...</span>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return renderConnectWebsiteStep();
      case 2:
        return renderConfigureCycleStep();
      case 3:
        return renderIntegrationsStep();
      case 4:
        return renderCycleSummaryStep();
      case 5:
        return renderSuccessStep();
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#FAFFFE] via-[#F0FDF4] to-[#E8F5E9]">
      <div className="flex h-full w-full max-w-[1000px] flex-col bg-white md:h-[92vh] md:max-h-[950px] md:rounded-3xl md:shadow-2xl">
        {currentStep > 0 && currentStep < 5 && (
          <div className="border-b border-gray-200 px-8 pt-8">
            {renderProgressIndicator()}
          </div>
        )}

        {error && (
          <div className="mx-8 mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {renderCurrentStep()}

        {currentStep > 0 && currentStep < 5 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-8 py-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="h-12 rounded-xl border-2 border-gray-200 px-8 font-semibold hover:border-gray-300"
            >
              Back
            </Button>
            {currentStep === 4 ? (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="h-12 rounded-xl bg-[#22C55E] px-8 font-semibold text-white shadow-lg shadow-green-200 hover:bg-[#16A34A]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Activating Cycle...
                  </>
                ) : (
                  <>
                    Activate Cycle
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            ) : currentStep === 3 ? (
              <Button
                onClick={handleNext}
                className="h-12 rounded-xl bg-[#22C55E] px-8 font-semibold text-white shadow-lg shadow-green-200 hover:bg-[#16A34A]"
              >
                {formData.selectedIntegrations.length > 0 ? "Continue" : "Skip for Now"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && (!formData.websiteUrl || !formData.cmsType)) ||
                  (currentStep === 2 && !formData.postsPerMonth)
                }
                className="h-12 rounded-xl bg-[#22C55E] px-8 font-semibold text-white shadow-lg shadow-green-200 hover:bg-[#16A34A] disabled:opacity-50"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
