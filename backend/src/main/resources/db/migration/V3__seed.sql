INSERT INTO project (name, summary, tags, href)
SELECT
  'Portfolio',
  'Personal site built with React, TypeScript, and Vite.',
  'React,TypeScript,Vite',
  'https://github.com/YOUR_USER/karim-portfolio'
WHERE NOT EXISTS (SELECT 1 FROM project WHERE name = 'Portfolio');

INSERT INTO about_profile (summary, goals, professional_interests, personal_interests) VALUES
  (
    'Full Stack Software Developer with 5+ years of experience building and maintaining enterprise applications. Experienced in C#, .NET, Java, JavaScript, TypeScript, SQL, and REST APIs. Passionate about solving problems, learning new technologies, building quality software, and continuously improving.',
    'My goal is to grow as a well-rounded Software Engineer, take on challenging projects, and build impactful, reliable, and scalable solutions. I strive to continuously improve my technical skills, embrace new technologies, take ownership of my work, and contribute to a team where I can make a meaningful difference.',
    'Software Engineering,Cloud Computing & Azure,Full Stack Development,Learning New Technologies,Problem Solving,Technology & Innovation',
    'Muay Thai,Camping,Hiking,Traveling,Exploring New Places,Technology,Programming'
  );

INSERT INTO education (school, city, degree, country, start_date, end_date, sort_order) VALUES
  (
    'Concordia University',
    'Montreal',
    'Graduate Diploma in Computer Science',
    'Canada',
    '09/01/2020',
    '08/30/2021',
    1
  ),
  (
    'American University of Beirut',
    'Beirut',
    'Bachelor of Business Administration in Management Information Systems',
    'Lebanon',
    '09/01/2016',
    '05/31/2020',
    2
  );

INSERT INTO skill (category, name, sort_order) VALUES
  ('Programming Languages', 'C#', 1),
  ('Programming Languages', 'Java', 2),
  ('Programming Languages', 'TypeScript', 3),
  ('Programming Languages', 'JavaScript', 4),
  ('Programming Languages', 'SQL', 5),
  ('Frontend', 'React', 1),
  ('Frontend', 'HTML', 2),
  ('Frontend', 'CSS', 3),
  ('Frontend', 'Tailwind', 4),
  ('Backend', 'ASP.NET', 1),
  ('Backend', 'Spring Boot', 2),
  ('Backend', 'REST APIs', 3),
  ('Databases', 'PostgreSQL', 1),
  ('Databases', 'SQL Server', 2),
  ('Cloud & DevOps', 'Azure', 1),
  ('Cloud & DevOps', 'Docker', 2),
  ('Cloud & DevOps', 'GitHub Actions', 3),
  ('Tools', 'Git', 1),
  ('Tools', 'Maven', 2),
  ('Tools', 'Vite', 3);

INSERT INTO experience (company, role, start_date, end_date, location, highlights, sort_order) VALUES
  (
    'Redmane Technology',
    'Software Developer',
    'November 2022',
    'Present',
    'Montreal, Canada',
    'Develop and maintain enterprise web applications using C#, ASP.NET, JavaScript, and SQL.|||Implement custom features and integrate external services such as Azure Logic Apps, Azure Functions, and Sage.|||Develop and maintain REST APIs to support application integrations and business requirements.|||Manage deployments across 10+ production environments.|||Troubleshoot production issues, monitor application performance, and improve system reliability using Datadog.|||Collaborate with clients and team members to understand requirements and deliver effective solutions.',
    1
  ),
  (
    'Wilet Edge - Contractor to National Bank of Canada',
    'Java Developer',
    'September 2021',
    'September 2022',
    'Montreal, Canada',
    'Contributed to enterprise software development using Java.|||Worked on application development and maintenance in a financial services environment.|||Collaborated with development teams to implement solutions and support business requirements.',
    2
  );
