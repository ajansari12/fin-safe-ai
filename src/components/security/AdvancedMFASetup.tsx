
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Shield, Key, Download, CheckCircle, Phone, Mail, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { enhancedMFAService, MFASetupData, MFASettings, BackupCode } from "@/services/security/enhanced-mfa-service";

const AdvancedMFASetup: React.FC = () => {
  const [mfaData, setMfaData] = useState<MFASetupData | null>(null);
  const [mfaSettings, setMfaSettings] = useState<MFASettings | null>(null);
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([]);
  const [verificationToken, setVerificationToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [backupCodesDownloaded, setBackupCodesDownloaded] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadMFASettings();
  }, []);

  const loadMFASettings = async () => {
    try {
      const [settings, codes] = await Promise.all([
        enhancedMFAService.getMFASettings(),
        enhancedMFAService.getBackupCodes()
      ]);
      
      setMfaSettings(settings);
      setBackupCodes(codes);
      setIsSetupComplete(settings?.mfa_enabled || false);
      
      if (settings?.phone_number) {
        setPhoneNumber(settings.phone_number);
      }
    } catch (error) {
      console.error('Error loading MFA settings:', error);
    }
  };

  const setupTOTP = async () => {
    try {
      const data = await enhancedMFAService.setupMFA();
      setMfaData(data);
      toast({
        title: "TOTP Setup Initiated",
        description: "Scan the QR code with your authenticator app"
      });
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Failed to setup TOTP. Please try again.",
        variant: "destructive"
      });
    }
  };

  const verifyTOTP = async () => {
    if (!verificationToken) return;
    
    setIsVerifying(true);
    try {
      const isValid = await enhancedMFAService.verifyTOTP(verificationToken);
      if (isValid) {
        await enhancedMFAService.enableMFA();
        setIsSetupComplete(true);
        await loadMFASettings();
        toast({
          title: "TOTP Verified",
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
        description: "Failed to verify TOTP code",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyBackupCode = async (code: string) => {
    try {
      const isValid = await enhancedMFAService.verifyBackupCode(code);
      if (isValid) {
        toast({
          title: "Backup Code Verified",
          description: "Backup code verification successful"
        });
        await loadMFASettings();
      } else {
        toast({
          title: "Invalid Code",
          description: "The backup code is invalid or has already been used",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Failed to verify backup code",
        variant: "destructive"
      });
    }
  };

  const downloadBackupCodes = () => {
    if (!mfaData?.backupCodes) return;
    
    const content = `ResilientFI MFA Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\nSave these codes in a safe place. Each code can only be used once.\n\n${mfaData.backupCodes.join('\n')}\n\nIMPORTANT: Keep these codes secure and do not share them with anyone.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mfa-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupCodesDownloaded(true);
  };

  const disableMFA = async () => {
    try {
      await enhancedMFAService.disableMFA();
      setIsSetupComplete(false);
      setMfaData(null);
      await loadMFASettings();
      toast({
        title: "MFA Disabled",
        description: "Multi-factor authentication has been disabled"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable MFA",
        variant: "destructive"
      });
    }
  };

  if (isSetupComplete && mfaSettings?.mfa_enabled) {
    return (
      <div className="space-y-6">
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
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your account is now protected with multi-factor authentication. 
                Make sure to keep your backup codes in a safe place.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">TOTP Authenticator</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  mfaSettings.sms_enabled ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Phone className={`w-4 h-4 ${
                    mfaSettings.sms_enabled ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <p className="font-medium">SMS Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    {mfaSettings.sms_enabled ? 'Active' : 'Not configured'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  mfaSettings.email_enabled ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Mail className={`w-4 h-4 ${
                    mfaSettings.email_enabled ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <p className="font-medium">Email Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    {mfaSettings.email_enabled ? 'Active' : 'Not configured'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Backup Codes Status</Label>
                <Badge variant="outline">
                  {backupCodes.filter(code => !code.used_at).length} unused codes
                </Badge>
              </div>
              
              {mfaData?.backupCodes && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {mfaData.backupCodes.slice(0, 6).map((code, index) => (
                      <Badge key={index} variant="outline" className="justify-center font-mono">
                        {code}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={downloadBackupCodes}
                    disabled={backupCodesDownloaded}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {backupCodesDownloaded ? "Downloaded" : "Download All Codes"}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline"
                onClick={() => setIsSetupComplete(false)}
              >
                Reconfigure MFA
              </Button>
              <Button 
                variant="destructive"
                onClick={disableMFA}
              >
                Disable MFA
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Setup Multi-Factor Authentication
          </CardTitle>
          <CardDescription>
            Enhance your account security with additional authentication factors
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="totp" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="totp">TOTP Authenticator</TabsTrigger>
          <TabsTrigger value="sms">SMS Authentication</TabsTrigger>
          <TabsTrigger value="email">Email Authentication</TabsTrigger>
        </TabsList>

        <TabsContent value="totp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>TOTP Authenticator Setup</CardTitle>
              <CardDescription>
                Use an authenticator app like Google Authenticator, Authy, or 1Password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!mfaData ? (
                <div className="text-center">
                  <Button onClick={setupTOTP} className="w-full">
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate Setup QR Code
                  </Button>
                </div>
              ) : (
                <>
                  {/* QR Code Section */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="inline-block p-4 bg-white border rounded-lg">
                        <img 
                          src={`data:image/svg+xml;base64,${btoa(`
                            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                              <rect width="200" height="200" fill="white"/>
                              <text x="100" y="100" text-anchor="middle" font-family="monospace" font-size="10">
                                ${mfaData.qrCode}
                              </text>
                            </svg>
                          `)}`}
                          alt="MFA QR Code" 
                          width={200}
                          height={200}
                        />
                      </div>
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
                      onClick={verifyTOTP} 
                      disabled={!verificationToken || isVerifying}
                      className="w-full"
                    >
                      {isVerifying ? "Verifying..." : "Verify & Enable TOTP"}
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
        </TabsContent>

        <TabsContent value="sms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SMS Authentication Setup</CardTitle>
              <CardDescription>
                Receive verification codes via SMS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  SMS authentication setup is not yet available in this demo. 
                  This would integrate with SMS providers like Twilio in a production environment.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <Button disabled className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Send Verification SMS (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Authentication Setup</CardTitle>
              <CardDescription>
                Receive verification codes via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Email authentication setup is not yet available in this demo. 
                  This would integrate with email providers in a production environment.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="email-code">Verification Code</Label>
                <Input
                  id="email-code"
                  value={emailVerificationCode}
                  onChange={(e) => setEmailVerificationCode(e.target.value)}
                  placeholder="Enter verification code"
                />
              </div>

              <Button disabled className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Verify Email Code (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedMFASetup;
