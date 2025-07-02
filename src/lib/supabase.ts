import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  username: string
  email: string
  full_name: string
  roll_number?: string
  created_at: string
  updated_at: string
}

export interface UserHobbies {
  id: string
  user_id: string
  hobbies: string
  created_at: string
  updated_at: string
}

export interface UserPlaylist {
  id: string
  user_id: string
  song_name: string
  artist_name: string
  spotify_url: string
  spotify_track_id?: string
  created_at: string
}

// Auth functions
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signUpWithEmail = async (email: string, password: string, userData: Partial<User>) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`
    }
  })
  
  if (data.user && !error) {
    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          username: userData.username,
          email: email,
          full_name: userData.full_name || '',
          roll_number: userData.roll_number || '',
        }
      ])
    
    if (profileError) {
      console.error('Error creating user profile:', profileError)
      return { data, error: profileError }
    }
  }
  
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// User functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

// Hobbies functions
export const getUserHobbies = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_hobbies')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  return { data, error }
}

export const updateUserHobbies = async (userId: string, hobbies: string) => {
  const { data, error } = await supabase
    .from('user_hobbies')
    .upsert([
      {
        user_id: userId,
        hobbies: hobbies,
        updated_at: new Date().toISOString(),
      }
    ])
    .select()
  
  return { data, error }
}

// Playlist functions
export const getUserPlaylist = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_playlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const addSongToPlaylist = async (userId: string, song: {
  song_name: string
  artist_name: string
  spotify_url: string
  spotify_track_id?: string
}) => {
  const { data, error } = await supabase
    .from('user_playlists')
    .insert([
      {
        user_id: userId,
        ...song,
      }
    ])
    .select()
  
  return { data, error }
}

export const removeSongFromPlaylist = async (songId: string) => {
  const { error } = await supabase
    .from('user_playlists')
    .delete()
    .eq('id', songId)
  
  return { error }
}

// Spotify search function
export const searchSpotifyTracks = async (query: string) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spotify-search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    if (!response.ok) {
      throw new Error('Failed to search Spotify')
    }
    
    const data = await response.json()
    return { data: data.tracks, error: null }
  } catch (error) {
    console.error('Error searching Spotify:', error)
    return { data: null, error }
  }
}