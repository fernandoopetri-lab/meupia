import { motion } from "framer-motion";
import { LogIn, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Logo from "@/components/Logo";

const MotionHeader = motion.header;

const navItems = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Portal", href: "#portal" },
  { label: "FAQ", href: "#faq" },
];

function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.56 2 2.12 6.43 2.12 11.9c0 1.75.46 3.46 1.33 4.97L2 22l5.27-1.38a9.86 9.86 0 0 0 4.74 1.21h.01c5.47 0 9.9-4.44 9.9-9.91 0-2.64-1.03-5.12-2.87-6.99Zm-7.02 15.24h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.13.82.84-3.05-.2-.31a8.16 8.16 0 0 1-1.26-4.39c0-4.53 3.69-8.22 8.23-8.22 2.2 0 4.27.85 5.82 2.41a8.16 8.16 0 0 1 2.39 5.82c0 4.54-3.69 8.24-8.2 8.24Zm4.5-6.15c-.25-.12-1.47-.73-1.7-.81-.23-.08-.4-.12-.57.12-.17.25-.65.81-.8.97-.15.17-.29.19-.54.07-.25-.12-1.04-.38-1.99-1.21-.74-.66-1.24-1.46-1.39-1.71-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.57-1.38-.78-1.89-.21-.5-.42-.43-.57-.44h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.04 0 1.2.88 2.36 1 2.52.12.17 1.71 2.62 4.15 3.67.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29Z" />
    </svg>
  );
}

export function Header({ onAuthClick }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <MotionHeader
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mt-4 flex items-center justify-between rounded-3xl border border-border/60 bg-card/75 px-4 py-3 shadow-[0_18px_50px_-22px_rgba(15,23,42,0.45)] backdrop-blur-2xl supports-[backdrop-filter]:bg-card/65 sm:px-6">
          {/* Logo */}
          <a href="/pessoal" className="flex items-center gap-3">
            <Logo size="md" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 rounded-full border border-border/60 bg-muted/55 p-1.5 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-background hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={onAuthClick}
              className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-border/70 hover:bg-background/70 hover:text-foreground"
            >
              <LogIn className="h-4 w-4" />
              Painel
            </button>
            <Button
              size="sm"
              onClick={() => navigate("/onboarding")}
              className="h-10 rounded-full bg-primary px-5 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              <WhatsAppIcon />
              Começar
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="rounded-2xl border border-border/60 bg-background/80 p-2.5 text-foreground shadow-sm transition-colors hover:bg-background md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 rounded-3xl border border-border/60 bg-card/95 p-6 shadow-[0_20px_45px_-24px_rgba(15,23,42,0.5)] backdrop-blur-2xl md:hidden"
          >
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <hr className="border-border/50" />
              <a
                href="#"
                className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  onAuthClick?.();
                }}
              >
                <LogIn className="h-4 w-4" />
                Painel
              </a>
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/onboarding");
                }}
                className="h-11 w-full rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
              >
                <WhatsAppIcon />
                Começar no WhatsApp
              </Button>
            </nav>
          </motion.div>
        )}
      </div>
    </MotionHeader>
  );
}
