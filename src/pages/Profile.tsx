import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Settings, User, Shield, Palette, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  specialization: string;
  license_number: string;
  practice_name: string;
  verification_status: string;
  verification_document_url: string;
}

const specializations = [
  { value: 'small_animal', label: 'Small Animal Medicine' },
  { value: 'large_animal', label: 'Large Animal Medicine' },
  { value: 'equine', label: 'Equine Medicine' },
  { value: 'exotic', label: 'Exotic Animal Medicine' },
  { value: 'emergency_critical_care', label: 'Emergency & Critical Care' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'internal_medicine', label: 'Internal Medicine' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'oncology', label: 'Oncology' },
  { value: 'pathology', label: 'Pathology' },
  { value: 'radiology', label: 'Radiology' },
  { value: 'anesthesiology', label: 'Anesthesiology' },
  { value: 'behavior', label: 'Animal Behavior' },
  { value: 'nutrition', label: 'Veterinary Nutrition' },
  { value: 'public_health', label: 'Public Health' },
  { value: 'research', label: 'Research' },
  { value: 'other', label: 'Other' },
];

export default function Profile() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    specialization: '' as any,
    license_number: '',
    practice_name: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        specialization: data.specialization || '',
        license_number: data.license_number || '',
        practice_name: data.practice_name || '',
      });
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        ...formData,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      fetchProfile();
    }
    setLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/license.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('verification-docs')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast({
        title: "Upload Error",
        description: "Failed to upload verification document",
        variant: "destructive",
      });
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ verification_document_url: fileName })
      .eq('user_id', user.id);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to save document reference",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Verification document uploaded successfully",
      });
      fetchProfile();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-success text-success-foreground">Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Verification</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Verification Rejected</Badge>;
      default:
        return <Badge variant="outline">Unverified</Badge>;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {profile?.full_name ? getInitials(profile.full_name) : 'VD'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">{user.email}</p>
                    {profile && getStatusBadge(profile.verification_status)}
                  </div>
                </div>

                <h2 className="text-lg font-semibold mb-4">Settings</h2>
                <nav className="space-y-2">
                  <Button
                    variant={activeTab === 'profile' ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('profile')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                  <Button
                    variant={activeTab === 'verification' ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('verification')}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Verification
                  </Button>
                  <Button
                    variant={activeTab === 'appearance' ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('appearance')}
                  >
                    <Palette className="mr-2 h-4 w-4" />
                    Appearance
                  </Button>
                </nav>

                <div className="mt-8">
                  <Button variant="outline" onClick={signOut} className="w-full">
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your professional information and credentials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Dr. Jane Smith"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization *</Label>
                      <Select 
                        value={formData.specialization} 
                        onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          {specializations.map((spec) => (
                            <SelectItem key={spec.value} value={spec.value}>
                              {spec.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="license_number">License Number</Label>
                      <Input
                        id="license_number"
                        value={formData.license_number}
                        onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                        placeholder="VET123456"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="practice_name">Practice/Institution</Label>
                      <Input
                        id="practice_name"
                        value={formData.practice_name}
                        onChange={(e) => setFormData({ ...formData, practice_name: e.target.value })}
                        placeholder="Animal Care Clinic"
                      />
                    </div>
                  </div>

                  <Button onClick={updateProfile} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 'verification' && (
              <Card>
                <CardHeader>
                  <CardTitle>Veterinary Credentials</CardTitle>
                  <CardDescription>
                    VetIntel is free for verified veterinary professionals. Upload proof of your veterinary credentials to access advanced features.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted p-6 rounded-lg">
                    <h3 className="font-semibold mb-3">Upload proof of veterinary credentials - For example:</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• A picture of your veterinary degree or diploma</li>
                      <li>• A copy of your professional license or registration certificate</li>
                      <li>• Verification printout from your veterinary board</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          <strong>Allowed file formats:</strong><br />
                          PDF, JPG, JPEG, GIF, or PNG<br />
                          Maximum allowed file size is 20 MB
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.gif,.png"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="verification-upload"
                        />
                        <Label 
                          htmlFor="verification-upload"
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
                        >
                          Browse Files
                        </Label>
                      </div>
                    </div>

                    {profile?.verification_document_url && (
                      <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                        <p className="text-sm font-medium text-success">
                          ✓ Verification document uploaded
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Status: {profile.verification_status}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'appearance' && (
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize your VetIntel experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Theme and appearance settings coming soon...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}