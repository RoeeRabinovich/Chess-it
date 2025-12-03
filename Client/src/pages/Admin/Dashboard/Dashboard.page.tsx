import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Users, BookOpen, TrendingUp } from "lucide-react";

export const AdminDashboard = () => {
  // TODO: Fetch real stats from API
  const stats = [
    {
      title: "Total Users",
      value: "0",
      icon: Users,
      description: "Registered users",
    },
    {
      title: "Total Studies",
      value: "0",
      icon: BookOpen,
      description: "Public and private",
    },
    {
      title: "Active Today",
      value: "0",
      icon: TrendingUp,
      description: "Users active in last 24h",
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

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="text-muted-foreground h-4 w-4" />
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
