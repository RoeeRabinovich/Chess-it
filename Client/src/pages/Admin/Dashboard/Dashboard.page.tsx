import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Users, BookOpen } from "lucide-react";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { userService } from "../../../services/userService";
import { adminStudyService } from "../../../services/adminStudyService";

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalStudies, setTotalStudies] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both stats in parallel
        const [usersResponse, studiesResponse] = await Promise.all([
          userService.getAllUsers({ page: 1, pageSize: 1 }),
          adminStudyService.getAllStudies({ page: 1, pageSize: 1 }),
        ]);

        setTotalUsers(usersResponse.totalUsers);
        setTotalStudies(studiesResponse.totalStudies);
      } catch (err) {
        const error = err as { message?: string };
        console.error("Error fetching dashboard stats:", err);
        setError(error?.message || "Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: loading ? "..." : totalUsers.toLocaleString(),
      icon: Users,
      description: "Registered users",
    },
    {
      title: "Total Studies",
      value: loading ? "..." : totalStudies.toLocaleString(),
      icon: BookOpen,
      description: "Public and private",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your Chess-it platform
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-4">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                {loading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <Icon className="text-muted-foreground h-4 w-4" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-muted-foreground text-xs">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Placeholder for future features */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Quick actions and recent activity will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
