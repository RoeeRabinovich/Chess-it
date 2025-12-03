import { adminStudyService } from "../../../../services/adminStudyService";
import { Study } from "../../../../types/study";
import { DeleteSelectedStudiesModal } from "./DeleteSelectedStudiesModal";
import { EditStudyMetadataModal } from "./EditStudyMetadataModal";

interface StudyModalsProps {
  // Bulk delete modal
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (open: boolean) => void;
  selectedNames: string[];
  isDeleting: boolean;
  onDeleteSelected: () => Promise<void>;
  // Single delete modal
  studyToDelete: Study | null;
  isSingleDeleteModalOpen: boolean;
  setIsSingleDeleteModalOpen: (open: boolean) => void;
  setStudyToDelete: (study: Study | null) => void;
  onSingleDelete: (study: Study) => Promise<void>;
  // Edit modal
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  selectedStudy: Study | null;
  setSelectedStudy: (study: Study | null) => void;
  fetchStudies: () => Promise<void>;
}

export const StudyModals = ({
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  selectedNames,
  isDeleting,
  onDeleteSelected,
  studyToDelete,
  isSingleDeleteModalOpen,
  setIsSingleDeleteModalOpen,
  setStudyToDelete,
  onSingleDelete,
  isEditModalOpen,
  setIsEditModalOpen,
  selectedStudy,
  setSelectedStudy,
  fetchStudies,
}: StudyModalsProps) => {
  return (
    <>
      {/* Bulk Delete Modal */}
      <DeleteSelectedStudiesModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        studyNames={selectedNames}
        isDeleting={isDeleting}
        onConfirm={onDeleteSelected}
      />

      {/* Single Study Delete Modal */}
      {studyToDelete && (
        <DeleteSelectedStudiesModal
          isOpen={isSingleDeleteModalOpen}
          onClose={() => {
            setIsSingleDeleteModalOpen(false);
            setStudyToDelete(null);
          }}
          studyNames={[studyToDelete.studyName]}
          isDeleting={isDeleting}
          onConfirm={() => onSingleDelete(studyToDelete)}
        />
      )}

      {/* Edit Metadata Modal */}
      <EditStudyMetadataModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStudy(null);
        }}
        study={selectedStudy}
        onSave={async (studyId, data) => {
          try {
            await adminStudyService.updateStudyMetadata(studyId, data);
            await fetchStudies();
          } catch (error) {
            const err = error as { message?: string };
            throw new Error(err?.message || "Failed to update study");
          }
        }}
      />
    </>
  );
};

