-- Split content text into EN/FR columns. Existing single-language values move into EN.

ALTER TABLE experience RENAME COLUMN company TO company_en;
ALTER TABLE experience RENAME COLUMN role TO role_en;
ALTER TABLE experience RENAME COLUMN location TO location_en;
ALTER TABLE experience RENAME COLUMN highlights TO highlights_en;
ALTER TABLE experience ADD COLUMN company_fr VARCHAR(200);
ALTER TABLE experience ADD COLUMN role_fr VARCHAR(200);
ALTER TABLE experience ADD COLUMN location_fr VARCHAR(200);
ALTER TABLE experience ADD COLUMN highlights_fr TEXT;

ALTER TABLE project RENAME COLUMN name TO name_en;
ALTER TABLE project RENAME COLUMN summary TO summary_en;
ALTER TABLE project RENAME COLUMN tags TO tags_en;
ALTER TABLE project ADD COLUMN name_fr VARCHAR(200);
ALTER TABLE project ADD COLUMN summary_fr TEXT;
ALTER TABLE project ADD COLUMN tags_fr VARCHAR(500);

ALTER TABLE skill RENAME COLUMN category TO category_en;
ALTER TABLE skill RENAME COLUMN name TO name_en;
ALTER TABLE skill ADD COLUMN category_fr VARCHAR(100);
ALTER TABLE skill ADD COLUMN name_fr VARCHAR(100);

ALTER TABLE education RENAME COLUMN school TO school_en;
ALTER TABLE education RENAME COLUMN city TO city_en;
ALTER TABLE education RENAME COLUMN degree TO degree_en;
ALTER TABLE education RENAME COLUMN country TO country_en;
ALTER TABLE education ADD COLUMN school_fr VARCHAR(200);
ALTER TABLE education ADD COLUMN city_fr VARCHAR(100);
ALTER TABLE education ADD COLUMN degree_fr VARCHAR(300);
ALTER TABLE education ADD COLUMN country_fr VARCHAR(100);
