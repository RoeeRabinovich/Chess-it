export const AboutCommunity = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-6 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            Join Our Growing Community
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg">
            Be part of a community that's passionate about chess
          </p>
        </div>

        <div className="border-border grid grid-cols-3 gap-8 border-t pt-12">
          <div className="text-center">
            <div className="text-foreground mb-2 text-4xl font-bold md:text-5xl">
              50K+
            </div>
            <div className="text-muted-foreground text-sm md:text-base">
              Members
            </div>
          </div>
          <div className="text-center">
            <div className="text-foreground mb-2 text-4xl font-bold md:text-5xl">
              5K+
            </div>
            <div className="text-muted-foreground text-sm md:text-base">
              Studies
            </div>
          </div>
          <div className="text-center">
            <div className="text-foreground mb-2 text-4xl font-bold md:text-5xl">
              10K+
            </div>
            <div className="text-muted-foreground text-sm md:text-base">
              Puzzles
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

