-- Refresh portfolio content from verified CV copy (no schema changes).
-- V3__seed.sql must stay unchanged after apply (Flyway checksum). All CV copy updates live here.

UPDATE about_profile SET
  summary = 'Backend-focused Software Engineer with 5+ years building C#/.NET enterprise systems, Azure integrations, and large-scale SQL data workflows. Experience includes reusable backend frameworks, REST APIs, asynchronous messaging, idempotent financial processing, production troubleshooting, and performance optimization. Fluent in English, French, and Arabic.',
  goals = 'Keep building solid backend systems with C#/.NET, Azure, and SQL.',
  professional_interests = 'Backend Engineering,C# / .NET,Azure Integrations,SQL & Data Workflows,REST APIs & Messaging,Production Reliability';

UPDATE education SET
  city = 'Montréal',
  degree = 'Graduate Diploma in Computer Science',
  start_date = 'September 2020',
  end_date = 'August 2021'
WHERE school = 'Concordia University';

UPDATE education SET
  degree = 'BBA, Management Information Systems',
  start_date = 'September 2016',
  end_date = 'May 2020'
WHERE school = 'American University of Beirut';

DELETE FROM skill;

INSERT INTO skill (category, name, sort_order) VALUES
  ('Languages & Backend', 'C#', 1),
  ('Languages & Backend', 'SQL', 2),
  ('Languages & Backend', 'Java', 3),
  ('Languages & Backend', 'ASP.NET', 4),
  ('Languages & Backend', '.NET Framework', 5),
  ('Languages & Backend', 'REST APIs', 6),
  ('Languages & Backend', 'Spring Boot', 7),
  ('Azure & Integration', 'Azure Functions', 1),
  ('Azure & Integration', 'Logic Apps', 2),
  ('Azure & Integration', 'Azure Web Apps', 3),
  ('Azure & Integration', 'Blob Storage', 4),
  ('Azure & Integration', 'Message queues', 5),
  ('Azure & Integration', 'SFTP', 6),
  ('Azure & Integration', 'Sage APIs', 7),
  ('Data & Reliability', 'SQL Server', 1),
  ('Data & Reliability', 'Stored procedures', 2),
  ('Data & Reliability', 'CSV/Excel ETL', 3),
  ('Data & Reliability', 'Idempotency', 4),
  ('Data & Reliability', 'Application Insights', 5),
  ('Data & Reliability', 'Datadog', 6),
  ('Other', 'JavaScript', 1),
  ('Other', 'Git', 2),
  ('Other', 'Jenkins', 3),
  ('Other', 'Jira', 4),
  ('Other', 'Azure Key Vault', 5),
  ('Other', 'React', 6),
  ('Other', 'TypeScript', 7),
  ('Other', 'PostgreSQL', 8);

DELETE FROM experience;

INSERT INTO experience (company, role, start_date, end_date, location, highlights, sort_order) VALUES
  (
    'Redmane Technology',
    'Software Developer',
    'November 2022',
    'Present',
    'Montréal, QC, Canada',
    'Built a reusable C#/.NET due-date framework with configurable deadlines and compliance rules.|||Implemented caregiver disbursement calculations from placement history, child ages, care levels, service types, and rate schedules.|||Developed Azure Functions integrating case-management and Sage APIs—nightly batches, HTTP-triggered queue workflows, and unique transaction IDs for idempotent sync.|||Added retries, Blob Storage recovery, Application Insights monitoring, and targeted failure notifications.|||Rebuilt deprecated Logic Apps migration workflows processing millions of records with SQL, stored procedures, CSV/Excel, validation, deduplication, and error reports.|||Optimized C# event handlers and nightly API-to-SFTP government reporting exports (thousands of records).',
    1
  ),
  (
    'Wiley Edge / National Bank of Canada',
    'Java Developer',
    'September 2021',
    'September 2022',
    'Montréal, QC, Canada',
    'Delivered 50+ Java features and extensions for an internal customer-service system used by 100+ bank employees.|||Resolved 100+ functional and UI defects.|||Supported sprint delivery and code quality in a 15-person Agile/Scrum team.',
    2
  );

UPDATE project SET
  name = 'Personal Portfolio Platform',
  summary = 'Personal portfolio platform built with Java, Spring Boot, PostgreSQL, React, and TypeScript.',
  tags = 'Java,Spring Boot,PostgreSQL,React,TypeScript'
WHERE name IN ('Portfolio', 'Personal Portfolio Platform');
