import { useNavigate } from "react-router-dom";
import { Crown } from "../icons/Crown.icon";
import { Linkedin } from "../icons/Linkedin.icon";
import { Facebook } from "../icons/Facebook.icon";
import { GitHub } from "../icons/Github.icon";
import { useAuth } from "../../hooks/useAuth";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const { user } = useAuth();

  const footerLinks = user
    ? [
        { name: "About", path: "/about" },
        { name: "Home", path: "/home" },
        { name: "Puzzles", path: "/puzzles" },
        { name: "Create Study", path: "/create-study" },
        { name: "My Studies", path: "/my-studies" },
        { name: "Profile", path: "/profile" },
        { name: "Contact", path: "/contact" },
        { name: "Privacy Policy", path: "/privacy" },
      ]
    : [
        { name: "About", path: "/about" },
        { name: "Home", path: "/home" },
        { name: "Puzzles", path: "/puzzles" },
        { name: "Contact", path: "/contact" },
        { name: "Privacy Policy", path: "/privacy" },
      ];

  return (
    <footer className="border-border from-background to-muted/20 border-t bg-gradient-to-b">
      <div className="container mx-auto max-w-7xl px-6 py-12 md:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Crown className="border-border bg-pastel-mint h-10 w-10 rounded-full" />
            <span className="bg-clip-text text-xl font-bold">Chess-It</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm md:gap-8">
            {footerLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className="text-muted-foreground hover:text-primary font-medium transition-colors"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="border-border bg-pastel-mint hover:bg-pastel-mint/80 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
              aria-label="GitHub"
            >
              <GitHub className="h-5 w-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="border-border bg-pastel-mint hover:bg-pastel-mint/80 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="border-border bg-pastel-mint hover:bg-pastel-mint/80 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-border/50 mt-8 border-t pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Chess-It. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
