import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Trash2, 
  Droplets, 
  AlertTriangle, 
  Volume2, 
  Bug,
  Wind,
  MapPin,
  Camera,
  Upload,
  X,
  CheckCircle,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface LGA {
  id: string;
  name: string;
  code: string;
}

interface ReportFormData {
  category: string;
  title: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  lgaId: string;
  isAnonymous: boolean;
  mediaFiles: File[];
}

interface ReportFormStepsProps {
  currentStep: number;
  formData: ReportFormData;
  setFormData: (data: ReportFormData) => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  trackingId: string | null;
}

const categories = [
  { id: "illegal_dumping", icon: Trash2, title: "Illegal Dumping", color: "bg-red-500" },
  { id: "blocked_drainage", icon: Droplets, title: "Blocked Drainage", color: "bg-blue-500" },
  { id: "open_defecation", icon: AlertTriangle, title: "Open Defecation", color: "bg-amber-500" },
  { id: "noise_pollution", icon: Volume2, title: "Noise Pollution", color: "bg-purple-500" },
  { id: "sanitation_issues", icon: Bug, title: "Sanitation Issues", color: "bg-orange-500" },
  { id: "environmental_nuisance", icon: Wind, title: "Environmental Nuisance", color: "bg-teal-500" },
];

// Step 1: Category Selection
export const CategoryStep = ({ formData, setFormData, onNext }: Omit<ReportFormStepsProps, 'onBack' | 'onSubmit' | 'isSubmitting' | 'trackingId' | 'currentStep'>) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-foreground">What would you like to report?</h2>
        <p className="text-muted-foreground mt-2">Select the category that best describes the issue</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setFormData({ ...formData, category: category.id })}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              formData.category === category.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`${category.color} p-3 rounded-lg text-white`}>
                <category.icon className="w-6 h-6" />
              </div>
              <span className="font-semibold text-foreground">{category.title}</span>
            </div>
          </button>
        ))}
      </div>

      <Button 
        onClick={onNext} 
        className="w-full" 
        size="lg"
        disabled={!formData.category}
      >
        Continue
      </Button>
    </div>
  );
};

