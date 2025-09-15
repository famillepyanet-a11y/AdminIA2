import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ScanPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (data: { name: string; originalName: string; mimeType: string; size: number; objectPath: string }) => {
      const response = await apiRequest('POST', '/api/documents', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "Succès",
        description: "Document scanné et sauvegardé avec succès",
      });
      setCapturedImage(null);
      stopCamera();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde du document",
        variant: "destructive",
      });
    }
  });

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'accéder à la caméra. Vérifiez les autorisations.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveDocument = async () => {
    if (!capturedImage) return;

    try {
      // Get upload URL
      const uploadResponse = await fetch('/api/documents/upload-url', {
        method: 'POST',
      });
      const { uploadURL } = await uploadResponse.json();

      // Convert base64 to blob
      const base64Response = await fetch(capturedImage);
      const blob = await base64Response.blob();

      // Upload to object storage
      await fetch(uploadURL, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });

      // Save document metadata
      await uploadMutation.mutateAsync({
        name: `Document_Scanne_${new Date().toISOString().split('T')[0]}.jpg`,
        originalName: `Document_Scanne_${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
        size: blob.size,
        objectPath: uploadURL,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde",
        variant: "destructive",
      });
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('actions.scan.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('actions.scan.description')}
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            {!isScanning && !capturedImage && (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <i className="fas fa-camera text-primary text-3xl" />
                </div>
                
                <div className="space-y-4">
                  <Button
                    data-testid="button-start-camera"
                    onClick={startCamera}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <i className="fas fa-camera mr-2" />
                    Démarrer la caméra
                  </Button>
                  
                  <div className="text-muted-foreground">ou</div>
                  
                  <Button
                    data-testid="button-upload-file"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <i className="fas fa-upload mr-2" />
                    Choisir un fichier
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {isScanning && (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-auto max-h-96 object-contain"
                  />
                  
                  {/* Scan overlay */}
                  <div className="absolute inset-0 border-2 border-primary/30 rounded-lg">
                    <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-primary" />
                    <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-primary" />
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-primary" />
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-primary" />
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Button
                    data-testid="button-capture-photo"
                    onClick={capturePhoto}
                    size="lg"
                  >
                    <i className="fas fa-camera mr-2" />
                    Capturer
                  </Button>
                  <Button
                    data-testid="button-stop-camera"
                    variant="outline"
                    onClick={stopCamera}
                    size="lg"
                  >
                    <i className="fas fa-times mr-2" />
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="space-y-4">
                <div className="bg-black rounded-lg overflow-hidden">
                  <img
                    src={capturedImage}
                    alt="Document scanné"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Button
                    data-testid="button-save-document"
                    onClick={saveDocument}
                    disabled={uploadMutation.isPending}
                    size="lg"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                  <Button
                    data-testid="button-retake-photo"
                    variant="outline"
                    onClick={retakePhoto}
                    size="lg"
                  >
                    <i className="fas fa-redo mr-2" />
                    Reprendre
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Tips */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              <i className="fas fa-lightbulb mr-2" />
              Conseils pour un scan optimal
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start">
                <i className="fas fa-check text-accent mr-2 mt-0.5 text-xs" />
                Assurez-vous que le document est bien éclairé
              </li>
              <li className="flex items-start">
                <i className="fas fa-check text-accent mr-2 mt-0.5 text-xs" />
                Placez le document sur une surface plane
              </li>
              <li className="flex items-start">
                <i className="fas fa-check text-accent mr-2 mt-0.5 text-xs" />
                Évitez les ombres et les reflets
              </li>
              <li className="flex items-start">
                <i className="fas fa-check text-accent mr-2 mt-0.5 text-xs" />
                Centrez le document dans le cadre
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>

      <MobileNavigation />
    </div>
  );
}
