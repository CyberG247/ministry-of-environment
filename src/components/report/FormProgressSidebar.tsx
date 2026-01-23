import { 
  Trash2, 
  MapPin, 
  FileText, 
  Camera, 
  CheckCircle,
  Circle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FormProgressSidebarProps {
  currentStep: number;
  formData: {
    category: string;
    title: string;
    description: string;
    latitude: number | null;
    address: string;
    lgaId: string;
    mediaFiles: File[];
  };
  onStepClick: (step: number) => void;
}

const steps = [
  { 
    number: 1, 
    title: "Category", 
    description: "Select issue type",
    icon: Trash2 
  },
  { 
    number: 2, 
    title: "Location", 
    description: "Where is the issue?",
    icon: MapPin 
  },
  { 
    number: 3, 
    title: "Details", 
    description: "Describe the problem",
    icon: FileText 
  },
  { 
    number: 4, 
    title: "Evidence", 
    description: "Add photos/videos",
    icon: Camera 
  },
  { 
    number: 5, 
    title: "Review", 
    description: "Submit your report",
    icon: CheckCircle 
  },
];

const FormProgressSidebar = ({ currentStep, formData, onStepClick }: FormProgressSidebarProps) => {
  const isStepComplete = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!formData.category;
      case 2:
        return !!formData.lgaId && !!formData.address;
      case 3:
        return !!formData.title && !!formData.description;
      case 4:
        return true; // Media is optional
      case 5:
        return false; // Review is the final step
      default:
        return false;
    }
  };

  const canNavigateToStep = (stepNumber: number): boolean => {
    // Can always go back to completed steps
    if (stepNumber < currentStep) return true;
    // Can go to current step
    if (stepNumber === currentStep) return true;
    // Can only go forward if all previous steps are complete
    for (let i = 1; i < stepNumber; i++) {
      if (!isStepComplete(i)) return false;
    }
    return true;
  };

  return (
    <div className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 bg-background rounded-2xl shadow-gov border border-border p-6">
        <h3 className="font-serif font-bold text-lg text-foreground mb-6">
          Report Progress
        </h3>
        
        <div className="space-y-1">
          {steps.map((step, index) => {
            const isActive = currentStep === step.number;
            const isComplete = isStepComplete(step.number) && currentStep > step.number;
            const canNavigate = canNavigateToStep(step.number);
            const StepIcon = step.icon;

            return (
              <div key={step.number} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div 
                    className={cn(
                      "absolute left-[19px] top-12 w-0.5 h-8",
                      isComplete ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
                
                <button
                  onClick={() => canNavigate && onStepClick(step.number)}
                  disabled={!canNavigate}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left",
                    isActive && "bg-primary/10",
                    canNavigate && !isActive && "hover:bg-secondary cursor-pointer",
                    !canNavigate && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {/* Step indicator */}
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200",
                      isActive && "bg-primary text-primary-foreground",
                      isComplete && "bg-primary text-primary-foreground",
                      !isActive && !isComplete && "bg-secondary text-muted-foreground"
                    )}
                  >
                    {isComplete ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="pt-1">
                    <p 
                      className={cn(
                        "font-medium text-sm leading-tight",
                        isActive && "text-primary",
                        isComplete && "text-foreground",
                        !isActive && !isComplete && "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Completion indicator */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-medium text-foreground">
              {Math.round((currentStep / 5) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormProgressSidebar;
