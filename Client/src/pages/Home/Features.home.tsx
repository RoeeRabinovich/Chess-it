import FeatureCard from "../../components/ui/FeatureCard";
import { FeatureItem } from "../../types/featureItem";
import { motion } from "framer-motion";
import { Chessboard } from "../../components/icons/ChessBoard.icon.";
import { Book } from "../../components/icons/Book.icon";
import { Computer } from "../../components/icons/Computer.icon";
import { Comment } from "../../components/icons/Comment.icon";
import { PixelUser } from "../../components/icons/PixelUser.icon";
import { Knight } from "../../components/icons/Knight.icon";

const features: FeatureItem[] = [
  {
    icon: <Chessboard className="text-foreground h-10 w-10" aria-hidden />,
    title: "Interactive Chessboard Editor",
    description:
      "Create and analyze chess studies with move-by-move notes and rich annotations.",
  },
  {
    icon: <Book className="text-foreground h-10 w-10" aria-hidden />,
    title: "Public & Private Studies",
    description:
      "Choose to keep your work private or share it publicly (with admin approval).",
  },
  {
    icon: <Comment className="text-foreground h-10 w-10" aria-hidden />,
    title: "Comments & Favorites",
    description:
      "Engage with other users by commenting on and favoriting their studies.",
  },
  {
    icon: <Computer className="text-foreground h-10 w-10" aria-hidden />,
    title: "Built-in Chess Engine",
    description:
      "Analyze moves and positions in real time with engine support.",
  },
  {
    icon: <PixelUser className="text-foreground h-10 w-10" aria-hidden />,
    title: "User Stats",
    description:
      "Track your studies, favorites, and stats in a single, clean dashboard.",
  },
  {
    icon: <Knight className="text-foreground h-10 w-10" aria-hidden />,
    title: "Chess Puzzles",
    description:
      "Sharpen your tactics with daily puzzles and themed challenges.",
  },
];
//Features section ("Everything you need from chess study" cards)
const Features = () => {
  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-foreground mb-3 text-center text-3xl font-bold md:text-4xl">
            Everything You Need for Chess Study!
          </h2>
          <p className="text-muted-foreground text-center md:text-lg">
            Comprehensive resources and tools for studying chess
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 20 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
