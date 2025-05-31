
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { QrCode, Shield, Key, Download, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mfaService, MFASetupData } from "@/services/security/mfa-service";

const MFASetup: React.FC = () => {
  const [mfaData, setMfaData] = useState<MFASetupData | null>(null);
  const [verificationToken, setVerificationToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [backupCodesDownloaded, setBackupCodesDownloaded] = useState(false);
  const { toast } = useToast();

  const setupMFA = async () => {
    try {
      const data = await mfaService.setupMFA();
      setMfaData(data);
      toast({
        title: "MFA Setup Initiated",
        description: "Scan the QR code with your authenticator app"
      });
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Failed to setup MFA. Please try again.",
        variant: "destructive"
      });
    }
  };

  const verifyMFA = async () => {
    if (!verificationToken) return;
    
    setIsVerifying(true);
    try {
      const isValid = await mfaService.verifyMFA(verificationToken);
      if (isValid) {
        setIsVerified(true);
        toast({
          title: "MFA Verified",
          description: "Multi-factor authentication has been successfully enabled"
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid verification code. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Failed to verify MFA code",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const downloadBackupCodes = () => {
    if (!mfaData?.backupCodes) return;
    
    const content = `Backup Codes for MFA\n\nSave these codes in a safe place. Each code can only be used once.\n\n${mfaData.backupCodes.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mfa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    setBackupCodesDownloaded(true);
  };

  if (isVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            MFA Enabled Successfully
          </CardTitle>
          <CardDescription>
            Multi-factor authentication is now active on your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your account is now protected with multi-factor authentication. 
              Make sure to keep your backup codes in a safe place.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Setup Multi-Factor Authentication
        </CardTitle>
        <CardDescription>
          Enhance your account security with an additional layer of protection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!mfaData ? (
          <div className="text-center">
            <Button onClick={setupMFA} className="w-full">
              <QrCode className="h-4 w-4 mr-2" />
              Setup MFA
            </Button>
          </div>
        ) : (
          <>
            {/* QR Code Section */}
            <div className="space-y-4">
              <div className="text-center">
                <img 
                  src={mfaData.qrCode} 
                  alt="MFA QR Code" 
                  className="mx-auto border rounded-lg p-4 bg-white"
                  width={200}
                  height={200}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Scan this QR code with your authenticator app
                </p>
              </div>

              {/* Manual Secret */}
              <div className="space-y-2">
                <Label>Manual Entry Code</Label>
                <div className="flex items-center gap-2">
                  <Input value={mfaData.secret} readOnly className="font-mono text-xs" />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(mfaData.secret)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            {/* Verification Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification">Enter 6-digit code from your app</Label>
                <Input
                  id="verification"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center font-mono text-lg"
                />
              </div>
              <Button 
                onClick={verifyMFA} 
                disabled={!verificationToken || isVerifying}
                className="w-full"
              >
                {isVerifying ? "Verifying..." : "Verify & Enable MFA"}
              </Button>
            </div>

            {/* Backup Codes Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Backup Codes
                </Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadBackupCodes}
                  disabled={backupCodesDownloaded}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {backupCodesDownloaded ? "Downloaded" : "Download"}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {mfaData.backupCodes.map((code, index) => (
                  <Badge key={index} variant="outline" className="justify-center font-mono">
                    {code}
                  </Badge>
                ))}
              </div>
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Save these backup codes in a secure location. Each code can only be used once 
                  if you lose access to your authenticator app.
                </AlertDescription>
              </Alert>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MFASetup;
