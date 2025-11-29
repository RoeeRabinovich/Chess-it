const steps = [
  {
    number: 1,
    title: "Create Your Account",
    description:
      "Sign up for free and join our growing community of chess enthusiasts. No credit card required.",
  },
  {
    number: 2,
    title: "Explore Studies",
    description:
      "Browse through thousands of chess studies created by the community. Filter by category, difficulty, or theme to find what interests you.",
  },
  {
    number: 3,
    title: "Create Your Own",
    description:
      "Build custom chess positions, add annotations, and create branches to explore variations. Share your insights with the community.",
  },
  {
    number: 4,
    title: "Train & Improve",
    description:
      "Solve puzzles, analyze positions, and learn from the best. Track your progress and watch your chess skills improve over time.",
  },
];

export const AboutHowItWorks = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-6 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            How It Works
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg">
            Get started in just a few simple steps
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-6">
              <div className="bg-pastel-mint flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-bold text-[#1A1A1A]">
                {step.number}
              </div>
              <div>
                <h3 className="text-foreground mb-2 text-xl font-semibold">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

