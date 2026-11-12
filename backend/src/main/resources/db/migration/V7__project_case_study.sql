-- Case-study fields for projects. Existing Portfolio row becomes the first study.

ALTER TABLE project ADD COLUMN IF NOT EXISTS slug VARCHAR(120);
ALTER TABLE project ADD COLUMN IF NOT EXISTS category_en VARCHAR(120);
ALTER TABLE project ADD COLUMN IF NOT EXISTS category_fr VARCHAR(120);
ALTER TABLE project ADD COLUMN IF NOT EXISTS status_en VARCHAR(80);
ALTER TABLE project ADD COLUMN IF NOT EXISTS status_fr VARCHAR(80);
ALTER TABLE project ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(500);
ALTER TABLE project ADD COLUMN IF NOT EXISTS live_demo_url VARCHAR(500);
ALTER TABLE project ADD COLUMN IF NOT EXISTS role_en VARCHAR(200);
ALTER TABLE project ADD COLUMN IF NOT EXISTS role_fr VARCHAR(200);
ALTER TABLE project ADD COLUMN IF NOT EXISTS overview_en TEXT;
ALTER TABLE project ADD COLUMN IF NOT EXISTS overview_fr TEXT;
ALTER TABLE project ADD COLUMN IF NOT EXISTS problem_en TEXT;
ALTER TABLE project ADD COLUMN IF NOT EXISTS problem_fr TEXT;
ALTER TABLE project ADD COLUMN IF NOT EXISTS architecture_image_url VARCHAR(500);
ALTER TABLE project ADD COLUMN IF NOT EXISTS architecture_caption_en TEXT;
ALTER TABLE project ADD COLUMN IF NOT EXISTS architecture_caption_fr TEXT;
ALTER TABLE project ADD COLUMN IF NOT EXISTS features_en TEXT;
ALTER TABLE project ADD COLUMN IF NOT EXISTS features_fr TEXT;
ALTER TABLE project ADD COLUMN IF NOT EXISTS tradeoffs_en TEXT;
ALTER TABLE project ADD COLUMN IF NOT EXISTS tradeoffs_fr TEXT;
ALTER TABLE project ADD COLUMN IF NOT EXISTS challenges_en TEXT;
ALTER TABLE project ADD COLUMN IF NOT EXISTS challenges_fr TEXT;
ALTER TABLE project ADD COLUMN IF NOT EXISTS testing_en TEXT;
ALTER TABLE project ADD COLUMN IF NOT EXISTS testing_fr TEXT;
ALTER TABLE project ADD COLUMN IF NOT EXISTS gallery_urls TEXT;
ALTER TABLE project ADD COLUMN IF NOT EXISTS lessons_en TEXT;
ALTER TABLE project ADD COLUMN IF NOT EXISTS lessons_fr TEXT;
ALTER TABLE project ADD COLUMN IF NOT EXISTS mark VARCHAR(20);
ALTER TABLE project ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

