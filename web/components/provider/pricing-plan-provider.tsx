"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getNextPlan,
  getPricingPlan,
  normalizeBillingPlan,
  pickHigherPlan,
  type BillingPlan,
  type PricingPlan,
} from "@/lib/pricing";

type UsageState = {
  day: string;
  aiExplains: number;
};

type PricingPlanContextValue = {
  plan: BillingPlan;
  detectedPlan: BillingPlan;
  overridePlan: BillingPlan | null;
  planConfig: PricingPlan;
  nextPlan: BillingPlan | null;
  aiExplainsUsedToday: number;
  aiExplainsRemaining: number | null;
  canUseAiExplain: boolean;
  setPlan: (plan: BillingPlan) => void;
  clearPlanOverride: () => void;
  consumeAiExplain: () => boolean;
  refreshPlan: () => Promise<void>;
};

const STORAGE_PLAN_KEY = "binboi-plan-override";
const STORAGE_USAGE_KEY = "binboi-pricing-usage";

const PricingPlanContext = createContext<PricingPlanContextValue | null>(null);

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeUsage(value: unknown): UsageState {
  const record = (value || {}) as Partial<UsageState>;
  const day = typeof record.day === "string" ? record.day : todayKey();
  const aiExplains =
    typeof record.aiExplains === "number" && Number.isFinite(record.aiExplains)
      ? record.aiExplains
      : 0;

  if (day !== todayKey()) {
    return { day: todayKey(), aiExplains: 0 };
  }

  return { day, aiExplains: Math.max(0, aiExplains) };
}

export function PricingPlanProvider({ children }: { children: ReactNode }) {
  const [detectedPlan, setDetectedPlan] = useState<BillingPlan>("FREE");
  const [overridePlan, setOverridePlan] = useState<BillingPlan | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const storedPlan = window.localStorage.getItem(STORAGE_PLAN_KEY);
      return storedPlan ? normalizeBillingPlan(storedPlan) : null;
    } catch {
      return null;
    }
  });
  const [usage, setUsage] = useState<UsageState>(() => {
    if (typeof window === "undefined") {
      return { day: todayKey(), aiExplains: 0 };
    }

    try {
      const storedUsage = window.localStorage.getItem(STORAGE_USAGE_KEY);
      return storedUsage
        ? normalizeUsage(JSON.parse(storedUsage))
        : { day: todayKey(), aiExplains: 0 };
    } catch {
      return { day: todayKey(), aiExplains: 0 };
    }
  });

  const refreshPlan = useCallback(async () => {
    try {
      const response = await fetch("/api/billing", { cache: "no-store" });
      const body = (await response.json().catch(() => null)) as
        | { subscription?: { plan?: string }; user?: { plan?: string } }
        | null;

      if (response.ok) {
        setDetectedPlan(
          normalizeBillingPlan(body?.subscription?.plan || body?.user?.plan),
        );
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const detectPlan = async () => {
      try {
        const response = await fetch("/api/billing", { cache: "no-store" });
        const body = (await response.json().catch(() => null)) as
          | { subscription?: { plan?: string }; user?: { plan?: string } }
          | null;

        if (!cancelled && response.ok) {
          setDetectedPlan(
            normalizeBillingPlan(body?.subscription?.plan || body?.user?.plan),
          );
        }
      } catch {
      }
    };

    void detectPlan();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_USAGE_KEY, JSON.stringify(normalizeUsage(usage)));
    } catch {
    }
  }, [usage]);

  const activePlan = useMemo(() => {
    return overridePlan ? pickHigherPlan(detectedPlan, overridePlan) : detectedPlan;
  }, [detectedPlan, overridePlan]);

  const planConfig = useMemo(() => getPricingPlan(activePlan), [activePlan]);
  const aiLimit = planConfig.limits.aiExplainsPerDay;
  const aiExplainsRemaining =
    aiLimit === null ? null : Math.max(aiLimit - usage.aiExplains, 0);
  const canUseAiExplain = aiLimit === null || usage.aiExplains < aiLimit;

  const setPlan = useCallback((plan: BillingPlan) => {
    setOverridePlan(plan);
    try {
      window.localStorage.setItem(STORAGE_PLAN_KEY, plan);
    } catch {
    }
  }, []);

  const clearPlanOverride = useCallback(() => {
    setOverridePlan(null);
    try {
      window.localStorage.removeItem(STORAGE_PLAN_KEY);
    } catch {
    }
  }, []);

  const consumeAiExplain = useCallback(() => {
    const currentUsage = normalizeUsage(usage);
    const currentPlan = overridePlan ? pickHigherPlan(detectedPlan, overridePlan) : detectedPlan;
    const currentLimit = getPricingPlan(currentPlan).limits.aiExplainsPerDay;

    if (currentLimit !== null && currentUsage.aiExplains >= currentLimit) {
      return false;
    }

    setUsage({ day: currentUsage.day, aiExplains: currentUsage.aiExplains + 1 });
    return true;
  }, [detectedPlan, overridePlan, usage]);

  const value = useMemo<PricingPlanContextValue>(
    () => ({
      plan: activePlan,
      detectedPlan,
      overridePlan,
      planConfig,
      nextPlan: getNextPlan(activePlan),
      aiExplainsUsedToday: normalizeUsage(usage).aiExplains,
      aiExplainsRemaining,
      canUseAiExplain,
      setPlan,
      clearPlanOverride,
      consumeAiExplain,
      refreshPlan,
    }),
    [
      activePlan,
      aiExplainsRemaining,
      canUseAiExplain,
      consumeAiExplain,
      detectedPlan,
      overridePlan,
      planConfig,
      refreshPlan,
      setPlan,
      clearPlanOverride,
      usage,
    ],
  );

  return <PricingPlanContext.Provider value={value}>{children}</PricingPlanContext.Provider>;
}

export function usePricingPlan() {
  const value = useContext(PricingPlanContext);
  if (!value) {
    throw new Error("usePricingPlan must be used inside PricingPlanProvider.");
  }
  return value;
}
