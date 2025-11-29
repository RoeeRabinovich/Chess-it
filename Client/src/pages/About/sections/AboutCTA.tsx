import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { RightArrow } from "../../../components/icons/RightArrow.icon";

export const AboutCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-secondary border-border border-t py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-6 text-center md:px-8">
        <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
          Ready to Get Started?
        </h2>
        <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-base md:text-lg">
          Join thousands of chess players who are already improving their game
          with Chess-It
        </p>
        <Button
          size="lg"
          className="group bg-pastel-mint text-foreground hover:bg-pastel-mint/80 dark:!text-[#1A1A1A]"
          onClick={() => navigate("/register")}
        >
          Join Chess-It Today!
          <RightArrow className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </section>
  );
};

