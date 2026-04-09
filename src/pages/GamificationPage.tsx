import CreateRewardModal from "@/components/CreateRewardModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openModal, closeModal } from "@/store/slices/gamificationSlice";

const featureCards = [
  {
    icon: "/Gift.svg",
    title: "Reward Your Ambassadors",
    description:
      "Boost campaign performance by setting up rewards for ambassadors",
  },
  {
    icon: "/Crown.svg",
    title: "Set Milestones",
    description:
      "Set up custom goals for sales, posts, or time-based achievements",
  },
  {
    icon: "/Vector.svg",
    title: "Customise Incentives",
    description:
      "Create custom incentives like flat fees, free products, or special commissions.",
  },
];

export default function GamificationPage() {
  const dispatch = useAppDispatch();
  const isModalOpen = useAppSelector((s) => s.gamification.isModalOpen);

  return (
    <div className="flex-1 p-8 overflow-auto bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Hero card */}
        <div
          className="relative rounded-2xl p-16 mb-6 flex flex-col items-center justify-center text-center border border-purple-100"
          style={{
            backgroundImage: "url('/bg-image.svg')",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            minHeight: "280px",
          }}
        >
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-3 text-foreground">
              Gamify your Campaign
            </h2>
            <p className="text-sm max-w-xs mx-auto mb-6 leading-relaxed text-muted-foreground">
              Enable gamification to start crafting your custom reward system.
            </p>
            <button
              onClick={() => dispatch(openModal())}
              className="bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 cursor-pointer"
            >
              Enable Gamification
            </button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featureCards.map((card) => (
            <div
              key={card.title}
              className="bg-card rounded-xl p-6 flex flex-col relative items-center text-center transition-shadow duration-200 hover:shadow-md border border-border bg-[url('/cards-layer.svg')] bg-no-repeat bg-center"
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-accent/50 border border-primary/10 ring-8 ring-primary/20 z-50">
                <img
                  src={card.icon}
                  alt=""
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-sm font-semibold mb-2 text-card-foreground">
                {card.title}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <CreateRewardModal
        open={isModalOpen}
        onOpenChange={(nextOpen) => {
          if (nextOpen) dispatch(openModal());
          else dispatch(closeModal());
        }}
      />
    </div>
  );
}
