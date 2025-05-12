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

  return (
    <div>
      <div
        role="tablist"
        aria-label="Analysis results"
        className="flex gap-2 border-b mb-4"
      >
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            role="tab"
            aria-selected={active === idx}
            aria-controls={`tabpanel-${idx}`}
            id={`tab-${idx}`}
            tabIndex={active === idx ? 0 : -1}
            className={`px-4 py-2 font-medium border-b-2 transition-colors focus:outline-none ${
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
      {tabs.map((tab, idx) => (
        <div
          key={tab.label}
          role="tabpanel"
          id={`tabpanel-${idx}`}
          aria-labelledby={`tab-${idx}`}
          hidden={active !== idx}
          className="focus:outline-none"
        >
          {active === idx && tab.content}
        </div>
      ))}
    </div>
  );
};
