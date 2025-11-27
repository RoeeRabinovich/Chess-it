import { useState, ReactNode, createContext, useContext } from "react";
import { cn } from "../../lib/utils";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs component");
  }
  return context;
};

interface TabsProps {
  /** Default active tab ID */
  defaultTab?: string;
  /** Controlled active tab ID */
  value?: string;
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;
  /** Tab children */
  children: ReactNode;
  /** Custom className */
  className?: string;
}

export const Tabs = ({
  defaultTab,
  value,
  onTabChange,
  children,
  className,
}: TabsProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || "");
  const activeTab = value !== undefined ? value : internalActiveTab;

  const handleTabChange = (tabId: string) => {
    if (value === undefined) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export const TabsList = ({ children, className }: TabsListProps) => {
  return (
    <div
      className={cn(
        "border-border mb-6 flex w-full border-b",
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
};

interface TabProps {
  /** Unique tab ID */
  id: string;
  /** Tab label */
  children: ReactNode;
  /** Custom className */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export const Tab = ({ id, children, className, disabled }: TabProps) => {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === id;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${id}`}
      id={`tab-${id}`}
      onClick={() => !disabled && setActiveTab(id)}
      disabled={disabled}
      className={cn(
        "text-muted-foreground hover:text-foreground border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive &&
          "text-foreground border-primary",
        className
      )}
    >
      {children}
    </button>
  );
};

interface TabContentProps {
  /** Tab ID this content belongs to */
  id: string;
  /** Content to display */
  children: ReactNode;
  /** Custom className */
  className?: string;
}

export const TabContent = ({ id, children, className }: TabContentProps) => {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === id;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      className={cn("w-full", className)}
    >
      {children}
    </div>
  );
};

