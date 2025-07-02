import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOutIcon, Camera } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarSeparator } from '@/components/ui/sidebar';

const ContactUs = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem('iitk_username') || '');

  const handleLogout = () => {
    localStorage.removeItem('iitk_username');
    navigate('/');
  };

  const contacts = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      role: "Senior Counselor",
      phone: "+91-512-259-6789",
      email: "rajesh@iitk.ac.in",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Ms. Priya Sharma",
      role: "Student Welfare Officer",
      phone: "+91-512-259-6790",
      email: "priya.sharma@iitk.ac.in",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Dr. Amit Verma",
      role: "Psychological Counselor",
      phone: "+91-512-259-6791",
      email: "amit.verma@iitk.ac.in",
      image: "/placeholder.svg"
    },
    {
      id: 4,
      name: "Ms. Sneha Gupta",
      role: "Career Counselor",
      phone: "+91-512-259-6792",
      email: "sneha.gupta@iitk.ac.in",
      image: "/placeholder.svg"
    }
  ];

  const handleImageUpload = (contactId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log(`Uploading image for contact ${contactId}:`, file);
    }
  };

  const AppSidebar = () => (
    <Sidebar className="border-r border-primary/10">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold">Navigation</SidebarGroupLabel>
          <SidebarSeparator className="my-2" />
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className="hover:bg-accent"
                  onClick={() => navigate('/dashboard')}
                >
                  <span className="font-medium">Resources</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-accent bg-accent text-primary">
                  <span className="font-medium">Contact Us</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-accent/20 to-accent/30">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-primary/10 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <img 
                  src="/lovable-uploads/308cdbbb-f049-403c-b33a-4d6746d7d525.png" 
                  alt="ICS Logo" 
                  className="h-10 w-10"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-primary">{username}</p>
                  <p className="text-xs text-muted-foreground">Student</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-primary"
                >
                  <LogOutIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <Card className="bg-gradient-hero text-white border-0 shadow-glow">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-3xl font-bold mb-2">
                      Contact Institute Counselling Service
                    </CardTitle>
                    <CardDescription className="text-white/90 text-lg">
                      Reach out to our counseling team for support and guidance
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {contacts.map((contact) => (
                  <Card key={contact.id} className="hover:shadow-elegant transition-all duration-300 border-primary/20">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={contact.image} 
                            alt={contact.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                          />
                          <label className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1 cursor-pointer hover:bg-primary/80 transition-colors">
                            <Camera className="h-3 w-3" />
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden"
                              onChange={(e) => handleImageUpload(contact.id, e)}
                            />
                          </label>
                        </div>
                        <div>
                          <CardTitle className="text-lg text-primary">{contact.name}</CardTitle>
                          <CardDescription className="text-sm font-medium text-muted-foreground">
                            {contact.role}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Phone:</span>
                          <span className="text-sm text-muted-foreground">{contact.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Email:</span>
                          <span className="text-sm text-muted-foreground">{contact.email}</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4">
                        Contact
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ContactUs;