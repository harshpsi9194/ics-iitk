/*
  # Create user hobbies table

  1. New Tables
    - `user_hobbies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `hobbies` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_hobbies` table
    - Add policy for authenticated users to manage their own hobbies
*/

CREATE TABLE IF NOT EXISTS user_hobbies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  hobbies text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_hobbies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own hobbies"
  ON user_hobbies
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own hobbies"
  ON user_hobbies
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own hobbies"
  ON user_hobbies
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own hobbies"
  ON user_hobbies
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());