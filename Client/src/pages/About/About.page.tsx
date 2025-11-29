import { AboutHero } from "./sections/AboutHero";
import { AboutMission } from "./sections/AboutMission";
import { AboutFeatures } from "./sections/AboutFeatures";
import { AboutHowItWorks } from "./sections/AboutHowItWorks";
import { AboutValues } from "./sections/AboutValues";
import { AboutCommunity } from "./sections/AboutCommunity";
import { AboutCTA } from "./sections/AboutCTA";

const About = () => {
  return (
    <div className="bg-background min-h-screen">
      <AboutHero />
      <AboutMission />
      <AboutFeatures />
      <AboutHowItWorks />
      <AboutValues />
      <AboutCommunity />
      <AboutCTA />
    </div>
  );
};

export default About;
