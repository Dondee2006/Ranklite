"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, HelpCircle, Loader2, Sparkles, CheckCircle, Plus, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STEPS = [
  { id: "website", label: "Business" },
  { id: "business", label: "Business" },
  { id: "audience", label: "Audience & Competitors" },
  { id: "blog", label: "Blog" },
  { id: "articles", label: "Articles" },
  { id: "integration", label: "Integration" },
];

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (DRC)", "Congo (Republic)",
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
  "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
  "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia",
  "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
  "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const IMAGE_STYLES = [
  { id: "brand-text", label: "Brand & Text", image: "/images/style-brand.png" },
  { id: "watercolor", label: "Watercolor", image: "/images/style-watercolor.png" },
  { id: "cinematic", label: "Cinematic", image: "/images/style-cinematic.png" },
  { id: "illustration", label: "Illustration", image: "/images/style-illustration.png" },
  { id: "sketch", label: "Sketch", image: "/images/style-sketch.png" },
];

const INTEGRATIONS = [
  { id: "notion", name: "Notion", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z' fill='%23ffffff'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z' fill='%23000000'/%3E%3C/svg%3E" },
  { id: "wordpress", name: "WordPress", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 122.52 122.523'%3E%3Cpath fill='%2321759b' d='M8.708 61.26c0 20.802 12.089 38.779 29.619 47.298L13.258 39.872a52.354 52.354 0 0 0-4.55 21.388zM96.74 58.608c0-6.495-2.333-10.993-4.334-14.494-2.664-4.329-5.161-7.995-5.161-12.324 0-4.831 3.664-9.328 8.825-9.328.233 0 .454.029.681.042-9.35-8.566-21.807-13.796-35.489-13.796-18.36 0-34.513 9.42-43.91 23.688 1.233.037 2.395.063 3.382.063 5.497 0 14.006-.667 14.006-.667 2.833-.167 3.167 3.994.337 4.329 0 0-2.847.335-6.015.501L48.2 93.547l11.501-34.493-8.188-22.434c-2.83-.166-5.511-.501-5.511-.501-2.832-.166-2.5-4.496.332-4.329 0 0 8.679.667 13.843.667 5.496 0 14.006-.667 14.006-.667 2.835-.167 3.168 3.994.337 4.329 0 0-2.853.335-6.015.501l18.992 56.494 5.242-17.517c2.272-7.269 4.001-12.49 4.001-16.989z'/%3E%3Cpath fill='%2321759b' d='M62.184 65.857l-15.768 45.819a52.552 52.552 0 0 0 32.262-.836 4.68 4.68 0 0 1-.37-.712L62.184 65.857zM107.376 36.046c.226 1.674.354 3.471.354 5.404 0 5.333-.996 11.328-3.996 18.824l-16.053 46.413c15.624-9.111 26.133-26.038 26.133-45.426.001-9.137-2.333-17.729-6.438-25.215z'/%3E%3Cpath fill='%2321759b' d='M61.262 0C27.483 0 0 27.481 0 61.26c0 33.783 27.483 61.263 61.262 61.263 33.778 0 61.258-27.48 61.258-61.263C122.52 27.481 95.04 0 61.262 0zm0 119.715c-32.23 0-58.453-26.223-58.453-58.455 0-32.23 26.222-58.451 58.453-58.451 32.229 0 58.45 26.221 58.45 58.451 0 32.232-26.221 58.455-58.45 58.455z'/%3E%3C/svg%3E" },
  { id: "wordpress-com", name: "WordPress.com", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 122.52 122.523'%3E%3Cpath fill='%2321759b' d='M8.708 61.26c0 20.802 12.089 38.779 29.619 47.298L13.258 39.872a52.354 52.354 0 0 0-4.55 21.388zM96.74 58.608c0-6.495-2.333-10.993-4.334-14.494-2.664-4.329-5.161-7.995-5.161-12.324 0-4.831 3.664-9.328 8.825-9.328.233 0 .454.029.681.042-9.35-8.566-21.807-13.796-35.489-13.796-18.36 0-34.513 9.42-43.91 23.688 1.233.037 2.395.063 3.382.063 5.497 0 14.006-.667 14.006-.667 2.833-.167 3.167 3.994.337 4.329 0 0-2.847.335-6.015.501L48.2 93.547l11.501-34.493-8.188-22.434c-2.83-.166-5.511-.501-5.511-.501-2.832-.166-2.5-4.496.332-4.329 0 0 8.679.667 13.843.667 5.496 0 14.006-.667 14.006-.667 2.835-.167 3.168 3.994.337 4.329 0 0-2.853.335-6.015.501l18.992 56.494 5.242-17.517c2.272-7.269 4.001-12.49 4.001-16.989z'/%3E%3Cpath fill='%2321759b' d='M62.184 65.857l-15.768 45.819a52.552 52.552 0 0 0 32.262-.836 4.68 4.68 0 0 1-.37-.712L62.184 65.857zM107.376 36.046c.226 1.674.354 3.471.354 5.404 0 5.333-.996 11.328-3.996 18.824l-16.053 46.413c15.624-9.111 26.133-26.038 26.133-45.426.001-9.137-2.333-17.729-6.438-25.215z'/%3E%3Cpath fill='%2321759b' d='M61.262 0C27.483 0 0 27.481 0 61.26c0 33.783 27.483 61.263 61.262 61.263 33.778 0 61.258-27.48 61.258-61.263C122.52 27.481 95.04 0 61.262 0zm0 119.715c-32.23 0-58.453-26.223-58.453-58.455 0-32.23 26.222-58.451 58.453-58.451 32.229 0 58.45 26.221 58.45 58.451 0 32.232-26.221 58.455-58.45 58.455z'/%3E%3C/svg%3E" },
  { id: "shopify", name: "Shopify", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 109.5 124.5'%3E%3Cpath fill='%2395BF47' d='M74.7 14.8c0 0-1.4 0.4-3.7 1.1-0.4-1.3-1-2.8-1.8-4.4-2.6-5-6.5-7.7-11.1-7.7 0 0 0 0 0 0-0.3 0-0.6 0-1 0.1-0.1-0.2-0.3-0.3-0.4-0.5-2-2.2-4.6-3.2-7.7-3.2-6 0.2-12 4.5-16.8 12.2-3.4 5.4-6 12.2-6.7 17.5-6.9 2.1-11.7 3.6-11.8 3.7-3.5 1.1-3.6 1.2-4 4.5-0.3 2.5-9.5 73.1-9.5 73.1l75.6 13.1V14.6c-0.5 0.1-1 0.1-1.1 0.2zM57.2 20.2c-4 1.2-8.4 2.6-12.7 3.9 1.2-4.7 3.6-9.4 6.4-12.5 1.1-1.1 2.6-2.4 4.3-3.2 1.7 3.5 2.1 8.5 2 11.8zM49.1 3.9c1.4 0 2.6 0.3 3.6 0.9-1.6 0.8-3.2 2.1-4.7 3.6-3.8 4.1-6.7 10.5-7.9 16.6-3.6 1.1-7.2 2.2-10.5 3.2 2-10.1 10.2-23.8 19.5-24.3zM32.9 67.5c0.4 6.4 17.3 7.8 18.3 22.9 0.7 11.9-6.3 20-16.4 20.6-12.2 0.8-18.9-6.4-18.9-6.4l2.6-11s6.7 5.1 12.1 4.7c3.5-0.2 4.8-3.1 4.7-5.1-0.5-8.4-14.3-7.9-15.2-21.7-0.8-11.6 6.9-23.3 23.7-24.4 6.5-0.4 9.8 1.2 9.8 1.2l-3.8 14.4s-4.3-2-9.4-1.6c-7.5 0.5-7.6 5.2-7.5 6.4zM60.1 19.3c0-2.9-0.4-7-1.8-10.5 4.5 0.9 6.7 5.9 7.7 8.9-1.8 0.5-3.8 1-5.9 1.6z'/%3E%3Cpath fill='%235E8E3E' d='M78.1 123.9l31.4-7.8s-13.5-91.3-13.6-91.9c-0.1-0.6-0.6-1-1.1-1-0.5 0-9.3-0.2-9.3-0.2s-5.2-5.1-7.4-7.1v108z'/%3E%3C/svg%3E" },
  { id: "wix", name: "Wix", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 80'%3E%3Cpath fill='%23000000' d='M16.5 24c-3.8 2.6-5.7 6.8-5.7 12.3v29.2h12.5V36.9c0-2.2.4-3.6 1.1-4.5.8-1.1 2-1.5 4.4-1.5l3.9 33.2h12.8l3.8-32.4 4 32.4h12.8l7.2-41.3H60.9l-3.2 27.8-3.6-27.8H43.5l-3.5 27.8-3.2-27.8H22.2c-2.1 0-3.9.4-5.7 1.2z'/%3E%3Cpath fill='%23000000' d='M78.5 24.3h12.8v41.2H78.5z'/%3E%3Cellipse fill='%23FBBC04' cx='84.9' cy='24.3' rx='3.5' ry='5'/%3E%3Cpath fill='%23000000' d='M135.2 24.3l-9.2 14.4-9-14.4h-14.6l16.2 22.4-16.5 18.8h15.1l8.8-12.4 8.7 12.4h15.1l-16.5-18.8 16.2-22.4z'/%3E%3C/svg%3E" },
  { id: "webflow", name: "Webflow", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath fill='%234353FF' d='M48 16c0 0-6.4 20-6.8 21.2-0.2-1.4-5.9-21.2-5.9-21.2-2.9 0-5.5 2.1-6.6 5.2 0 0-4.5 13.5-4.7 14.1-0.1-1.3-1.4-19.3-1.4-19.3-2.5 0-4.8 1.8-5.5 4.4L14 40h6.6l1.8-12c0.2 1 3.8 15.2 3.8 15.2 3 0 5.5-1.9 6.6-4.8l4.3-13c0.2 1 2.3 17.8 2.3 17.8h6.7l5.5-21.6C49.3 21.6 48 16 48 16z'/%3E%3C/svg%3E" },
  { id: "api", name: "API Webhook", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23FF4A00' d='M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm-.5 4.8c.7 0 1.2.5 1.2 1.2s-.5 1.2-1.2 1.2-1.2-.5-1.2-1.2.5-1.2 1.2-1.2zm4.5 7.7c0 .3-.2.5-.5.5h-2.3v5.5c0 .3-.2.5-.5.5h-2.4c-.3 0-.5-.2-.5-.5V13H7.5c-.3 0-.5-.2-.5-.5v-2c0-.3.2-.5.5-.5h6.5c.3 0 .5.2.5.5v2z'/%3E%3C/svg%3E" },
  { id: "framer", name: "Framer", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%230055FF' d='M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z'/%3E%3C/svg%3E" },
  { id: "feather", name: "Feather", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238B5CF6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z'%3E%3C/path%3E%3Cline x1='16' y1='8' x2='2' y2='22'%3E%3C/line%3E%3Cline x1='17.5' y1='15' x2='9' y2='15'%3E%3C/line%3E%3C/svg%3E" },
];

function getCompetitorLogo(competitor: string): string {
  const domain = competitor.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function getCompetitorDomain(competitor: string): string {
  return competitor.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
}

export function OnboardingWizard({ isAddingNewSite = false }: { isAddingNewSite?: boolean }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [error, setError] = useState("");
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    websiteUrl: "",
    businessName: "",
    language: "English",
    country: "United States",
    description: "",
    targetAudiences: [] as string[],
    competitors: [] as string[],
    sitemapUrl: "",
    blogAddress: "",
    articleUrls: ["", "", ""],
    autoPublish: true,
    articleStyle: "Informative",
    internalLinks: "3 links per article",
    globalInstructions: "",
    brandColor: "#000000",
    imageStyle: "brand-text",
    titleBasedImage: false,
    youtubeVideo: false,
    callToAction: false,
    includeInfographics: false,
    includeEmojis: false,
    selectedIntegration: "",
  });
  const [newAudience, setNewAudience] = useState("");
  const [newCompetitor, setNewCompetitor] = useState("");

  const updateFormData = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const addAudience = () => {
    if (newAudience.trim() && formData.targetAudiences.length < 7) {
      updateFormData("targetAudiences", [...formData.targetAudiences, newAudience.trim()]);
      setNewAudience("");
    }
  };

  const removeAudience = (index: number) => {
    updateFormData(
      "targetAudiences",
      formData.targetAudiences.filter((_, i) => i !== index)
    );
  };

  const addCompetitor = () => {
    if (newCompetitor.trim() && formData.competitors.length < 7) {
      updateFormData("competitors", [...formData.competitors, newCompetitor.trim()]);
      setNewCompetitor("");
      setSuggestedCompetitors(prev => prev.filter(c => c !== newCompetitor.trim()));
    }
  };

  const addSuggestedCompetitor = (competitor: string) => {
    if (formData.competitors.length < 7 && !formData.competitors.includes(competitor)) {
      updateFormData("competitors", [...formData.competitors, competitor]);
      setSuggestedCompetitors(prev => prev.filter(c => c !== competitor));
    }
  };

  const removeCompetitor = (index: number) => {
    const removed = formData.competitors[index];
    updateFormData(
      "competitors",
      formData.competitors.filter((_, i) => i !== index)
    );
    if (removed && !suggestedCompetitors.includes(removed)) {
      setSuggestedCompetitors(prev => [...prev, removed]);
    }
  };

  const fetchBusinessInfo = async () => {
    if (!formData.websiteUrl.trim()) return;

    setFetching(true);
    setFetchError("");

    try {
      const response = await fetch("/api/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formData.websiteUrl }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          businessName: data.data.businessName || prev.businessName,
          description: data.data.description || prev.description,
          language: data.data.language || prev.language,
          country: data.data.country || prev.country,
          targetAudiences: data.data.suggestedAudiences?.length > 0
            ? data.data.suggestedAudiences
            : prev.targetAudiences,
          sitemapUrl: data.data.sitemapUrl || prev.sitemapUrl,
          blogAddress: data.data.blogUrl || prev.blogAddress,
        }));
        if (data.data.suggestedCompetitors?.length > 0) {
          setSuggestedCompetitors(data.data.suggestedCompetitors);
        }
        setCurrentStep(1);
      } else {
        setFetchError(data.error || "Could not fetch website info. You can enter details manually.");
        setCurrentStep(1);
      }
    } catch {
      setFetchError("Could not fetch website info. You can enter details manually.");
      setCurrentStep(1);
    } finally {
      setFetching(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      fetchBusinessInfo();
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrl: formData.websiteUrl,
          businessName: formData.businessName,
          language: formData.language,
          country: formData.country,
          businessDescription: formData.description,
          targetAudience: formData.targetAudiences.join(", "),
          competitors: formData.competitors,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          setError("Please sign in to complete onboarding");
          router.push("/login");
          return;
        }
        const errorMessage = data.error || data.message || "Failed to save onboarding data";
        console.error("Server returned error:", errorMessage, data);
        setError(errorMessage);
        return;
      }

      if (isAddingNewSite) {
        toast.success("Site successfully added!");
        router.push("/dashboard/settings");
      } else {
        toast.success("Welcome aboard! Site setup complete.");
        router.push("/dashboard/content-planner?welcome=true");
      }
      router.refresh();
    } catch (error) {
      console.error("Onboarding error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const renderStepIndicator = () => {
    const displaySteps = [
      { label: "Business", completed: currentStep > 1 },
      { label: "Audience & Competitors", completed: currentStep > 2 },
      { label: "Blog", completed: currentStep > 3 },
      { label: "Articles", completed: currentStep > 4 },
      { label: "Integration", completed: currentStep > 5 },
    ];

    return (
      <div className="flex items-center justify-center gap-2 border-b border-border pb-6">
        {displaySteps.map((step, index) => {
          const isActive =
            (index === 0 && (currentStep === 0 || currentStep === 1)) ||
            (index === 1 && currentStep === 2) ||
            (index === 2 && currentStep === 3) ||
            (index === 3 && currentStep === 4) ||
            (index === 4 && currentStep === 5);

          return (
            <div key={index} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium",
                    step.completed
                      ? "bg-[#22C55E] text-white"
                      : isActive
                        ? "bg-[#22C55E] text-white"
                        : "border border-border text-muted-foreground"
                  )}
                >
                  {step.completed ? <Check className="h-3 w-3" /> : null}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    isActive ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < displaySteps.length - 1 && (
                <div className="mx-2 h-px w-8 bg-border" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderWebsiteStep = () => (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A]">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h2 className="mb-3 text-2xl font-bold text-foreground">Let&apos;s start with your website</h2>
      <p className="mb-8 text-center text-muted-foreground max-w-md">
        Share your website URL and we&apos;ll instantly gather your business information to save you time
      </p>
      <div className="flex w-full max-w-xl flex-col gap-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="https://yourbusiness.com"
            value={formData.websiteUrl}
            onChange={(e) => updateFormData("websiteUrl", e.target.value)}
            className="h-12 flex-1 rounded-xl border-border px-4 text-base"
            onKeyDown={(e) => e.key === "Enter" && handleNext()}
            disabled={fetching}
          />
          <Button
            onClick={handleNext}
            disabled={fetching || !formData.websiteUrl.trim()}
            className="h-12 rounded-xl bg-[#22C55E] px-8 font-semibold text-white hover:bg-[#16A34A]"
          >
            {fetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
        {fetching && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#22C55E]" />
            Scanning website for business information...
          </div>
        )}
      </div>
    </div>
  );

  const renderBusinessStep = () => (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-center gap-2">
          <CheckCircle className="h-5 w-5 text-[#22C55E]" />
          <span className="text-sm font-medium text-[#22C55E]">Information gathered from your website</span>
        </div>
        <h2 className="mb-2 text-center text-2xl font-bold text-foreground">Review your business details</h2>
        <p className="mb-8 text-center text-muted-foreground">
          We&apos;ve pre-filled the information below based on your website. Please verify and adjust as needed.
        </p>

        {fetchError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            {fetchError}
          </div>
        )}

        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-foreground">Business name</label>
            <Input
              value={formData.businessName}
              onChange={(e) => updateFormData("businessName", e.target.value)}
              placeholder="Your Business Name"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="mb-5 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 flex items-center gap-1 text-sm font-medium text-foreground">
                Language <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </label>
              <Select value={formData.language} onValueChange={(v) => updateFormData("language", v)}>
                <SelectTrigger className="h-11 w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 flex items-center gap-1 text-sm font-medium text-foreground">
                Country <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </label>
              <Select value={formData.country} onValueChange={(v) => updateFormData("country", v)}>
                <SelectTrigger className="h-11 w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              placeholder="Describe your business..."
              className="min-h-[120px] rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAudienceStep = () => (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
          Define your Target Audience and Competitors
        </h2>
        <p className="mb-8 text-center text-muted-foreground">
          Understanding your audience and competition ensures we generate the most effective keywords
        </p>

        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Target Audiences</h3>
              <span className="rounded-full bg-[#F0FDF4] px-2 py-0.5 text-xs font-medium text-[#16A34A]">
                {formData.targetAudiences.length}/7
              </span>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Enter your target audience groups to create relevant content. Better audience understanding improves results
            </p>
            <div className="mb-4 flex gap-2">
              <Input
                value={newAudience}
                onChange={(e) => setNewAudience(e.target.value)}
                placeholder="Enter your target audience groups (e.g., Developers, Project Managers)"
                className="h-11 flex-1 rounded-xl"
                onKeyDown={(e) => e.key === "Enter" && addAudience()}
              />
              <Button
                onClick={addAudience}
                variant="outline"
                className="h-11 rounded-xl px-6"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.targetAudiences.map((audience, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm"
                >
                  <span className="max-w-[200px] truncate">{audience}</span>
                  <button onClick={() => removeAudience(index)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Competitors</h3>
              <span className="rounded-full bg-[#F0FDF4] px-2 py-0.5 text-xs font-medium text-[#16A34A]">
                {formData.competitors.length}/7
              </span>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Enter competitors to discover the SEO keywords they rank for. Bigger competitors provide more valuable insights
            </p>
            <div className="mb-4 flex gap-2">
              <Input
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                placeholder="Enter competitor URLs or company names (e.g. https://revid.ai or revid.ai)"
                className="h-11 flex-1 rounded-xl"
                onKeyDown={(e) => e.key === "Enter" && addCompetitor()}
              />
              <Button
                onClick={addCompetitor}
                variant="outline"
                className="h-11 rounded-xl px-6"
              >
                Add
              </Button>
            </div>

            {suggestedCompetitors.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Suggested competitors from your website:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedCompetitors.map((competitor, index) => (
                    <button
                      key={index}
                      onClick={() => addSuggestedCompetitor(competitor)}
                      disabled={formData.competitors.length >= 7}
                      className="flex items-center gap-2 rounded-lg border border-dashed border-[#22C55E] bg-[#F0FDF4] px-3 py-2.5 text-sm text-[#16A34A] transition-all hover:bg-[#DCFCE7] hover:shadow-sm disabled:opacity-50"
                    >
                      <img
                        src={getCompetitorLogo(competitor)}
                        alt=""
                        className="h-5 w-5 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <Globe className="hidden h-5 w-5 text-[#16A34A]" />
                      <span className="max-w-[140px] truncate font-medium">{getCompetitorDomain(competitor)}</span>
                      <Plus className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {formData.competitors.map((competitor, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-border bg-gradient-to-r from-white to-gray-50 px-3 py-2.5 text-sm shadow-sm"
                >
                  <img
                    src={getCompetitorLogo(competitor)}
                    alt=""
                    className="h-5 w-5 rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <Globe className="hidden h-5 w-5 text-muted-foreground" />
                  <span className="max-w-[140px] truncate font-medium">{getCompetitorDomain(competitor)}</span>
                  <button onClick={() => removeCompetitor(index)} className="ml-1 text-muted-foreground hover:text-red-500 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBlogStep = () => (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
          Help us understand your content
        </h2>
        <p className="mb-8 text-center text-muted-foreground">
          Share your content details to help us create more relevant and targeted blog posts for your audience
        </p>

        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="mb-5">
            <label className="mb-2 flex items-center gap-1 text-sm font-medium text-foreground">
              Sitemap URL <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            </label>
            <Input
              value={formData.sitemapUrl}
              onChange={(e) => updateFormData("sitemapUrl", e.target.value)}
              placeholder="https://yourbusiness.com/sitemap.xml"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="mb-5">
            <label className="mb-2 flex items-center gap-1 text-sm font-medium text-foreground">
              Main blog address <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            </label>
            <Input
              value={formData.blogAddress}
              onChange={(e) => updateFormData("blogAddress", e.target.value)}
              placeholder="https://yourblog.com/blog"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="mb-5">
            <label className="mb-2 flex items-center gap-1 text-sm font-medium text-foreground">
              Your best article examples URL <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            </label>
            {formData.articleUrls.map((url, index) => (
              <Input
                key={index}
                value={url}
                onChange={(e) => {
                  const newUrls = [...formData.articleUrls];
                  newUrls[index] = e.target.value;
                  updateFormData("articleUrls", newUrls);
                }}
                placeholder={`Your top article URL #${index + 1}`}
                className="mb-3 h-11 rounded-xl"
              />
            ))}
          </div>

          <div className="rounded-xl border border-border bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Connect Google Search Console</h4>
                <p className="text-sm text-muted-foreground">
                  Avoid suggesting keywords you already rank for
                </p>
              </div>
              <Button variant="outline" className="rounded-xl">
                Connect GSC
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderArticlesStep = () => (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
          Configure your article preferences
        </h2>
        <p className="mb-8 text-center text-muted-foreground">
          Set your preferences once to ensure all future articles maintain your quality standards and brand consistency
        </p>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Content & SEO</h3>

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Auto-publish</h4>
                <p className="text-sm text-muted-foreground">Publish new articles automatically</p>
              </div>
              <Switch
                checked={formData.autoPublish}
                onCheckedChange={(v) => updateFormData("autoPublish", v)}
              />
            </div>

            <div className="mb-5 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 flex items-center gap-1 text-sm font-medium text-foreground">
                  Article Style <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </label>
                <Select value={formData.articleStyle} onValueChange={(v) => updateFormData("articleStyle", v)}>
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Informative">Informative</SelectItem>
                    <SelectItem value="Conversational">Conversational</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-2 flex items-center gap-1 text-xs text-[#16A34A]">
                  <Check className="h-3 w-3" />
                  Style is automatically derived from your example articles
                </p>
              </div>
              <div>
                <label className="mb-2 flex items-center gap-1 text-sm font-medium text-foreground">
                  Internal Links <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </label>
                <Select value={formData.internalLinks} onValueChange={(v) => updateFormData("internalLinks", v)}>
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 link per article">1 link per article</SelectItem>
                    <SelectItem value="2 links per article">2 links per article</SelectItem>
                    <SelectItem value="3 links per article">3 links per article</SelectItem>
                    <SelectItem value="5 links per article">5 links per article</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-1 text-sm font-medium text-foreground">
                Global Article Instructions <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </label>
              <Textarea
                value={formData.globalInstructions}
                onChange={(e) => updateFormData("globalInstructions", e.target.value)}
                placeholder="Enter global instructions for all articles (e.g., 'Always include practical examples', 'Focus on actionable insights')..."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Engagement</h3>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-foreground">Brand Color</label>
              <div className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-lg border border-border"
                  style={{ backgroundColor: formData.brandColor }}
                />
                <Input
                  value={formData.brandColor}
                  onChange={(e) => updateFormData("brandColor", e.target.value)}
                  className="h-11 w-32 rounded-xl"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-foreground">Image Style</label>
              <p className="mb-3 text-sm text-muted-foreground">
                Style for all article images. Featured images use this style unless you enable Title-Based Featured Images below.
              </p>
              <div className="grid grid-cols-5 gap-3">
                {IMAGE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => updateFormData("imageStyle", style.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all",
                      formData.imageStyle === style.id
                        ? "border-[#22C55E] bg-[#F0FDF4]"
                        : "border-border hover:border-[#22C55E]/50"
                    )}
                  >
                    <div className="h-16 w-full rounded-lg bg-gray-100" />
                    <span className="flex items-center gap-1 text-xs font-medium">
                      {style.label} <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="flex items-center gap-2 font-medium text-foreground">
                    Title-Based Featured Image
                    <span className="rounded bg-[#22C55E] px-1.5 py-0.5 text-[10px] font-bold text-white">NEW</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Improved Featured Images that include article title and your brand color.
                  </p>
                </div>
                <Switch
                  checked={formData.titleBasedImage}
                  onCheckedChange={(v) => updateFormData("titleBasedImage", v)}
                />
              </div>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              {[
                { key: "youtubeVideo", label: "YouTube Video", desc: "Automatically finds and adds relevant YouTube videos based on article content." },
                { key: "callToAction", label: "Call-to-Action", desc: "Automatically adds a call-to-action section with your website URL to drive engagement." },
                { key: "includeInfographics", label: "Include Infographics", desc: "Automatically replaces images with data visualizations when articles contain statistics or comparisons." },
                { key: "includeEmojis", label: "Include Emojis", desc: "Automatically adds relevant emojis to enhance engagement and visual appeal." },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{item.label}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={formData[item.key as keyof typeof formData] as boolean}
                    onCheckedChange={(v) => updateFormData(item.key, v)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationStep = () => (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-2 text-center text-2xl font-bold text-foreground">Create Integrations</h2>
        <p className="mb-8 text-center text-muted-foreground">
          Connect your blog to publish articles automatically, or set this up later in your dashboard.
        </p>

        <div className="grid grid-cols-3 gap-4">
          {INTEGRATIONS.map((integration) => (
            <button
              key={integration.id}
              onClick={() => updateFormData("selectedIntegration", integration.id)}
              className={cn(
                "flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all hover:shadow-lg",
                formData.selectedIntegration === integration.id
                  ? "border-[#22C55E] bg-[#F0FDF4]"
                  : "border-border bg-white hover:border-[#22C55E]/50"
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
                <img
                  src={integration.logo}
                  alt={integration.name}
                  className="h-10 w-10 object-contain"
                />
              </div>
              <span className="text-sm font-medium text-foreground">{integration.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderWebsiteStep();
      case 1:
        return renderBusinessStep();
      case 2:
        return renderAudienceStep();
      case 3:
        return renderBlogStep();
      case 4:
        return renderArticlesStep();
      case 5:
        return renderIntegrationStep();
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex h-full w-full max-w-[900px] flex-col bg-white shadow-2xl md:h-[90vh] md:max-h-[900px] md:rounded-3xl">
        {currentStep > 0 && (
          <div className="border-b border-border px-8 pt-6">
            {renderStepIndicator()}
          </div>
        )}

        {error && (
          <div className="mx-8 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {renderCurrentStep()}

        {currentStep > 0 && (
          <div className="flex items-center justify-between border-t border-border px-8 py-4">
            <Button variant="outline" onClick={handleBack} className="h-11 rounded-xl px-6">
              Back
            </Button>
            {currentStep === STEPS.length - 1 ? (
              <Button
                onClick={handleComplete}
                disabled={saving}
                className="h-11 rounded-xl bg-[#22C55E] px-6 font-semibold text-white hover:bg-[#16A34A]"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAddingNewSite ? "Add Site" : "Skip & Get Started"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="h-11 rounded-xl bg-[#22C55E] px-6 font-semibold text-white hover:bg-[#16A34A]"
              >
                Continue
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}