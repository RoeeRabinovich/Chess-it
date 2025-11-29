import { Card, CardContent } from "../../../components/ui/Card";
import { Pawn } from "../../../components/icons/Pawn.icon";
import { Book } from "../../../components/icons/Book.icon";
import { Users, Crown } from "lucide-react";

const features = [
  {
    icon: Book,
    title: "Interactive Study Creation",
    description:
      "Build custom chess positions with detailed annotations. Create branches to explore variations and document your analysis with comments at critical moments.",
  },
  {
    icon: Pawn,
    title: "Tactical Training",
    description:
      "Solve puzzles tailored to your skill level. Choose from various themes like checkmate, sacrifice, and endgame patterns to sharpen your tactical vision.",
  },
  {
    icon: Users,
    title: "Community Sharing",
    description:
      "Share your studies with the community and discover insights from other players. Learn from historic games and master techniques through collaborative exploration.",
  },
  {
    icon: Crown,
    title: "Game Analysis",
    description:
      "Review historic games and master techniques. Analyze famous positions, study opening theory, and understand strategic concepts through interactive exploration.",
  },
  {
    icon: Book,
    title: "Branching Variations",
    description:
      "Explore different lines and possibilities. Create nested branches to analyze complex positions and document alternative continuations.",
  },
  {
    icon: Users,
    title: "Personalized Learning",
    description:
      "Track your progress, save your favorite studies, and build your personal chess library. Organize your learning journey with custom categories and tags.",
  },
];

export const AboutFeatures = () => {
  return (
    <section className="bg-secondary py-16 md:py-24">
      <div className="container mx-auto max-w-6xl px-6 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            What We Offer
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg">
            Everything you need to take your chess game to the next level
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="bg-pastel-mint mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg">
                    <Icon className="h-6 w-6 text-[#1A1A1A]" />
                  </div>
                  <h3 className="text-foreground mb-2 text-xl font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

