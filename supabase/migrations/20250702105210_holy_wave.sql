/*
  # Create user playlists table

  1. New Tables
    - `user_playlists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `song_name` (text)
      - `artist_name` (text)
      - `spotify_url` (text)
      - `spotify_track_id` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `user_playlists` table
    - Add policy for authenticated users to manage their own playlists
*/

CREATE TABLE IF NOT EXISTS user_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  song_name text NOT NULL,
  artist_name text NOT NULL,
  spotify_url text NOT NULL,
  spotify_track_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own playlist"
  ON user_playlists
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own playlist items"
  ON user_playlists
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own playlist items"
  ON user_playlists
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());