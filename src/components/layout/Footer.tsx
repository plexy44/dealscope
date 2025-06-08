
import Link from 'next/link';
import Logo from '@/components/ui/Logo'; 
import { Github, Twitter, Youtube, FileText, ShieldCheck } from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';

const Footer = () => {
  return (
    <footer className="border-t border-border/40 mt-auto bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          <div className="flex items-center justify-center md:justify-start"> {/* Added items-center */}
            <Logo className="text-2xl" /> {/* Use Logo component with smaller size */}
          </div>
          
          <div className="text-center md:text-left space-y-2">
            <div className="flex flex-row justify-center md:justify-start space-x-3">
              <Link href="/terms-and-conditions" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center">
                <FileText className="h-3.5 w-3.5 mr-1" /> Terms & Conditions
              </Link>
              <Link href="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Privacy Policy
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end space-x-5 items-center">
            <ThemeToggle /> 
            <Link href="https://github.com/your-profile/dealscope" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
              <Github className="h-5 w-5" />
            </Link>
            <Link href="https://twitter.com/your-profile" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="https://youtube.com/your-channel" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="YouTube">
              <Youtube className="h-5 w-5" />
            </Link>
            <Link 
              href="https://dealscope-pitch.wstd.io/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:opacity-75 transition-opacity" 
              aria-label="Pitch Deck"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="shimmeringRainbowFooterIcon" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(0, 100%, 50%)" />   {/* Red */}
                    <stop offset="16%" stopColor="hsl(30, 100%, 50%)" />  {/* Orange */}
                    <stop offset="33%" stopColor="hsl(60, 100%, 50%)" />  {/* Yellow */}
                    <stop offset="50%" stopColor="hsl(120, 100%, 50%)" /> {/* Green */}
                    <stop offset="67%" stopColor="hsl(240, 100%, 50%)" /> {/* Blue */}
                    <stop offset="84%" stopColor="hsl(270, 100%, 50%)" /> {/* Indigo */}
                    <stop offset="100%" stopColor="hsl(300, 100%, 50%)" />{/* Violet */}
                    <animateTransform
                      attributeName="gradientTransform"
                      type="rotate"
                      values="0 12 12; 360 12 12" // Rotate around center of 24x24 viewBox
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </linearGradient>
                </defs>
                {/* Base polygon with the "original" color (muted-foreground) */}
                <polygon 
                    points="12,2 2,20 22,20" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                />
                {/* Overlay polygon with the shimmering rainbow, semi-transparent to blend */}
                <polygon 
                    points="12,2 2,20 22,20" 
                    fill="none" 
                    stroke="url(#shimmeringRainbowFooterIcon)" 
                    strokeWidth="2"
                    strokeOpacity="0.6" 
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
