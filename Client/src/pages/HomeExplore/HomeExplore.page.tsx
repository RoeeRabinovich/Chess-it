import { useState } from "react";
import { GameAspect, StudyFilters } from "../../types/study";
import { GameAspectFilter } from "./components/GameAspectFilter";
import { StudyFilter as StudyFilterComponent } from "./components/StudyFilter";
import { StudyCardsGrid } from "./components/StudyCardsGrid";
import { HomeExploreHeader } from "./components/HomeExploreHeader";

export const HomeExplore = () => {
  const [selectedAspect, setSelectedAspect] = useState<GameAspect>("All");
  const [selectedFilter, setSelectedFilter] = useState<StudyFilters>("All");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-background min-h-screen pt-16 sm:pt-20 md:pt-24">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Header with Search Bar */}
        <HomeExploreHeader gameAspect={selectedAspect} />

        {/* Mobile: Show Filters Button */}
        <div className="mb-6 lg:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-card border-border text-foreground hover:bg-accent font-minecraft flex w-full items-center justify-between rounded-lg border-2 px-4 py-3 shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))]"
          >
            <span>Show Filters</span>
            <span className="text-lg">{showFilters ? "−" : "+"}</span>
          </button>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Sidebar - Filters */}
          <aside
            className={`lg:block ${
              showFilters ? "block" : "hidden"
            } w-full flex-shrink-0 lg:w-64`}
          >
            <div className="space-y-6">
              <GameAspectFilter
                selectedAspect={selectedAspect}
                onAspectChange={setSelectedAspect}
              />
              <StudyFilterComponent
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
              />
            </div>
          </aside>

          {/* Main Content - Study Cards Grid */}
          <main className="flex-1">
            <StudyCardsGrid category={selectedAspect} filter={selectedFilter} />
          </main>
        </div>
      </div>
    </div>
  );
};
