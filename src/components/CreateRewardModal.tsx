"use client";

import { useMemo, useState, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar as CalendarIcon, Pencil } from "lucide-react";
import { format, addDays, startOfToday } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  openCommissionTierModal,
  closeCommissionTierModal,
  selectGamificationError,
  selectIsCommissionTierModalOpen,
  selectIsSubmitting,
  submitReward,
  getEventLabel,
  getRewardSummary,
} from "@/store/slices/gamificationSlice";
import type { RewardFormValues, RewardEvent, RewardType } from "@/types";
import { COMMISSION_TIERS, INITIAL_REWARD_FORM, POST_PERIOD_OPTIONS } from "@/types";

const formSchema = z
  .object({
    rewardEvent: z.enum(["sales", "posts", "onboarded"]).optional(),
    salesAmount: z.string().optional(),
    postCount: z.string().optional(),
    postPeriod: z.string().optional(),
    rewardType: z.enum(["bonus", "points", "discount"]).optional(),
    commissionTier: z.string().optional(),
    bonusAmount: z.string().optional(),
    isTimeBound: z.boolean(),
    endDate: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.rewardEvent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rewardEvent"],
        message: "Please select a reward event.",
      });
    }

    if (data.rewardEvent === "sales" && !data.salesAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salesAmount"],
        message: "Amount is required",
      });
    }

    if (data.rewardEvent === "posts") {
      if (!data.postCount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["postCount"],
          message: "Times is required",
        });
      }
      if (!data.postPeriod) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["postPeriod"],
          message: "Period is required",
        });
      }
    }

    if (data.isTimeBound && !data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date is required",
      });
    }

    if (!data.rewardType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rewardType"],
        message: "Please select a reward type.",
      });
    }

    if (data.rewardType === "bonus" && !data.bonusAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bonusAmount"],
        message: "Bonus amount is required",
      });
    }

    if (data.rewardType === "points" && !data.commissionTier) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["commissionTier"],
        message: "Please select a commission tier.",
      });
    }
  });

type FormSchema = z.infer<typeof formSchema>;

