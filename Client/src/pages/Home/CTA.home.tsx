import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router";
//Cta section
const CTA = () => {
  const navigate = useNavigate();
  return (
    <section className="bg-secondary p-10">
      <div className="mx-auto max-w-4xl rounded-sm border-2 p-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-muted-foreground mb-3 inline-block text-sm tracking-wider uppercase">
            Get started
          </span>
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            Ready to dive into
            <span className="text-pastel-mint"> Chess-It?</span>
          </h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-base md:text-lg">
            Create custom positions, annotate critical moments, and share your
            ideas with the community.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="group bg-pastel-mint text-foreground hover:bg-pastel-mint/80"
              onClick={() => {
                navigate("/register");
              }}
            >
              Join Chess-It Today!
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
