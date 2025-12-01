import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";

export const StatisticsCard = () => {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
        <CardDescription>Your activity and achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground py-8 text-center text-sm">
          Statistics coming soon...
        </div>
      </CardContent>
    </Card>
  );
};

