import { Leaf, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", href: "#" },
    { label: "Report Issue", href: "#report" },
    { label: "Track Report", href: "#track" },
    { label: "FAQs", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ];

  const resources = [
    { label: "Environmental Tips", href: "#" },
    { label: "Sanitation Guidelines", href: "#" },
    { label: "Waste Management", href: "#" },
    { label: "Climate Action", href: "#" },
    { label: "Community Programs", href: "#" },
  ];

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container-gov py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="font-serif font-bold text-lg">ECSRS</p>
                <p className="text-xs text-background/60">Jigawa State</p>
              </div>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              Environmental Complaints & Sanitation Reporting System - 
              Empowering citizens to protect our environment together.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-background/70 hover:text-background hover:pl-1 transition-all text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-4">Resources</h4>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-background/70 hover:text-background hover:pl-1 transition-all text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Government Info */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-4">Government</h4>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-background/70">Ministry of Environment</p>
                <p className="text-background/70">& Climate Change</p>
              </div>
              <div>
                <p className="font-semibold">Jigawa State Government</p>
                <p className="text-background/70">Federal Republic of Nigeria</p>
              </div>
              <div className="pt-4">
                {/* Nigerian Flag */}
                <div className="flex h-4 w-24 rounded overflow-hidden">
                  <div className="flex-1 bg-primary" />
                  <div className="flex-1 bg-background" />
                  <div className="flex-1 bg-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container-gov py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/60">
            <p>© {currentYear} ECSRS - Jigawa State Government. All rights reserved.</p>
            <p>Powered by the Ministry of Environment & Climate Change</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
