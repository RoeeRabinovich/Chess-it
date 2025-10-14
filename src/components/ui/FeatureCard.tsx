import { Card } from "flowbite-react";
import { TFeatureItem } from "../../types/TFeatureItem";

const FeatureCard = ({ icon, title, description }: TFeatureItem) => {
  return (
    <Card
      className="bg-background/60 border-border group flex h-full flex-col items-center text-center transition-transform duration-200 hover:scale-[1.02] hover:shadow-md"
      theme={{ root: { base: "flex rounded-sm border p-6" } }}
    >
      <div className="bg-muted/60 mb-4 inline-flex items-center justify-center rounded-sm p-3">
        {icon}
      </div>
      <h3 className="text-foreground mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </Card>
  );
};

export default FeatureCard;
