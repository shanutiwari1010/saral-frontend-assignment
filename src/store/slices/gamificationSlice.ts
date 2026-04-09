import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { GamificationState, Reward, RewardFormValues } from "@/types";
import type { RootState } from "@/store";

const initialState: GamificationState = {
  isModalOpen: false,
  isCommissionTierModalOpen: false,
  rewardIds: [],
  rewardsById: {},
  submitStatus: "idle",
  error: null,
};

export const submitReward = createAsyncThunk<
  Reward,
  RewardFormValues,
  { rejectValue: string }
>("gamification/submitReward", async (formValues, { rejectWithValue }) => {
  try {
    // In a real app, this is where we'd call the API.
    return buildRewardFromForm(formValues);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return rejectWithValue(message);
  }
});

const gamificationSlice = createSlice({
  name: "gamification",
  initialState,
  reducers: {
    openModal(state) {
      state.isModalOpen = true;
      state.error = null;
      state.submitStatus = "idle";
    },
    closeModal(state) {
      state.isModalOpen = false;
      state.error = null;
      state.submitStatus = "idle";
    },

    openCommissionTierModal(state) {
      state.isCommissionTierModalOpen = true;
    },
    closeCommissionTierModal(state) {
      state.isCommissionTierModalOpen = false;
    },

    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitReward.pending, (state) => {
        state.submitStatus = "loading";
        state.error = null;
      })
      .addCase(submitReward.fulfilled, (state, action: PayloadAction<Reward>) => {
        const reward = action.payload;
        state.submitStatus = "succeeded";
        state.rewardsById[reward.id] = reward;
        state.rewardIds.unshift(reward.id);
        state.isModalOpen = false;
        state.error = null;
      })
      .addCase(submitReward.rejected, (state, action) => {
        state.submitStatus = "failed";
        state.error = action.payload ?? "Failed to create reward";
      });
  },
});

export const {
  openModal,
  closeModal,
  openCommissionTierModal,
  closeCommissionTierModal,
  clearError,
} = gamificationSlice.actions;

export const selectGamification = (state: RootState) => state.gamification;
export const selectIsModalOpen = (state: RootState) =>
  state.gamification.isModalOpen;
export const selectIsCommissionTierModalOpen = (state: RootState) =>
  state.gamification.isCommissionTierModalOpen;
export const selectSubmitStatus = (state: RootState) =>
  state.gamification.submitStatus;
export const selectIsSubmitting = (state: RootState) =>
  state.gamification.submitStatus === "loading";
export const selectGamificationError = (state: RootState) =>
  state.gamification.error;
export const selectRewards = (state: RootState) =>
  state.gamification.rewardIds.map((id) => state.gamification.rewardsById[id]);

export function buildRewardFromForm(formValues: RewardFormValues): Reward {
  return {
    id: crypto.randomUUID(),
    rewardEvent: formValues.rewardEvent ?? "onboarded",
    salesAmount: formValues.salesAmount ?? "",
    postCount: formValues.postCount ?? "",
    postPeriod: formValues.postPeriod ?? "",
    rewardType: formValues.rewardType ?? "bonus",
    commissionTier: formValues.commissionTier ?? "",
    bonusAmount: formValues.bonusAmount ?? "",
    isTimeBound: formValues.isTimeBound,
    endDate: formValues.endDate,
    createdAt: new Date().toISOString(),
  };
}

export function getEventLabel(values: RewardFormValues): string {
  switch (values.rewardEvent) {
    case "sales":
      return `Cross $${values.salesAmount || "X"} in sales`;
    case "posts":
      return `Posts ${values.postCount || "X"} times every ${values.postPeriod || "Y"} period`;
    case "onboarded":
      return "Is Onboarded";
    default:
      return "";
  }
}

export function getRewardSummary(values: RewardFormValues): string {
  switch (values.rewardType) {
    case "bonus":
      return `Flat $${values.bonusAmount || "X"} Bonus`;
    case "points":
      return `Commission Tier: ${values.commissionTier || "—"}`;
    case "discount":
      return "Discount";
    default:
      return "Select a reward";
  }
}

export default gamificationSlice.reducer;
