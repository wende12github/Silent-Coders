import { useState } from "react";

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
}

const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  items,
  className,
  tabsListClassName,
  tabsContentClassName,
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div className={`w-full ${className || ""}`}>
      <div
        className={`flex rounded-lg bg-gray-100 p-1 ${tabsListClassName || ""}`}
      >
        {items.map((item) => (
          <button
            key={item.value}
            className={`
                  flex-1 py-2 px-4 text-center text-sm font-medium rounded-md transition-all cursor-pointer
                  ${
                    activeTab === item.value
                      ? "bg-white text-blue-600 shadow" // Active tab styles
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200" // Inactive tab styles
                  }
                `}
            onClick={() => setActiveTab(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={`py-6 ${tabsContentClassName || ""}`}>
        {items.map(
          (item) =>
            activeTab === item.value && (
              <div key={item.value}>{item.content}</div>
            )
        )}
      </div>
    </div>
  );
};
export default Tabs;
