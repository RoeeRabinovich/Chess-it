import { Crown } from "../icons/Crown.icon";
import { Linkedin } from "../icons/Linkedin.icon";
import { Facebook } from "../icons/Facebook.icon";
import { GitHub } from "../icons/Github.icon";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border from-background to-muted/20 border-t bg-gradient-to-b">
      <div className="container mx-auto max-w-7xl px-6 py-12 md:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Crown className="h-10 w-10" />
            <span className="bg-clip-text text-xl font-bold">Chess-It</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap gap-8 text-sm">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary font-medium transition-colors"
            >
              About
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary font-medium transition-colors"
            >
              Features
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary font-medium transition-colors"
            >
              Community
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary font-medium transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <GitHub className="h-7 w-7" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-7 w-7" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-7 w-7" />
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
