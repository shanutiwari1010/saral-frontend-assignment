export type RewardEvent = "sales" | "posts" | "onboarded";

export type RewardType = "bonus" | "points" | "discount";

export type PostPeriod =
  | "14 days"
  | "1 month"
  | "2 months"
  | "3 months"
  | "1 year";

export interface RewardFormValues {
  rewardEvent?: RewardEvent;
  salesAmount?: string;
  postCount?: string;
  postPeriod?: string;
  rewardType?: RewardType;
  commissionTier?: string;
  bonusAmount?: string;
  isTimeBound: boolean;
  endDate?: string;
}

export interface Reward extends Required<Omit<RewardFormValues, "endDate">> {
  id: string;
  createdAt: string;
  endDate?: string;
}

export interface GamificationState {
  isModalOpen: boolean;
  isCommissionTierModalOpen: boolean;
  rewardIds: string[];
  rewardsById: Record<string, Reward>;
  submitStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export const INITIAL_REWARD_FORM: RewardFormValues = {
  rewardEvent: undefined,
  rewardType: undefined,
  commissionTier: "",
  isTimeBound: false,
  salesAmount: "",
  postCount: "",
  postPeriod: "",
  bonusAmount: "",
  endDate: undefined,
};

export const POST_PERIOD_OPTIONS: { value: PostPeriod; label: string }[] = [
  { value: "14 days", label: "14 days" },
  { value: "1 month", label: "1 month" },
  { value: "2 months", label: "2 months" },
  { value: "3 months", label: "3 months" },
  { value: "1 year", label: "1 year" },
];

export const COMMISSION_TIERS = [
  { value: "tier-1", label: "Tier Name Here" },
  { value: "tier-2", label: "Tier Name Here" },
  { value: "tier-3", label: "Tier Name Here" },
  { value: "tier-4", label: "Tier Name Here" },
  { value: "tier-5", label: "Tier Name Here" },
] as const;
