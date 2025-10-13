import {
  Globe,
  MessageSquareMore,
  BrainCircuit,
  User2,
  LayoutDashboard,
} from "lucide-react";
import FeatureCard from "../../components/ui/FeatureCard";
import { TFeatureItem } from "../../types/TFeatureItem";
import { Pawn } from "../../components/icons/Pawn.pixel";
import { motion } from "framer-motion";

const features: TFeatureItem[] = [
  {
    icon: <Pawn aria-hidden />,
    title: "Interactive Chessboard Editor",
    description:
      "Create and analyze chess studies with move-by-move notes and rich annotations.",
  },
  {
    icon: <Globe className="text-foreground h-7 w-7" aria-hidden />,
    title: "Public & Private Studies",
    description:
      "Choose to keep your work private or share it publicly (with admin approval).",
  },
  {
    icon: <MessageSquareMore className="text-foreground h-7 w-7" aria-hidden />,
    title: "Comments & Favorites",
    description:
      "Engage with other users by commenting on and favoriting their studies.",
  },
  {
    icon: <BrainCircuit className="text-foreground h-7 w-7" aria-hidden />,
    title: "Built-in Chess Engine",
    description:
      "Analyze moves and positions in real time with engine support.",
  },
  {
    icon: <User2 className="text-foreground h-7 w-7" aria-hidden />,
    title: "User Profiles",
    description:
      "Track your studies, favorites, and stats in a single, clean dashboard.",
  },
  {
    icon: <LayoutDashboard className="text-foreground h-7 w-7" aria-hidden />,
    title: "Admin Dashboard",
    description:
      "Manage public content and user submissions efficiently and securely.",
  },
];
//Features section ("Everything you need from chess study" cards)
const Features = () => {
  return (
    <section className="bg-green-50">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-foreground mb-3 font-serif text-3xl font-bold md:text-4xl">
            Everything You Need for Chess Study
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Comprehensive resources and tools for studying chess
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
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
