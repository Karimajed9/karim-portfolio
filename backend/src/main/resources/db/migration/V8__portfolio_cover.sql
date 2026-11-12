-- Bundled SPA cover for Personal Portfolio Platform (served from frontend/public).
UPDATE project
SET cover_image_url = 'projects/portfolio-cover.png'
WHERE slug = 'personal-portfolio-platform'
   AND (cover_image_url IS NULL OR cover_image_url = '');
