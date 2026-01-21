import { useNavigate } from "react-router-dom";
import { Study } from "../../../types/study";
import { StudyCard } from "../../HomeExplore/components/StudyCard";
import { Button } from "../../../components/ui/Button";
import { SearchInput } from "../../../components/ui/SearchInput";
import { Pagination } from "../../../components/ui/Pagination";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Book } from "../../../components/icons/Book.icon";
import { Tabs, TabsList, Tab } from "../../../components/ui/Tabs";

interface MyStudiesContentProps {
  studies: Study[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: "all" | "public" | "private";
  onTabChange: (tab: "all" | "public" | "private") => void;
  filteredStudies: Study[];
  paginatedStudies: Study[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onDelete: (studyId: string) => void;
  onEdit: (studyId: string) => void;
}

export const MyStudiesContent = ({
  studies,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  filteredStudies,
  paginatedStudies,
  totalPages,
  currentPage,
  onPageChange,
  onDelete,
  onEdit,
}: MyStudiesContentProps) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-foreground font-minecraft mb-2 text-3xl font-bold">
          My Studies
        </h1>
        {studies.length > 0 && (
          <p className="text-muted-foreground text-sm">
            You have {studies.length}{" "}
            {studies.length === 1 ? "study" : "studies"}.
          </p>
        )}
      </div>

      {studies.length > 0 && (
        <Tabs
          value={activeTab}
          onTabChange={(tabId) =>
            onTabChange(tabId as "all" | "public" | "private")
          }
        >
          <TabsList>
            <Tab id="all">All Studies</Tab>
            <Tab id="public">Public</Tab>
            <Tab id="private">Private</Tab>
          </TabsList>
        </Tabs>
      )}

      {studies.length > 0 && (
        <div className="mb-6">
          <SearchInput
            placeholder="Search your studies..."
            value={searchQuery}
            onChange={onSearchChange}
            showClearButton
            debounceMs={50}
            className="max-w-md"
          />
        </div>
      )}

      {studies.length === 0 ? (
        <EmptyState
          variant="empty"
          icon={<Book className="text-muted-foreground h-12 w-12" />}
          title="No studies yet"
          description="Create your first study to get started!"
          action={
            <Button onClick={() => navigate("/create-study")}>
              Create Study
            </Button>
          }
        />
      ) : filteredStudies.length === 0 ? (
        <EmptyState
          variant="search"
          title="No results found"
          description={
            activeTab === "all"
              ? "No studies match your search. Try a different query."
              : activeTab === "public"
                ? "You don't have any public studies matching your search."
                : "You don't have any private studies matching your search."
          }
          action={
            <Button onClick={() => onSearchChange("")} variant="outline">
              Clear Search
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {paginatedStudies.map((study) => (
              <StudyCard
                key={study._id}
                study={study}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

