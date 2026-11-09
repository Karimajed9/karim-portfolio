CREATE TABLE about_profile (
  id BIGSERIAL PRIMARY KEY,
  summary TEXT NOT NULL,
  goals TEXT NOT NULL,
  professional_interests TEXT,
  personal_interests TEXT
);

CREATE TABLE education (
  id BIGSERIAL PRIMARY KEY,
  school VARCHAR(200) NOT NULL,
  city VARCHAR(100),
  degree VARCHAR(300) NOT NULL,
  country VARCHAR(100),
  start_date VARCHAR(20),
  end_date VARCHAR(20),
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE skill (
  id BIGSERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE experience (
  id BIGSERIAL PRIMARY KEY,
  company VARCHAR(200) NOT NULL,
  role VARCHAR(200) NOT NULL,
  start_date VARCHAR(50),
  end_date VARCHAR(50),
  location VARCHAR(200),
  highlights TEXT,
  sort_order INT NOT NULL DEFAULT 0
);
