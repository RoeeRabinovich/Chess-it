import { useEffect, useState } from "react";
import { useQuery, useMutation , useQueryClient } from "@tanstack/react-query";
import { Study } from "../../types/study";
import { studyService } from "../../services/studyService";
import { ApiError } from "../../types/auth";
import { useToast } from "../../hooks/useToast";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { EditStudyModal } from "./components/EditStudyModal";
import { DeleteStudyModal } from "./components/DeleteStudyModal";
import { MyStudiesContent } from "./components/MyStudiesContent";
import { useStudyFilters } from "./hooks/useStudyFilters";

export const MyStudies = () => {
 
  const { data: studies=[],isPending, error, refetch } = useQuery<Study[], ApiError>({
    queryKey: ["myStudies"],
    queryFn: () => studyService.getUserStudies(),
  });
const  queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studyToDelete, setStudyToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [studyToEdit, setStudyToEdit] = useState<Study | null>(null);
  const { toast } = useToast();
  
 const deleteStudyMutation = useMutation({
  mutationFn: (studyId:string) => studyService.deleteStudy(studyId),
  onSuccess: (_res,deletedId) => {
    queryClient.setQueryData<Study[]>(["myStudies"],(oldData)=>(oldData ?? [] as Study[]).filter((s)=>s._id !==deletedId),
  );
  setShowDeleteModal(false);
  setStudyToDelete(null);
  toast({
    title: "Success",
    description: "Study deleted successfully.",
  });
 },
 onError: (error) => {
  const apiError = error as unknown as ApiError;
  toast({
    title: "Error",
    description: apiError?.message || "Failed to delete study. Please try again.",
    variant: "destructive",
  });
 }
})
  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    currentPage,
    setCurrentPage,
    filteredStudies,
    paginatedStudies,
    totalPages,
  } = useStudyFilters({ studies });

  useEffect(() => {
    if (!error) return;
    const apiError = error as unknown as ApiError;
    toast({
      title: "Error",
      description:
        apiError?.message || "Failed to load your studies. Please try again.",
      variant: "destructive",
    });
  }, [error, toast]);

  const errorMessage =
 error?.message || "Failed to load your studies. Please try again.";


  const handleDelete = (studyId: string) => {
    // Find the study to get its name for confirmation
    const study = studies.find((s) => s._id === studyId);
    const studyName = study?.studyName || "this study";

    // Set the study to delete and show modal
    setStudyToDelete({ id: studyId, name: studyName });
    setShowDeleteModal(true);
  };

  const handleEdit = (studyId: string) => {
    // Find the study to edit
    const study = studies.find((s) => s._id === studyId);
    if (study) {
      setStudyToEdit(study);
      setShowEditModal(true);
    }
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setStudyToEdit(null);
  };

  const handleEditUpdate = () => {
    // Refresh the studies list after update
    refetch();
  };

  const confirmDelete =() =>{
    if(!studyToDelete) return;
    deleteStudyMutation.mutate(studyToDelete.id);
  }

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudyToDelete(null);
  };

  if (isPending) {
    return (
      <div className="bg-background min-h-screen pt-16 sm:pt-20 md:pt-24">
        <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="flex min-h-[400px] items-center justify-center">
            <LoadingSpinner size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background min-h-screen pt-16 sm:pt-20 md:pt-24">
        <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6">
          <EmptyState
            variant="error"
            title="Error loading studies"
            description={errorMessage}
            action={
              <Button onClick={()=> refetch()} variant="outline">
                Try Again
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-16 sm:pt-20 md:pt-24">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6">
        <MyStudiesContent
          studies={studies}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          filteredStudies={filteredStudies}
          paginatedStudies={paginatedStudies}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>

      <DeleteStudyModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        studyName={studyToDelete?.name || ""}
        isDeleting={deleteStudyMutation.isPending}
        onConfirm={confirmDelete}
      />

      {studyToEdit && (
        <EditStudyModal
          isOpen={showEditModal}
          onClose={handleEditClose}
          study={studyToEdit}
          onUpdate={handleEditUpdate}
        />
      )}
    </div>
  );
};
