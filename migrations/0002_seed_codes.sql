-- Seed minimal code lists (adjust to your organization)

INSERT INTO company_codes(code, name) VALUES
  ('ABC', 'Acme Base Company')
ON CONFLICT (code) DO NOTHING;

INSERT INTO subsidiary_codes(code, name) VALUES
  ('HQ', 'Headquarters'),
  ('EU', 'Europe'),
  ('US', 'United States')
ON CONFLICT (code) DO NOTHING;

INSERT INTO department_codes(code, name) VALUES
  ('ENG', 'Engineering'),
  ('OPS', 'Operations'),
  ('QMS', 'Quality Management')
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_type_codes(code, name) VALUES
  ('PRO', 'Procedure'),
  ('POL', 'Policy'),
  ('WRK', 'Work Instruction')
ON CONFLICT (code) DO NOTHING;