UPDATE project
SET
  slug = 'personal-portfolio-platform',
  name_en = 'Personal Portfolio Platform',
  name_fr = 'Plateforme de portfolio personnel',
  summary_en = 'Full-stack portfolio with a React/TypeScript SPA, Spring Boot APIs, PostgreSQL, admin editing, and static-first fallbacks.',
  summary_fr = 'Portfolio full-stack avec SPA React/TypeScript, API Spring Boot, PostgreSQL, édition admin et repli statique en premier.',
  tags_en = 'React,TypeScript,Spring Boot,PostgreSQL,Flyway',
  tags_fr = 'React,TypeScript,Spring Boot,PostgreSQL,Flyway',
  href = 'https://github.com/Karimajed9/karim-portfolio',
  category_en = 'Personal project',
  category_fr = 'Projet personnel',
  status_en = 'In progress',
  status_fr = 'En cours',
  live_demo_url = 'https://karimmajed.com',
  role_en = 'Solo full-stack engineer',
  role_fr = 'Ingénieur full-stack solo',
  overview_en = 'A recruiter-ready personal site that also doubles as a learning platform for React, TypeScript, Spring Boot, and free-tier deployment. Content can come from the API when it is up, or from bundled static copy when it is not.',
  overview_fr = 'Un site personnel prêt pour les recruteurs qui sert aussi de plateforme d’apprentissage pour React, TypeScript, Spring Boot et le déploiement gratuit. Le contenu vient de l’API lorsqu’elle est disponible, sinon du contenu statique embarqué.',
  problem_en = 'I needed a bilingual portfolio that stays useful offline or when a free API host is asleep, lets me edit experience and projects without a rebuild, and documents real architecture choices instead of a marketing mockup.',
  problem_fr = 'Il me fallait un portfolio bilingue utile hors ligne ou quand une API gratuite est en veille, éditable sans rebuild, et qui documente de vraies décisions d’architecture plutôt qu’une maquette marketing.',
  architecture_caption_en = 'Browser SPA talks to Spring Boot REST endpoints backed by PostgreSQL and Flyway. Docker Compose runs Postgres, API, and nginx locally. Public frontend targets GitHub Pages; API hosting is scaffolded for Render. Azure Blob, Key Vault, and Application Insights are wired with local fallbacks — paid Azure hosting stays planned.',
  architecture_caption_fr = 'La SPA parle aux endpoints REST Spring Boot, avec PostgreSQL et Flyway. Docker Compose lance Postgres, l’API et nginx en local. Le frontend public vise GitHub Pages ; l’API est préparée pour Render. Azure Blob, Key Vault et Application Insights sont câblés avec des replis locaux — l’hébergement Azure payant reste planifié.',
  features_en = 'React 19 + TypeScript + Vite SPA with dark architectural UI|||Spring Boot REST APIs for about, skills, experience, projects, contact, and content revision|||PostgreSQL schema managed with Flyway migrations|||Session-based admin login with CSRF for content and message management|||Bilingual EN/FR fields for experience, projects, skills, and education|||Contact form with honeypot and per-IP rate limiting|||Static-first public content with localStorage cache when the API is slow or down|||CV PDF slots with local or blob storage fallback|||Docker Compose for local full stack',
  features_fr = 'SPA React 19 + TypeScript + Vite avec UI architecturale sombre|||API REST Spring Boot pour à propos, compétences, expérience, projets, contact et révision de contenu|||Schéma PostgreSQL géré par Flyway|||Connexion admin par session avec CSRF pour le contenu et les messages|||Champs bilingues EN/FR pour expérience, projets, compétences et formation|||Formulaire de contact avec honeypot et limite par IP|||Contenu public statique d’abord avec cache localStorage si l’API est lente ou indisponible|||Emplacements CV PDF avec stockage local ou blob|||Docker Compose pour la stack locale complète',
  tradeoffs_en = 'Static-first fallback keeps the site readable when Render sleeps, at the cost of temporarily stale API copy until refresh|||Free GitHub Pages + Render stays within zero paid cloud, so cold starts and free-DB limits are accepted|||Azure storage and App Insights code paths exist, but production Azure hosting is deferred to avoid paid resources',
  tradeoffs_fr = 'Le repli statique garde le site lisible quand Render dort, au prix d’une copie API temporairement périmée jusqu’au rafraîchissement|||GitHub Pages + Render gratuits évitent le cloud payant, donc cold starts et limites de DB gratuite sont acceptés|||Les chemins Azure storage et App Insights existent, mais l’hébergement Azure de production est reporté pour éviter les ressources payantes',
  challenges_en = 'Keeping EN and FR content editable without duplicating the whole UI stack|||Classifying API warm-up versus true offline so banners stay honest|||Protecting contact without blocking real visitors|||Admin CSRF and session auth that still work from the SPA',
  challenges_fr = 'Garder EN et FR éditables sans dupliquer toute la stack UI|||Distinguer le démarrage à froid de l’API d’une vraie coupure pour des bannières honnêtes|||Protéger le contact sans bloquer les vrais visiteurs|||CSRF admin et session qui fonctionnent depuis la SPA',
  testing_en = 'Frontend: Vitest unit tests. Backend: JUnit with Testcontainers Postgres. GitHub Actions CI on main runs npm test/build and ./mvnw test. Deploy workflows cover GitHub Pages; Render is documented via render.yaml. Paid Azure deploy remains planned, not active in CI.',
  testing_fr = 'Frontend : tests unitaires Vitest. Backend : JUnit avec Postgres Testcontainers. CI GitHub Actions sur main lance npm test/build et ./mvnw test. Les workflows de déploiement couvrent GitHub Pages ; Render est documenté via render.yaml. Le déploiement Azure payant reste planifié, non actif dans la CI.',
  gallery_urls = '',
  lessons_en = 'Ship a useful static baseline before depending on a free API that can sleep|||Treat bilingual content as data columns early if admin editing matters|||Document planned cloud work explicitly so the case study stays honest',
  lessons_fr = 'Livrer une base statique utile avant de dépendre d’une API gratuite qui peut dormir|||Traiter le contenu bilingue comme des colonnes dès que l’édition admin compte|||Documenter clairement le cloud planifié pour garder l’étude de cas honnête',
  mark = 'KM',
  sort_order = 1
WHERE slug IS NULL
   OR name_en IN ('Portfolio', 'Personal Portfolio Platform')
   OR name_en IS NULL;

UPDATE project SET slug = 'project-' || id::text WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS ux_project_slug ON project (slug);

ALTER TABLE project ALTER COLUMN slug SET NOT NULL;
