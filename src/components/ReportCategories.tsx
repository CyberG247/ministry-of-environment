import { 
  Trash2, 
  Droplets, 
  AlertTriangle, 
  Volume2, 
  Bug,
  Wind
} from "lucide-react";

const categories = [
  {
    icon: Trash2,
    title: "Illegal Dumping",
    description: "Report unauthorized waste disposal in public areas, roadsides, or waterbodies",
    color: "bg-red-500",
    count: "850+",
  },
  {
    icon: Droplets,
    title: "Blocked Drainage",
    description: "Report clogged drains, waterlogged areas, and flooding risks",
    color: "bg-blue-500",
    count: "620+",
  },
  {
    icon: AlertTriangle,
    title: "Open Defecation",
    description: "Report areas with open defecation and public health hazards",
    color: "bg-amber-500",
    count: "340+",
  },
  {
    icon: Volume2,
    title: "Noise Pollution",
    description: "Report excessive noise from industries, events, or generators",
    color: "bg-purple-500",
    count: "280+",
  },
  {
    icon: Bug,
    title: "Sanitation Issues",
    description: "Report poor sanitation, pest infestations, and hygiene concerns",
    color: "bg-orange-500",
    count: "450+",
  },
  {
    icon: Wind,
    title: "Environmental Nuisance",
    description: "Report air pollution, burning waste, and other environmental hazards",
    color: "bg-teal-500",
    count: "390+",
  },
];

const ReportCategories = () => {
  return (
    <section id="categories" className="py-20 bg-background">
      <div className="container-gov">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Report Categories
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            What Would You Like to Report?
          </h2>
          <p className="text-lg text-muted-foreground">
            Select a category below to submit your environmental complaint. 
            Your report helps us maintain a cleaner Jigawa State.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <button
              key={category.title}
              className="group card-gov p-6 text-left hover:border-primary/30 animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${category.color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {category.count} reports
                </span>
              </div>
              
              <h3 className="text-xl font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {category.title}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                {category.description}
              </p>

              <div className="mt-4 flex items-center text-primary font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Report Now
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReportCategories;
