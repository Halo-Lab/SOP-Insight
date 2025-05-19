import * as React from "react";

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  initialIndex?: number;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, initialIndex = 0 }) => {
  const [active, setActive] = React.useState(initialIndex);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  React.useEffect(() => {
    if (active >= tabs.length && tabs.length > 0) {
      setActive(0);
    }
  }, [tabs, active]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = (idx + 1) % tabs.length;
      setActive(next);
      tabRefs.current[next]?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (idx - 1 + tabs.length) % tabs.length;
      setActive(prev);
      tabRefs.current[prev]?.focus();
    }
  };

  const activeTabContent = React.useMemo(() => {
    if (tabs.length === 0 || active >= tabs.length) {
      return null;
    }
    return tabs[active].content;
  }, [tabs, active]);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Analysis results"
        className="flex gap-2 border-b mb-4 overflow-x-auto"
      >
        {tabs.map((tab, idx) => (
          <button
            key={tab.label + "-" + idx}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            role="tab"
            aria-selected={active === idx}
            aria-controls={`tabpanel-${idx}`}
            id={`tab-${idx}`}
            tabIndex={active === idx ? 0 : -1}
            className={`px-4 py-2 font-medium border-b-2 transition-colors focus:outline-none cursor-pointer ${
              active === idx
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActive(idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`tabpanel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="focus:outline-none"
      >
        {activeTabContent}
      </div>
    </div>
  );
};
