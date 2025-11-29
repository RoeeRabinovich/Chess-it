import { Crown } from "../../../components/icons/Crown.icon";

export const AboutHero = () => {
  return (
    <section className="border-border bg-secondary border-b py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-6 text-center md:px-8">
        <div className="mb-6 flex justify-center">
          <Crown className="bg-pastel-mint h-16 w-16 rounded-full p-3" />
        </div>
        <h1 className="text-foreground mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
          About Chess-It
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg md:text-xl">
          Empowering chess players to study, learn, and grow together through
          interactive tools and a vibrant community.
        </p>
      </div>
    </section>
  );
};

