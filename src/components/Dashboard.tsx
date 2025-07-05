import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StarIcon, LogOutIcon, BookOpenIcon, X, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarSeparator } from '@/components/ui/sidebar';
import { 
  getCurrentUser, 
  getUserProfile, 
  getUserHobbies, 
  updateUserHobbies,
  getUserPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  searchSpotifyTracks,
  signOut,
  type User,
  type UserPlaylist
} from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [hobbies, setHobbies] = useState('');
  const [playlist, setPlaylist] = useState<UserPlaylist[]>([]);
  const [currentSong, setCurrentSong] = useState('');
  const [songSuggestions, setSongSuggestions] = useState<Array<{id: string, name: string, artist: string, spotifyUrl: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hobbiesLoading, setHobbiesLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/');
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await getUserProfile(currentUser.id);
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        toast.error('Failed to load user profile');
        return;
      }

      setUser(profile);

      // Get user hobbies
      const { data: hobbiesData } = await getUserHobbies(currentUser.id);
      if (hobbiesData) {
        setHobbies(hobbiesData.hobbies || '');
      }

      // Get user playlist
      const { data: playlistData, error: playlistError } = await getUserPlaylist(currentUser.id);
      if (playlistError) {
        console.error('Error fetching playlist:', playlistError);
      } else {
        setPlaylist(playlistData || []);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem('iitk_username');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleHobbiesUpdate = async () => {
    if (!user) return;
    
    setHobbiesLoading(true);
    try {
      const { error } = await updateUserHobbies(user.id, hobbies);
      if (error) {
        throw error;
      }
      toast.success('Hobbies updated successfully!');
    } catch (error) {
      console.error('Error updating hobbies:', error);
      toast.error('Failed to update hobbies');
    } finally {
      setHobbiesLoading(false);
    }
  };

  const handleSongSearch = async (value: string) => {
    setCurrentSong(value);
    setSearchError(null);
    
    if (value.length > 2) {
      setSearchLoading(true);
      try {
        const { data: tracks, error } = await searchSpotifyTracks(value);
        if (error) {
          setSearchError(error);
          if (error.includes('credentials') || error.includes('environment')) {
            toast.error('Spotify search is not configured. Please contact the administrator.');
          } else {
            toast.error('Failed to search songs. Please try again.');
          }
          setSongSuggestions([]);
          setShowSuggestions(false);
        } else {
          setSongSuggestions(tracks || []);
          setShowSuggestions(true);
          setSearchError(null);
        }
      } catch (error) {
        console.error('Error searching songs:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to search songs';
        setSearchError(errorMessage);
        toast.error('Failed to search songs. Please try again.');
        setSongSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setShowSuggestions(false);
      setSongSuggestions([]);
      setSearchError(null);
    }
  };

  const handleAddSongToPlaylist = async (song: {id: string, name: string, artist: string, spotifyUrl: string}) => {
    if (!user) return;

    try {
      const { error } = await addSongToPlaylist(user.id, {
        song_name: song.name,
        artist_name: song.artist,
        spotify_url: song.spotifyUrl,
        spotify_track_id: song.id,
      });

      if (error) {
        throw error;
      }

      // Refresh playlist
      const { data: playlistData } = await getUserPlaylist(user.id);
      setPlaylist(playlistData || []);
      
      setCurrentSong('');
      setShowSuggestions(false);
      setSearchError(null);
      toast.success('Song added to playlist!');
    } catch (error) {
      console.error('Error adding song:', error);
      toast.error('Failed to add song to playlist');
    }
  };

  const handleRemoveSongFromPlaylist = async (songId: string) => {
    if (!user) return;

    try {
      const { error } = await removeSongFromPlaylist(songId);
      if (error) {
        throw error;
      }

      // Refresh playlist
      const { data: playlistData } = await getUserPlaylist(user.id);
      setPlaylist(playlistData || []);
      
      toast.success('Song removed from playlist!');
    } catch (error) {
      console.error('Error removing song:', error);
      toast.error('Failed to remove song from playlist');
    }
  };

  const resourceItems = [
    {
      title: "Self Assessment Form",
      description: "Complete your personal assessment to better understand your academic and personal goals",
      icon: StarIcon,
      hasModal: true,
      modalContent: {
        title: "Self Assessment Form",
        description: "This comprehensive form will help you evaluate your academic progress, personal goals, and areas for improvement. The assessment covers various aspects including academic performance, extracurricular activities, career aspirations, and personal development goals.",
        googleFormUrl: "https://forms.gle/example123"
      }
    },
    {
      title: "Orientation Schedule",
      description: "View the complete orientation schedule for new students",
      icon: BookOpenIcon,
      hasModal: false
    },
    {
      title: "INFORMATION FOR PROSPECTING UG (2025) STUDENTS", 
      description: "Resources and guidance for undergraduate applicants",
      icon: BookOpenIcon,
      hasModal: false
    },
    {
      title: "INFORMATION FOR PROSPECTING PG (2025) STUDENTS",
      description: "Resources and guidance for postgraduate applicants",
      icon: BookOpenIcon,
      hasModal: false
    }
  ];

  const AppSidebar = () => (
    <Sidebar className="border-r border-primary/10">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold">Navigation</SidebarGroupLabel>
          <SidebarSeparator className="my-2" />
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-accent">
                  <span className="font-medium">Resources</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className="hover:bg-accent"
                  onClick={() => navigate('/contact')}
                >
                  <span className="font-medium">Contact Us</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
                  <p className="font-semibold text-primary">{user.username}</p>
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
            {/* Welcome Section - Reduced Width */}
            <div className="mb-8 animate-fade-in max-w-4xl mx-auto">
              <Card className="bg-gradient-hero text-white border-0 shadow-glow">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-3xl font-bold mb-2">
                    Welcome {user.username}
                  </CardTitle>
                  <CardDescription className="text-white/90 text-lg">
                    Here, you can access all of your resources and stay up-to-date on important announcements and events.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Student Information Section - Centered and Compact */}
            <div className="mb-8 animate-slide-up max-w-2xl mx-auto">
              <Card className="bg-gradient-hero text-white border-0 shadow-glow">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold mb-4">
                    Student Information
                  </CardTitle>
                  <div className="space-y-4 text-center">
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <div>
                        <p className="text-white/90 text-sm font-medium">Name:</p>
                        <p className="text-white text-lg font-semibold">{user.full_name || user.username}</p>
                      </div>
                      <div>
                        <p className="text-white/90 text-sm font-medium">Roll Number:</p>
                        <p className="text-white text-lg font-semibold">{user.roll_number || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {/* Hobbies Field */}
                    <div className="max-w-md mx-auto">
                      <Label htmlFor="hobbies" className="text-white/90 text-sm font-medium block mb-2">
                        Hobbies:
                      </Label>
                      <div className="space-y-2">
                        <Textarea
                          id="hobbies"
                          value={hobbies}
                          onChange={(e) => setHobbies(e.target.value)}
                          placeholder="Enter your hobbies (comma-separated)"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                          rows={2}
                        />
                        <Button
                          onClick={handleHobbiesUpdate}
                          disabled={hobbiesLoading}
                          className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                          size="sm"
                        >
                          {hobbiesLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            'Save Hobbies'
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Go-to Song Playlist */}
                    <div className="max-w-md mx-auto">
                      <Label htmlFor="playlist" className="text-white/90 text-sm font-medium block mb-2">
                        Go-to Song Playlist:
                      </Label>
                      <div className="relative">
                        <Input
                          id="playlist"
                          value={currentSong}
                          onChange={(e) => handleSongSearch(e.target.value)}
                          placeholder="Search for songs on Spotify..."
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                          disabled={searchLoading}
                        />
                        
                        {searchLoading && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-white/60" />
                          </div>
                        )}
                        
                        {/* Search Error Display */}
                        {searchError && (
                          <div className="absolute top-full left-0 right-0 bg-red-500/90 text-white rounded-md shadow-lg mt-1 z-10 p-2">
                            <div className="flex items-center gap-2 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              <span>{searchError}</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Song Suggestions */}
                        {showSuggestions && songSuggestions.length > 0 && !searchError && (
                          <div className="absolute top-full left-0 right-0 bg-white rounded-md shadow-lg mt-1 z-10 max-h-40 overflow-y-auto">
                            {songSuggestions.map((song) => (
                              <button
                                key={song.id}
                                onClick={() => handleAddSongToPlaylist(song)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-gray-800 text-sm border-b last:border-b-0"
                              >
                                <div className="font-medium">{song.name}</div>
                                <div className="text-gray-600 text-xs">{song.artist}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Added Songs */}
                      {playlist.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {playlist.map((song) => (
                            <div key={song.id} className="flex items-center justify-between bg-white/10 rounded-md px-3 py-2">
                              <span className="text-white text-sm flex-1">
                                {song.song_name} - {song.artist_name}
                              </span>
                              <div className="flex items-center gap-2">
                                <a
                                  href={song.spotify_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-400 hover:text-green-300 transition-colors"
                                  title="Open in Spotify"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                                <button
                                  onClick={() => handleRemoveSongFromPlaylist(song.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title="Remove song"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Resource Cards */}
            <div className="space-y-6 animate-slide-up">
              <h2 className="text-2xl font-bold text-primary mb-6">
                Institute Counselling Service Resources
              </h2>
              
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {resourceItems.map((item, index) => (
                  <Card 
                    key={index}
                    className="hover:shadow-elegant transition-all duration-300 border-primary/20 bg-gradient-card"
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full animate-pulse">
                        <item.icon className="h-8 w-8 text-primary animate-bounce" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-primary">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <CardDescription className="mb-4">
                        {item.description}
                      </CardDescription>
                      
                      {item.hasModal ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="resource" className="w-full">
                              Click to access →
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>{item.modalContent?.title}</DialogTitle>
                              <DialogDescription className="text-left">
                                {item.modalContent?.description}
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button 
                                variant="ics" 
                                onClick={() => window.open(item.modalContent?.googleFormUrl, '_blank')}
                                className="w-full"
                              >
                                Open Google Form
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button 
                          variant="resource" 
                          className="w-full"
                          disabled
                        >
                          Coming Soon
                        </Button>
                      )}
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

export default Dashboard;