interface CreateRewardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateRewardModal({
  open,
  onOpenChange,
}: CreateRewardModalProps) {
  const dispatch = useAppDispatch();
  const submitting = useAppSelector(selectIsSubmitting);
  const error = useAppSelector(selectGamificationError);
  const isCommissionTierModalOpen = useAppSelector(
    selectIsCommissionTierModalOpen,
  );

  const [draftRewardEvent, setDraftRewardEvent] = useState<RewardEvent | "">(
    "",
  );
  const [draftSalesAmount, setDraftSalesAmount] = useState("");
  const [draftPostCount, setDraftPostCount] = useState("");
  const [draftPostPeriod, setDraftPostPeriod] = useState("");
  const [rewardEventOpen, setRewardEventOpen] = useState(false);
  const [rewardTypeOpen, setRewardTypeOpen] = useState(false);
  const [draftRewardType, setDraftRewardType] = useState<RewardType | "">("");
  const [draftBonusAmount, setDraftBonusAmount] = useState("");
  const [draftCommissionTierValue, setDraftCommissionTierValue] = useState("");
  const [draftCommissionTierLabel, setDraftCommissionTierLabel] = useState("");
  const [endDateOpen, setEndDateOpen] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...INITIAL_REWARD_FORM,
      // React Hook Form expects Date here, while our store form model uses ISO string.
      endDate: undefined,
    },
    mode: "onSubmit",
  });

  const { control, handleSubmit } = form;
  const values = useWatch({ control });

  const tomorrow = useMemo(() => addDays(startOfToday(), 1), []);

  const resetDrafts = useCallback(() => {
    setDraftRewardEvent("");
    setDraftSalesAmount("");
    setDraftPostCount("");
    setDraftPostPeriod("");
    setDraftRewardType("");
    setDraftBonusAmount("");
    setDraftCommissionTierValue("");
    setDraftCommissionTierLabel("");
  }, []);

  const closeAndReset = useCallback(() => {
    onOpenChange(false);
    form.reset();
    resetDrafts();
  }, [onOpenChange, form, resetDrafts]);

  const onSubmit = useCallback(
    async (data: FormSchema) => {
      const rewardFormValues: RewardFormValues = {
        rewardEvent: data.rewardEvent,
        salesAmount: data.salesAmount,
        postCount: data.postCount,
        postPeriod: data.postPeriod,
        rewardType: data.rewardType,
        commissionTier: data.commissionTier,
        bonusAmount: data.bonusAmount,
        isTimeBound: data.isTimeBound,
        endDate: data.endDate ? data.endDate.toISOString() : undefined,
      };

      try {
        await dispatch(submitReward(rewardFormValues)).unwrap();

        const eventLabel = getEventLabel(rewardFormValues);
        const rewardSummary = getRewardSummary(rewardFormValues);

        toast.success("Reward Created Successfully", {
          description: `Target: ${eventLabel} with ${rewardSummary}`,
        });

        form.reset();
        resetDrafts();
      } catch (error_) {
        const description =
          typeof error_ === "string" && error_.length > 0
            ? error_
            : error_ instanceof Error
              ? error_.message
              : "An unexpected error occurred";
        toast.error("Failed to create reward", { description });
      }
    },
    [dispatch, form, resetDrafts],
  );

  const onSubmitError = useCallback(() => {
    toast.error("Please fix the highlighted fields before submitting.");
  }, []);

  const hasRequiredFields =
    Boolean(values.rewardEvent) && Boolean(values.rewardType);
  const hasEventValues = (() => {
    if (values.rewardEvent === "sales") return Boolean(values.salesAmount);
    if (values.rewardEvent === "posts")
      return Boolean(values.postCount) && Boolean(values.postPeriod);
    return true;
  })();
  const hasRewardValues = (() => {
    if (values.rewardType === "bonus") return Boolean(values.bonusAmount);
    if (values.rewardType === "points") return Boolean(values.commissionTier);
    return true;
  })();
  const hasTimeBoundValues = values.isTimeBound
    ? Boolean(values.endDate)
    : true;
  const canSubmit =
    hasRequiredFields &&
    hasEventValues &&
    hasRewardValues &&
    hasTimeBoundValues &&
    !submitting;

  const needsEndDateForTooltip = values.isTimeBound && values.endDate == null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeAndReset();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-popover">
        <DialogHeader className="p-6 pb-2 relative">
          <DialogTitle className="text-leading-tight">
            Create your reward system
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit, onSubmitError)}
            className="space-y-6 p-6 pt-2"
          >
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
                {error}
              </div>
            )}
            <div className="space-y-3">
              <FormField<FormSchema, "rewardEvent">
                control={control}
                name="rewardEvent"
                render={() => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-secondary">
                      Reward event <span className="text-red-500">*</span>
                    </FormLabel>

                    <Select
                      open={rewardEventOpen}
                      onOpenChange={(nextOpen) => {
                        setRewardEventOpen(nextOpen);
                        if (nextOpen) {
                          setDraftRewardEvent(
                            (values.rewardEvent as RewardEvent) ?? "",
                          );
                          setDraftSalesAmount(values.salesAmount ?? "");
                          setDraftPostCount(values.postCount ?? "");
                          setDraftPostPeriod(values.postPeriod ?? "");
                        }
                      }}
                      onValueChange={(v) => {
                        setDraftRewardEvent(v as RewardEvent);

                        if (v === "sales" || v === "posts") {
                          setTimeout(() => setRewardEventOpen(true), 0);
                          return;
                        }

                        form.setValue("rewardEvent", v as RewardEvent, {
                          shouldValidate: true,
                        });
                        form.setValue("salesAmount", "", {
                          shouldValidate: true,
                        });
                        form.setValue("postCount", "", {
                          shouldValidate: true,
                        });
                        form.setValue("postPeriod", "", {
                          shouldValidate: true,
                        });
                        setRewardEventOpen(false);
                      }}
                      value={draftRewardEvent || values.rewardEvent || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 border-2 border-primary text-foreground font-medium focus:ring-0">
                          <span
                            className={cn(
                              "line-clamp-1",
                              !values.rewardEvent && "text-muted-foreground",
                            )}
                          >
                            {values.rewardEvent
                              ? values.rewardEvent === "sales"
                                ? `Cross $${draftRewardEvent === "sales" ? draftSalesAmount || values.salesAmount || "X" : values.salesAmount || "X"} in sales`
                                : values.rewardEvent === "posts"
                                  ? `Posts ${draftRewardEvent === "posts" ? draftPostCount || values.postCount || "X" : values.postCount || "X"} times every ${draftRewardEvent === "posts" ? draftPostPeriod || values.postPeriod || "Y" : values.postPeriod || "Y"} period`
                                  : "Is Onboarded"
                              : "Select an event"}
                          </span>
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className="rounded-lg shadow-lg bg-popover">
                        <SelectItem value="sales" className="p-2.5">
                          Cross $
                          {draftRewardEvent === "sales" ||
                          values.rewardEvent === "sales"
                            ? draftSalesAmount || values.salesAmount || "X"
                            : "X"}{" "}
                          in sales
                        </SelectItem>
                        <SelectItem value="posts" className="py-3">
                          Posts{" "}
                          {draftRewardEvent === "posts" ||
                          values.rewardEvent === "posts"
                            ? draftPostCount || values.postCount || "X"
                            : "X"}{" "}
                          times every{" "}
                          {draftRewardEvent === "posts" ||
                          values.rewardEvent === "posts"
                            ? draftPostPeriod || values.postPeriod || "Y"
                            : "Y"}{" "}
                          period
                        </SelectItem>
                        <SelectItem value="onboarded" className="py-3">
                          Is Onboarded
                        </SelectItem>

                        {draftRewardEvent === "sales" && (
                          <div
                            className="mt-2 rounded-xl border-2 border-primary p-3"
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground font-medium">
                                $
                              </span>
                              <Input
                                type="number"
                                placeholder="e.g. 100"
                                className="h-11 pl-8 border-0 focus-visible:ring-0"
                                value={draftSalesAmount}
                                onChange={(e) =>
                                  setDraftSalesAmount(e.target.value)
                                }
                                inputMode="numeric"
                              />
                            </div>

                            <div className="mt-3 flex gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-11 rounded-xl"
                                onClick={() => {
                                  setDraftRewardEvent(
                                    (values.rewardEvent as RewardEvent) ?? "",
                                  );
                                  setDraftSalesAmount(values.salesAmount ?? "");
                                  setDraftPostCount(values.postCount ?? "");
                                  setDraftPostPeriod(values.postPeriod ?? "");
                                  setRewardEventOpen(false);
                                }}
                              >
                                Cancel
                              </Button>

                              <Button
                                type="button"
                                className="flex-1 h-11 rounded-xl bg-primary text-white"
                                disabled={!draftSalesAmount}
                                onClick={() => {
                                  setDraftRewardEvent("sales");
                                  form.setValue("rewardEvent", "sales", {
                                    shouldValidate: true,
                                  });
                                  form.setValue(
                                    "salesAmount",
                                    draftSalesAmount,
                                    { shouldValidate: true },
                                  );
                                  form.setValue("postCount", "", {
                                    shouldValidate: true,
                                  });
                                  form.setValue("postPeriod", "", {
                                    shouldValidate: true,
                                  });
                                  setRewardEventOpen(false);
                                }}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        )}
                        {draftRewardEvent === "posts" && (
                          <div
                            className="mt-2 rounded-xl border-2 border-primary p-3"
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <div className="flex gap-3">
                              <Input
                                type="number"
                                placeholder="eg: 4"
                                className="h-11 flex-1 rounded-xl border-2 border-primary/80 focus-visible:ring-0"
                                value={draftPostCount}
                                onChange={(e) =>
                                  setDraftPostCount(e.target.value)
                                }
                                inputMode="numeric"
                              />

                              <Select
                                value={draftPostPeriod}
                                onValueChange={(v) => setDraftPostPeriod(v)}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className="h-10 w-[180px] rounded-lg border-border text-foreground font-medium focus:ring-0"
                                    onPointerDown={(e) => e.stopPropagation()}
                                  >
                                    <SelectValue placeholder="Select duration" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent
                                  className="rounded-lg bg-popover border-border"
                                  onPointerDown={(e) => e.stopPropagation()}
                                >
                                  {POST_PERIOD_OPTIONS.map((opt) => (
                                    <SelectItem
                                      key={opt.value}
                                      value={opt.value}
                                      className="py-2.5"
                                    >
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="mt-3 flex gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-11 rounded-xl"
                                onClick={() => {
                                  setDraftRewardEvent(
                                    (values.rewardEvent as RewardEvent) ?? "",
                                  );
                                  setDraftSalesAmount(values.salesAmount ?? "");
                                  setDraftPostCount(values.postCount ?? "");
                                  setDraftPostPeriod(values.postPeriod ?? "");
                                  setRewardEventOpen(false);
                                }}
                              >
                                Cancel
                              </Button>

                              <Button
                                type="button"
                                className="flex-1 h-11 rounded-xl bg-primary text-white"
                                disabled={!draftPostCount || !draftPostPeriod}
                                onClick={() => {
                                  setDraftRewardEvent("posts");
                                  form.setValue("rewardEvent", "posts", {
                                    shouldValidate: true,
                                  });
                                  form.setValue("postCount", draftPostCount, {
                                    shouldValidate: true,
                                  });
                                  form.setValue("postPeriod", draftPostPeriod, {
                                    shouldValidate: true,
                                  });
                                  form.setValue("salesAmount", "", {
                                    shouldValidate: true,
                                  });
                                  setRewardEventOpen(false);
                                }}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        )}
                      </SelectContent>
                    </Select>

                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <FormField<FormSchema, "rewardType">
                control={control}
                name="rewardType"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-muted-foreground">
                      Reward with <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      open={rewardTypeOpen}
                      onOpenChange={(nextOpen) => {
                        setRewardTypeOpen(nextOpen);
                        if (nextOpen) {
                          setDraftRewardType(
                            (values.rewardType as RewardType) ?? "",
                          );
                          setDraftBonusAmount(values.bonusAmount ?? "");
                          setDraftCommissionTierLabel(
                            values.commissionTier ?? "",
                          );
                        }
                      }}
                      onValueChange={(v) => {
                        setDraftRewardType(v as RewardType);

                        if (v === "bonus") {
                          setTimeout(() => setRewardTypeOpen(true), 0);
                          return;
                        }

                        if (v === "points") {
                          setRewardTypeOpen(false);
                          setDraftCommissionTierLabel(
                            values.commissionTier ?? "",
                          );
                          dispatch(openCommissionTierModal());
                          return;
                        }

                        form.setValue("bonusAmount", "", {
                          shouldValidate: true,
                        });
                        form.setValue("commissionTier", "", {
                          shouldValidate: true,
                        });
                        field.onChange(v);
                        setRewardTypeOpen(false);
                      }}
                      value={draftRewardType || values.rewardType || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 border-border rounded-lg text-foreground font-medium focus:ring-primary">
                          <span
                            className={cn(
                              "line-clamp-1",
                              !values.rewardType && "text-muted-foreground",
                            )}
                          >
                            {values.rewardType === "bonus"
                              ? `Flat $${values.bonusAmount || "X"} bonus`
                              : values.rewardType === "points"
                                ? `Upgrade to {${values.commissionTier || "Tier Name Here"}}`
                                : values.rewardType
                                  ? "Discount"
                                  : "Select a reward"}
                          </span>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-lg p-1 bg-popover border-border">
                        <SelectItem value="bonus" className="py-3">
                          Flat $
                          {draftRewardType === "bonus" ||
                          values.rewardType === "bonus"
                            ? draftBonusAmount || values.bonusAmount || "X"
                            : "X"}{" "}
                          bonus
                        </SelectItem>
                        <SelectItem value="points" className="py-3">
                          <span className="block truncate pr-7">
                            Upgrade Commission Tier
                          </span>
                          <Pencil className="absolute right-7 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        </SelectItem>

                        {draftRewardType === "bonus" && (
                          <div
                            className="mt-2 rounded-xl border-2 border-primary p-3"
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground font-medium">
                                $
                              </span>
                              <Input
                                type="number"
                                placeholder="e.g. 100"
                                className="h-11 pl-8 border-0 focus-visible:ring-0"
                                value={draftBonusAmount}
                                onChange={(e) =>
                                  setDraftBonusAmount(e.target.value)
                                }
                                inputMode="numeric"
                              />
                            </div>

                            <div className="mt-3 flex gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-11 rounded-xl"
                                onClick={() => {
                                  setDraftRewardType(
                                    (values.rewardType as RewardType) ?? "",
                                  );
                                  setDraftBonusAmount(values.bonusAmount ?? "");
                                  setRewardTypeOpen(false);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                className="flex-1 h-11 rounded-xl bg-primary text-white"
                                disabled={!draftBonusAmount}
                                onClick={() => {
                                  setDraftRewardType("bonus");
                                  field.onChange("bonus");
                                  form.setValue(
                                    "bonusAmount",
                                    draftBonusAmount,
                                    { shouldValidate: true },
                                  );
                                  form.setValue("commissionTier", "", {
                                    shouldValidate: true,
                                  });
                                  setRewardTypeOpen(false);
                                }}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <Dialog
              open={isCommissionTierModalOpen}
              onOpenChange={(nextOpen) => {
                if (!nextOpen) dispatch(closeCommissionTierModal());
              }}
            >
              <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-popover">
                <DialogHeader className="p-6 pb-2 relative">
                  <DialogTitle className="text-[20px] font-semibold">
                    Select a commission tier
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 p-6 pt-2">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Upgrade to <span className="text-red-500">*</span>
                    </div>

                    <Select
                      value={draftCommissionTierValue}
                      onValueChange={(v) => {
                        setDraftCommissionTierValue(v);
                        const tier = COMMISSION_TIERS.find(
                          (t) => t.value === v,
                        );
                        setDraftCommissionTierLabel(tier?.label ?? "");
                      }}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-2 border-primary text-foreground font-medium focus:ring-0">
                        <SelectValue placeholder="Select a tier" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-popover border-border">
                        {COMMISSION_TIERS.map((tier) => (
                          <SelectItem
                            key={tier.value}
                            value={tier.value}
                            className="py-3"
                          >
                            {tier.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-4 pb-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-12 rounded-xl border-border text-foreground font-semibold shadow-sm hover:bg-muted"
                      onClick={() => {
                        dispatch(closeCommissionTierModal());
                        setRewardTypeOpen(true);
                      }}
                    >
                      Go Back
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-pink-100 transition-all active:scale-95 disabled:bg-primary/60 disabled:opacity-50"
                      disabled={!draftCommissionTierValue}
                      onClick={() => {
                        form.setValue("rewardType", "points", {
                          shouldValidate: true,
                        });
                        form.setValue(
                          "commissionTier",
                          draftCommissionTierLabel,
                          { shouldValidate: true },
                        );
                        form.setValue("bonusAmount", "", {
                          shouldValidate: true,
                        });
                        dispatch(closeCommissionTierModal());
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="space-y-4">
              <FormField<FormSchema, "isTimeBound">
                control={control}
                name="isTimeBound"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg p-0 space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel className="text-[15px] font-medium text-foreground">
                        Make the reward time bound
                      </FormLabel>
                      <p className="text-sm text-muted-foreground leading-snug">
                        Choose an end date to stop this reward automatically.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        size="sm"
                        checked={field.value as boolean}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary border-none bg-gray-300"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {values.isTimeBound && (
                <FormField<FormSchema, "endDate">
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
                      <Popover
                        open={endDateOpen}
                        onOpenChange={(nextOpen) => setEndDateOpen(nextOpen)}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "h-10 p-2.5 text-left font-normal rounded-lg border-border flex items-center justify-start gap-2 aria-expanded:bg-background aria-expanded:text-foreground hover:bg-primary hover:text-primary-foreground",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="h-4 w-4 opacity-50 shrink-0" />
                              {field.value instanceof Date ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select End Date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 rounded-xl overflow-hidden bg-popover"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value as Date | undefined}
                            onSelect={(date) => {
                              field.onChange(date);
                              if (date) setEndDateOpen(false);
                            }}
                            defaultMonth={tomorrow}
                            startMonth={tomorrow}
                            disabled={{ before: tomorrow }}
                            className="bg-popover "
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex gap-3 pt-4 pb-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  closeAndReset();
                }}
                className="flex-1 rounded-lg h-10 border-border text-foreground font-semibold text-base hover:bg-muted"
              >
                Cancel
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-1">
                      <Button
                        type="submit"
                        className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-lg shadow-pink-100 transition-all active:scale-95 disabled:bg-primary/60 disabled:opacity-50"
                        disabled={!canSubmit}
                      >
                        {submitting ? "Creating…" : "Create Reward"}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!canSubmit && !submitting && (
                    <TooltipContent className="max-w-[240px] bg-neutral-900 text-white border-none rounded-lg px-3 py-2 text-xs text-center">
                      {needsEndDateForTooltip
                        ? "Choose reward end date to continue"
                        : "Choose a reward trigger and a reward to continue"}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
