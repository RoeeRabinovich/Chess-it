const values = [
  {
    title: "Accessibility",
    description:
      "Chess-It is free and open to players of all skill levels. We believe that chess education should be accessible to everyone, regardless of their background or experience.",
  },
  {
    title: "Community",
    description:
      "We're building a vibrant community where players can learn from each other, share knowledge, and grow together. Your insights help others, and theirs help you.",
  },
  {
    title: "Quality",
    description:
      "We're committed to providing high-quality, educational content that helps players improve. Every study is an opportunity to learn something new.",
  },
  {
    title: "Innovation",
    description:
      "We're constantly improving our platform with modern tools and features that make chess study more engaging and effective.",
  },
];

export const AboutValues = () => {
  return (
    <section className="bg-secondary py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-6 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            Our Values
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {values.map((value, index) => (
            <div key={index}>
              <h3 className="text-foreground mb-3 text-xl font-semibold">
                {value.title}
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

