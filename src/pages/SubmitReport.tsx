import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Leaf, ArrowLeft } from "lucide-react";
import {
  CategoryStep,
  LocationStep,
  DetailsStep,
  MediaStep,
  ReviewStep,
  SuccessStep,
} from "@/components/report/ReportFormSteps";

const SubmitReport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    latitude: null as number | null,
    longitude: null as number | null,
    address: "",
    lgaId: "",
    isAnonymous: false,
    mediaFiles: [] as File[],
  });

  const totalSteps = 5;

  const uploadMedia = async (files: File[], reportId: string) => {
    const urls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id || 'anonymous'}/${reportId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('report-media')
        .upload(fileName, file);
      
      if (error) {
        console.error('Upload error:', error);
        continue;
      }
      
      const { data: urlData } = supabase.storage
        .from('report-media')
        .getPublicUrl(fileName);
      
      urls.push(urlData.publicUrl);
    }
    
    return urls;
  };

  const handleSubmit = async () => {
    if (!user && !formData.isAnonymous) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a report, or submit anonymously.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create report first to get ID
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .insert({
          category: formData.category,
          title: formData.title,
          description: formData.description,
          latitude: formData.latitude,
          longitude: formData.longitude,
          address: formData.address,
          lga_id: formData.lgaId,
          reporter_id: formData.isAnonymous ? null : user?.id,
          is_anonymous: formData.isAnonymous || !user,
        } as any)
        .select()
        .single();

      if (reportError) throw reportError;

      // Upload media if any
      if (formData.mediaFiles.length > 0 && report) {
        const mediaUrls = await uploadMedia(formData.mediaFiles, report.id);
        
        if (mediaUrls.length > 0) {
          await supabase
            .from('reports')
            .update({ media_urls: mediaUrls })
            .eq('id', report.id);
        }
      }

      // Create initial status update
      await supabase.from('report_updates').insert({
        report_id: report.id,
        updated_by: user?.id || null,
        new_status: 'submitted',
        notes: 'Report submitted successfully',
      });

      setTrackingId(report.tracking_id);
      setCurrentStep(6); // Success step
      
      toast({
        title: "Report Submitted!",
        description: `Your tracking ID is: ${report.tracking_id}`,
      });
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: "",
      title: "",
      description: "",
      latitude: null,
      longitude: null,
      address: "",
      lgaId: "",
      isAnonymous: false,
      mediaFiles: [],
    });
    setCurrentStep(1);
    setTrackingId(null);
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container-gov flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-foreground/10 rounded-lg">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <p className="font-serif font-bold text-lg">ECSRS</p>
              <p className="text-xs opacity-80">Report Submission</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      {currentStep <= totalSteps && (
        <div className="bg-background border-b border-border py-4">
          <div className="container-gov">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round((currentStep / totalSteps) * 100)}% complete
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <main className="container-gov py-8">
        <div className="max-w-xl mx-auto bg-background rounded-2xl shadow-gov p-6 md:p-8">
          {currentStep === 1 && (
            <CategoryStep
              formData={formData}
              setFormData={setFormData}
              onNext={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 2 && (
            <LocationStep
              formData={formData}
              setFormData={setFormData}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <DetailsStep
              formData={formData}
              setFormData={setFormData}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 4 && (
            <MediaStep
              formData={formData}
              setFormData={setFormData}
              onNext={() => setCurrentStep(5)}
              onBack={() => setCurrentStep(3)}
            />
          )}
          {currentStep === 5 && (
            <ReviewStep
              formData={formData}
              setFormData={setFormData}
              onBack={() => setCurrentStep(4)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
          {currentStep === 6 && trackingId && (
            <SuccessStep trackingId={trackingId} onClose={resetForm} />
          )}
        </div>

        {/* Login Prompt */}
        {!user && currentStep <= totalSteps && (
          <div className="max-w-xl mx-auto mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20 text-center">
            <p className="text-sm text-muted-foreground">
              <Button variant="link" onClick={() => navigate("/auth")} className="p-0 h-auto text-primary">
                Sign in
              </Button>{" "}
              to track your reports and receive updates, or submit anonymously.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SubmitReport;
