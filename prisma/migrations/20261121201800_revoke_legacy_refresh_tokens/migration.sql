-- Remove legacy refresh tokens stored in plaintext.
-- Users will need to log in again after this migration.
DELETE FROM "refresh_tokens";