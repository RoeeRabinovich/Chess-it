import { DataTableColumn } from "../../../../components/DataTable";
import { Badge } from "../../../../components/ui/Badge";
import { Button } from "../../../../components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/Dropdown-menu";
import { MoreVertical, Edit, Trash } from "lucide-react";
import { Study } from "../../../../types/study";

interface StudyColumnsProps {
  onEdit: (study: Study) => void;
  onDelete: (study: Study) => void;
}

export const getStudyColumns = ({
  onEdit,
  onDelete,
}: StudyColumnsProps): DataTableColumn<Study>[] => {
  return [
    {
      header: "Study Name",
      accessor: "studyName",
      sortable: true,
    },
    {
      header: "Category",
      accessor: "category",
      sortable: true,
      render: (value) => <Badge variant="secondary">{String(value)}</Badge>,
    },
    {
      header: "Creator",
      accessor: "createdBy",
      visible: (breakpoint) => breakpoint !== "mobile",
      render: (value) => {
        const creator = value as { username: string } | null;
        return creator ? (
          <span className="font-medium">{creator.username}</span>
        ) : (
          <span className="text-muted-foreground">Unknown</span>
        );
      },
    },
    {
      header: "Visibility",
      accessor: "isPublic",
      render: (value) => {
        const isPublic = value === true;
        return (
          <Badge variant={isPublic ? "default" : "secondary"}>
            {isPublic ? "Public" : "Private"}
          </Badge>
        );
      },
    },
    {
      header: "Likes",
      accessor: "likes",
      sortable: true,
      render: (value) => <span className="font-semibold">{String(value)}</span>,
    },
    {
      header: "Created Date",
      accessor: "createdAt",
      sortable: true,
      visible: (breakpoint) => breakpoint !== "mobile",
      render: (value) => {
        const date = new Date(String(value));
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      header: "Actions",
      accessor: "_id",
      cellClassName: "text-center",
      render: (_value, row) => {
        const study = row as Study;
        return (
          <div className="flex items-center justify-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
                className="bg-secondary"
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(study);
                  }}
                  className="hover:bg-accent cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(study);
                  }}
                  className="text-destructive focus:text-destructive hover:bg-pastel-red/20 focus:bg-destructive/10 cursor-pointer"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
};
