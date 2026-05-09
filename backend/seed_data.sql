-- Insert test data for kanban endpoints
INSERT INTO public."Company" (id, name) VALUES (1, 'LTI') ON CONFLICT DO NOTHING;

INSERT INTO public."InterviewFlow" (id, description) VALUES (1, 'Standard development process') ON CONFLICT DO NOTHING;

INSERT INTO public."InterviewType" (id, name, description) VALUES 
  (1, 'HR Interview', 'Initial HR screening'),
  (2, 'Technical Interview', 'Technical assessment'),
  (3, 'Manager Interview', 'Cultural fit assessment')
ON CONFLICT DO NOTHING;

INSERT INTO public."InterviewStep" (id, "interviewFlowId", "interviewTypeId", name, "orderIndex") VALUES 
  (1, 1, 1, 'Initial Screening', 1),
  (2, 1, 2, 'Technical Interview', 2),
  (3, 1, 3, 'Manager Interview', 3)
ON CONFLICT DO NOTHING;

INSERT INTO public."Position" (id, "companyId", "interviewFlowId", title, description, status, "isVisible", location, "jobDescription") VALUES 
  (1, 1, 1, 'Software Engineer', 'Full-stack development role', 'Open', true, 'Remote', 'Develop and maintain software applications')
ON CONFLICT DO NOTHING;

INSERT INTO public."Candidate" (id, "firstName", "lastName", email, phone, address) VALUES 
  (1, 'John', 'Doe', 'john.doe@example.com', '555-0001', '123 Main St'),
  (2, 'Jane', 'Smith', 'jane.smith@example.com', '555-0002', '456 Elm St'),
  (3, 'Carlos', 'García', 'carlos.garcia@example.com', '555-0003', '789 Pine St')
ON CONFLICT DO NOTHING;

INSERT INTO public."Employee" (id, "companyId", name, email, role, "isActive") VALUES 
  (1, 1, 'Alice Johnson', 'alice@lti.com', 'Interviewer', true),
  (2, 1, 'Bob Miller', 'bob@lti.com', 'Hiring Manager', true)
ON CONFLICT DO NOTHING;

INSERT INTO public."Application" (id, "positionId", "candidateId", "applicationDate", "currentInterviewStep", notes) VALUES 
  (1, 1, 1, NOW(), 2, 'Progressing well'),
  (2, 1, 2, NOW(), 2, 'Strong candidate'),
  (3, 1, 3, NOW(), 1, 'Under initial screening')
ON CONFLICT DO NOTHING;

INSERT INTO public."Interview" (id, "applicationId", "interviewStepId", "employeeId", "interviewDate", result, score, notes) VALUES 
  (1, 1, 1, 1, NOW(), 'Passed', 85, 'Good communication'),
  (2, 1, 2, 2, NOW(), 'Passed', 90, 'Strong technical skills'),
  (3, 2, 1, 1, NOW(), 'Passed', 88, 'Excellent background'),
  (4, 3, 1, 1, NOW(), 'In Progress', NULL, 'Initial screening ongoing')
ON CONFLICT DO NOTHING;
