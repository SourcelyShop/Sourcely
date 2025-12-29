-- Add premium features columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS banner_url text,
ADD COLUMN IF NOT EXISTS boost_credits int DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_boost_refresh_at timestamptz;

-- Add boost expiration to asset_listings
ALTER TABLE asset_listings
ADD COLUMN IF NOT EXISTS boost_expires_at timestamptz;

-- Add index for username lookups
CREATE INDEX IF NOT EXISTS users_username_idx ON users (username);

-- Add index for boost expiration for faster sorting
CREATE INDEX IF NOT EXISTS asset_listings_boost_expires_at_idx ON asset_listings (boost_expires_at);
