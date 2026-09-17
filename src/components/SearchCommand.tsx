import { useNavigate } from "react-router-dom";
import { openCommandBar } from "../lib/commandBus";
import IntentRotator from "./IntentRotator";

const quickIntents = [
  { label: "On the water", to: "/listings?intent=Waterfront" },
  { label: "Walkable & historic", to: "/listings?intent=Historic" },
  { label: "Golf & club", to: "/listings?intent=Golf" },
  { label: "New construction", to: "/listings?intent=New construction" },
  { label: "What's my home worth?", to: "/sell" },
];

/** The hero search is a launcher for the ⌘K command bar. */
export default function SearchCommand() {
  const navigate = useNavigate();
  return (
    <div>
      <button
        type="button"
        onClick={() => openCommandBar()}
        aria-label="Open search — a place, a price, or a life"
        className="input-glass group flex w-full items-center justify-between rounded-full py-3.5 pl-5 pr-3 text-left text-base"
      >
        <span className="flex items-baseline gap-1.5 text-mist-400">
          <span className="text-gold/90">⌕</span>
          Search&nbsp;
          <IntentRotator words={["a neighborhood", "a price", "a life"]} className="font-medium" />
        </span>
        <span className="hidden rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold tracking-widest text-mist-400 transition-colors group-hover:border-gold/40 group-hover:text-gold sm:block">
          ⌘ K
        </span>
      </button>
      <div className="mt-4 flex flex-wrap gap-2">
        {quickIntents.map((intent) => (
          <button
            key={intent.label}
            type="button"
            onClick={() => navigate(intent.to)}
            className="pill px-3.5 py-1.5 text-[13px] text-mist-200"
          >
            {intent.label}
          </button>
        ))}
      </div>
    </div>
  );
}
