import { useState, useEffect, useMemo } from "react";
import { Study } from "../../../types/study";

const ITEMS_PER_PAGE = 12;

interface UseStudyFiltersParams {
  studies: Study[];
}

interface UseStudyFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: "all" | "public" | "private";
  setActiveTab: (tab: "all" | "public" | "private") => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filteredStudies: Study[];
  paginatedStudies: Study[];
  totalPages: number;
}

export const useStudyFilters = ({
  studies,
}: UseStudyFiltersParams): UseStudyFiltersReturn => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"all" | "public" | "private">(
    "all",
  );

  const filteredStudies = useMemo(() => {
    let result = studies;

    if (activeTab === "public") {
      result = result.filter((study) => study.isPublic === true);
    } else if (activeTab === "private") {
      result = result.filter((study) => study.isPublic === false);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (study) =>
          study.studyName.toLowerCase().includes(query) ||
          study.description.toLowerCase().includes(query) ||
          study.category.toLowerCase().includes(query),
      );
    }

    return result;
  }, [studies, activeTab, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudies.length / ITEMS_PER_PAGE),
  );

  const paginatedStudies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredStudies.slice(startIndex, endIndex);
  }, [filteredStudies, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  return {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    currentPage,
    setCurrentPage,
    filteredStudies,
    paginatedStudies,
    totalPages,
  };
};
