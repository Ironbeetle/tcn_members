-- Pre-push enum migration helper
-- Purpose: remap deprecated enum values before running `npx prisma db push`
-- Prerequisite: replacement enum values already exist in the DB enum types.
--
-- Deprecations handled:
-- - Categories.PUBLIC_WORKS -> COMMUNITY_INFRASTRUCTURE
-- - FormCategory.IRON_NORTH -> RESOURCE_MGMT_BOARD

-- Remap bulletin categories in portal and comm schemas.
UPDATE tcnbulletin.bulletin
SET category = 'COMMUNITY_INFRASTRUCTURE'
WHERE category::text = 'PUBLIC_WORKS';

UPDATE msgmanager."BulletinApiLog"
SET category = 'COMMUNITY_INFRASTRUCTURE'
WHERE category::text = 'PUBLIC_WORKS';

-- Remap form categories in portal and comm schemas.
UPDATE tcnbulletin.fillable_form
SET category = 'RESOURCE_MGMT_BOARD'
WHERE category::text = 'IRON_NORTH';

UPDATE tcnbulletin.signup_form
SET category = 'RESOURCE_MGMT_BOARD'
WHERE category::text = 'IRON_NORTH';

UPDATE msgmanager."SignUpForm"
SET category = 'RESOURCE_MGMT_BOARD'
WHERE category::text = 'IRON_NORTH';

-- Then run:
-- npx prisma db push