// Step 2: Location
export const LocationStep = ({ formData, setFormData, onNext, onBack }: Omit<ReportFormStepsProps, 'onSubmit' | 'isSubmitting' | 'trackingId' | 'currentStep'>) => {
  const [lgas, setLgas] = useState<LGA[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const fetchLgas = async () => {
      const { data } = await supabase.from('lgas').select('*').order('name');
      if (data) setLgas(data);
    };
    fetchLgas();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLocating(false);
        alert("Unable to get your location. Please enter the address manually.");
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-foreground">Where is the issue located?</h2>
        <p className="text-muted-foreground mt-2">Help us identify the exact location</p>
      </div>

      {/* GPS Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-14"
        onClick={getCurrentLocation}
        disabled={isLocating}
      >
        {isLocating ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <MapPin className="w-5 h-5 mr-2" />
        )}
        {isLocating ? "Getting Location..." : "Use My Current Location"}
      </Button>

      {formData.latitude && formData.longitude && (
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-primary font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Location captured: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="address">Address / Landmark Description</Label>
          <Textarea
            id="address"
            placeholder="e.g., Behind Dutse Central Market, near the main gate"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="lga">Local Government Area</Label>
          <Select
            value={formData.lgaId}
            onValueChange={(value) => setFormData({ ...formData, lgaId: value })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select LGA" />
            </SelectTrigger>
            <SelectContent>
              {lgas.map((lga) => (
                <SelectItem key={lga.id} value={lga.id}>
                  {lga.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={onNext} 
          className="flex-1"
          disabled={!formData.lgaId || !formData.address}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

// Step 3: Details
export const DetailsStep = ({ formData, setFormData, onNext, onBack }: Omit<ReportFormStepsProps, 'onSubmit' | 'isSubmitting' | 'trackingId' | 'currentStep'>) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-foreground">Describe the Issue</h2>
        <p className="text-muted-foreground mt-2">Provide details about the environmental problem</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Report Title</Label>
          <Input
            id="title"
            placeholder="Brief title for this report"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1.5"
            maxLength={100}
          />
        </div>

        <div>
          <Label htmlFor="description">Detailed Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the issue in detail. Include information about the severity, how long it has been present, and any other relevant details."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1.5 min-h-[150px]"
            maxLength={1000}
          />
          <p className="text-sm text-muted-foreground mt-1">
            {formData.description.length}/1000 characters
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={onNext} 
          className="flex-1"
          disabled={!formData.title || !formData.description}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

// Step 4: Media Upload
export const MediaStep = ({ formData, setFormData, onNext, onBack }: Omit<ReportFormStepsProps, 'onSubmit' | 'isSubmitting' | 'trackingId' | 'currentStep'>) => {
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (file) => file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    if (validFiles.length + formData.mediaFiles.length > 5) {
      alert("Maximum 5 files allowed");
      return;
    }

    const newFiles = [...formData.mediaFiles, ...validFiles];
    setFormData({ ...formData, mediaFiles: newFiles });

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    const newFiles = formData.mediaFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFormData({ ...formData, mediaFiles: newFiles });
    setPreviews(newPreviews);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-foreground">Add Evidence</h2>
        <p className="text-muted-foreground mt-2">Upload photos or videos (optional but recommended)</p>
      </div>

      {/* Upload Area */}
      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Camera className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="mb-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">Images or videos (max 5 files, 10MB each)</p>
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/*,video/*"
          multiple
          onChange={handleFileChange}
        />
      </label>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
};

// Step 5: Review & Submit
export const ReviewStep = ({ formData, setFormData, onBack, onSubmit, isSubmitting }: Omit<ReportFormStepsProps, 'onNext' | 'trackingId' | 'currentStep'>) => {
  const { user } = useAuth();
  const [lgas, setLgas] = useState<LGA[]>([]);
  
  useEffect(() => {
    const fetchLgas = async () => {
      const { data } = await supabase.from('lgas').select('*');
      if (data) setLgas(data);
    };
    fetchLgas();
  }, []);

  const selectedCategory = categories.find((c) => c.id === formData.category);
  const selectedLga = lgas.find((l) => l.id === formData.lgaId);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-foreground">Review Your Report</h2>
        <p className="text-muted-foreground mt-2">Please verify all information before submitting</p>
      </div>

      <div className="space-y-4">
        {/* Category */}
        <div className="p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Category</p>
          <div className="flex items-center gap-2">
            {selectedCategory && (
              <>
                <div className={`${selectedCategory.color} p-2 rounded-lg text-white`}>
                  <selectedCategory.icon className="w-4 h-4" />
                </div>
                <span className="font-medium">{selectedCategory.title}</span>
              </>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Report Details</p>
          <p className="font-semibold text-foreground">{formData.title}</p>
          <p className="text-muted-foreground mt-2 text-sm">{formData.description}</p>
        </div>

        {/* Location */}
        <div className="p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Location</p>
          <p className="font-medium">{formData.address}</p>
          <p className="text-sm text-muted-foreground">{selectedLga?.name} LGA</p>
          {formData.latitude && (
            <p className="text-xs text-primary mt-1">
              GPS: {formData.latitude.toFixed(6)}, {formData.longitude?.toFixed(6)}
            </p>
          )}
        </div>

        {/* Media */}
        {formData.mediaFiles.length > 0 && (
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Evidence: {formData.mediaFiles.length} file(s) attached
            </p>
          </div>
        )}

        {/* Anonymous Option */}
        {user && (
          <div className="flex items-center space-x-2 p-4 bg-secondary/50 rounded-lg">
            <Checkbox
              id="anonymous"
              checked={formData.isAnonymous}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, isAnonymous: checked as boolean })
              }
            />
            <Label htmlFor="anonymous" className="text-sm cursor-pointer">
              Submit this report anonymously (your identity won't be linked to this report)
            </Label>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={onSubmit} className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Report"
          )}
        </Button>
      </div>
    </div>
  );
};

// Step 6: Success
export const SuccessStep = ({ trackingId, onClose }: { trackingId: string; onClose: () => void }) => {
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-primary" />
      </div>

      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground">Report Submitted!</h2>
        <p className="text-muted-foreground mt-2">
          Thank you for helping keep Jigawa State clean and safe.
        </p>
      </div>

      <div className="p-6 bg-primary/5 rounded-xl border border-primary/20">
        <p className="text-sm text-muted-foreground mb-2">Your Tracking ID</p>
        <p className="text-2xl font-mono font-bold text-primary">{trackingId}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Save this ID to track your report status
        </p>
      </div>

      <div className="space-y-3">
        <Button onClick={onClose} className="w-full">
          Submit Another Report
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/#track'} className="w-full">
          Track This Report
        </Button>
      </div>
    </div>
  );
};
