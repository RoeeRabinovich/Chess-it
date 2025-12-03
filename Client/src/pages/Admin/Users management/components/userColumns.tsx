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
import { User } from "../../../../types/user";

interface UserColumnsProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const getUserColumns = ({
  onEdit,
  onDelete,
}: UserColumnsProps): DataTableColumn<User>[] => {
  return [
    {
      header: "Username",
      accessor: "username",
      sortable: true,
    },
    {
      header: "Email",
      accessor: "email",
      sortable: true,
      visible: (breakpoint) => breakpoint !== "mobile",
    },
    {
      header: "Role",
      accessor: "role",
      render: (value, row) => {
        const user = row as User;
        const isAdmin = value === "admin" || user.isAdmin === true;
        return (
          <Badge variant={isAdmin ? "default" : "secondary"}>
            {isAdmin ? "ADMIN" : "USER"}
          </Badge>
        );
      },
    },
    {
      header: "Puzzle Rating",
      accessor: "puzzleRating",
      sortable: true,
      render: (value) => <span className="font-semibold">{String(value)}</span>,
    },
    {
      header: "Studies Created",
      accessor: "studiesCreated",
      sortable: true,
      visible: (breakpoint) => breakpoint !== "mobile",
      render: (value) => <span className="font-medium">{String(value)}</span>,
    },
    {
      header: "Join Date",
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
        const user = row as User;
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
                    onEdit(user);
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
                    onDelete(user);
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
