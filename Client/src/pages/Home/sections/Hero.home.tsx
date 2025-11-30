import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Pawn } from "../../../components/icons/Pawn.icon";
import { RightArrow } from "../../../components/icons/RightArrow.icon";
import heroImage from "../../../assets/images/pixel-hero-image (1).png";
import { useNavigate } from "react-router";

//Hero section
const Hero = () => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <section className="relative flex min-h-screen items-center justify-center pt-20">
      <div className="relative z-10 container mx-auto max-w-7xl px-6 py-24 md:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <div className="animate-fade-in">
            <div className="mb-8 inline-block">
              <span className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                chess study platform
              </span>
            </div>

            <h1 className="text-foreground mb-6 text-5xl leading-[1.1] font-bold tracking-wide md:text-6xl lg:text-7xl">
              Study, Train <span className="mt-2 block">& Connect</span>
            </h1>

            <p className="text-muted-foreground mb-12 max-w-lg text-lg leading-relaxed">
              Explore openings, study historic games, train with interactive
              tactics, and connect with chess enthusiasts worldwide.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="group bg-pastel-mint text-foreground hover:bg-pastel-mint/80 dark:!text-[#1A1A1A]"
                onClick={() => navigate("/register")}
              >
                Get Started
                <RightArrow className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline">
                Puzzles <Pawn className="h-4 w-4" />
              </Button>
            </div>

            <div className="border-border mt-16 flex items-center gap-12 border-t pt-12">
              <div>
                <div className="text-foreground mb-1 text-4xl font-bold">
                  50K+
                </div>
                <div className="text-muted-foreground text-sm">Members</div>
              </div>
              <div>
                <div className="text-foreground mb-1 text-4xl font-bold">
                  5K+
                </div>
                <div className="text-muted-foreground text-sm">Games</div>
              </div>
              <div>
                <div className="text-foreground mb-1 text-4xl font-bold">
                  5M+
                </div>
                <div className="text-muted-foreground text-sm">Puzzles</div>
              </div>
            </div>
          </div>

          <div className="animate-scale-in relative">
            <div className="relative h-[400px] overflow-hidden lg:h-[600px]">
              {!imageLoaded && (
                <div className="bg-muted absolute inset-0 animate-pulse" />
              )}
              <img
                src={heroImage}
                alt="pixel art of a Chess king and queen"
                className={`h-full w-full object-cover transition-opacity duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Hero;
