const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  external_urls: { spotify: string }
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
  }
}

async function getSpotifyAccessToken(): Promise<string> {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID')
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET')
  
  console.log('Checking Spotify credentials...')
  console.log('Client ID exists:', !!clientId)
  console.log('Client Secret exists:', !!clientSecret)
  
  if (!clientId || !clientSecret) {
    console.error('Missing Spotify credentials')
    throw new Error('Spotify credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.')
  }

  console.log('Requesting Spotify access token...')
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Spotify token request failed:', response.status, errorText)
    throw new Error(`Failed to get Spotify access token: ${response.status}`)
  }

  const data = await response.json()
  console.log('Successfully obtained Spotify access token')
  return data.access_token
}

async function searchSpotifyTracks(query: string, accessToken: string): Promise<SpotifyTrack[]> {
  console.log('Searching Spotify for:', query)
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Spotify search failed:', response.status, errorText)
    throw new Error(`Spotify search failed: ${response.status}`)
  }

  const data: SpotifySearchResponse = await response.json()
  console.log('Found', data.tracks.items.length, 'tracks')
  return data.tracks.items
}

Deno.serve(async (req) => {
  console.log('Spotify search function called:', req.method, req.url)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const query = url.searchParams.get('q')

    if (!query) {
      console.error('Missing query parameter')
      return new Response(
        JSON.stringify({ error: 'Query parameter "q" is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const accessToken = await getSpotifyAccessToken()
    const tracks = await searchSpotifyTracks(query, accessToken)

    const formattedTracks = tracks.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist',
      spotifyUrl: track.external_urls.spotify
    }))

    console.log('Returning', formattedTracks.length, 'formatted tracks')
    return new Response(
      JSON.stringify({ tracks: formattedTracks }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in spotify-search function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to search Spotify',
        details: 'Check function logs for more information'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})