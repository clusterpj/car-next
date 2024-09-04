// src/pages/admin/adminProfile.tsx
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { fetchAdminProfile, updateAdminProfile } from '@/lib/api';

const AdminProfile = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    lastLogin: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'admin')) {
      router.push('/');
    } else if (status === 'authenticated') {
      loadProfile();
    }
  }, [status, session, router]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminProfile();
      setProfile(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAdminProfile(profile);
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Profile</CardTitle>
          <CardDescription>Manage your admin account and system preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal-info">
            <TabsList>
              <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
              <TabsTrigger value="recent-activities">Recent Activities</TabsTrigger>
              <TabsTrigger value="system-preferences">System Preferences</TabsTrigger>
              <TabsTrigger value="analytics">Analytics Overview</TabsTrigger>
            </TabsList>
            <TabsContent value="personal-info">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={profile.name} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" value={profile.email} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={profile.role} disabled />
                </div>
                <div>
                  <Label htmlFor="lastLogin">Last Login</Label>
                  <Input id="lastLogin" value={profile.lastLogin} disabled />
                </div>
                <Button type="submit">Update Profile</Button>
              </form>
            </TabsContent>
            <TabsContent value="recent-activities">
              {/* Implement recent activities component */}
              <p>Recent admin activities will be displayed here.</p>
            </TabsContent>
            <TabsContent value="system-preferences">
              {/* Implement system preferences component */}
              <p>System preferences will be managed here.</p>
            </TabsContent>
            <TabsContent value="analytics">
              {/* Implement analytics overview component */}
              <p>Analytics overview will be displayed here.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfile;