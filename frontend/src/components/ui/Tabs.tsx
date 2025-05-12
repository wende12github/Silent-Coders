import { useState } from "react";
import React from "react";

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  defaultValue: string;
  items: TabItem[];
  className?: string;
  tabsListClassName?: string;
  tabsContentClassName?: string;
  onTabChange?: (value: string) => void;
}

const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  items,
  className,
  tabsListClassName,
  tabsContentClassName,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onTabChange?.(value);
  };

  return (
    <div className={`w-full ${className || ""}`}>
      <div
        className={`flex rounded-md bg-muted p-1 dark:bg-muted-dark ${
          tabsListClassName || ""
        }`}
      >
        {items.map((item) => (
          <button
            key={item.value}
            className={`
                    flex-1 py-2 px-4 text-center text-sm font-medium rounded-sm transition-all cursor-pointer
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:focus-visible:ring-ring-dark dark:focus-visible:ring-offset-background-dark
                    ${
                      activeTab === item.value
                        ? "bg-background text-foreground shadow dark:bg-background-dark dark:text-foreground-dark"
                        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground dark:text-muted-foreground-dark dark:hover:bg-secondary-dark dark:hover:text-secondary-foreground-dark"
                    }
                  `}
            onClick={() => handleTabChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={`py-6 ${tabsContentClassName || ""}`}>
        {items.map(
          (item) =>
            activeTab === item.value && (
              <React.Fragment key={item.value}>{item.content}</React.Fragment>
            )
        )}
      </div>
    </div>
  );
};

export default Tabs;
