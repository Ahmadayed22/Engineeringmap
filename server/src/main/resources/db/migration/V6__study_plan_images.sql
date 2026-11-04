-- A picture per roadmap for its home-page card, uploaded by admins and stored here (not on
-- disk: the server's disk is wiped on every deploy). CPE and EE fall back to their bundled
-- pictures until one is uploaded.
--
-- image_version: when the picture last changed (epoch milliseconds), null = no picture. The
-- client puts it in the image URL so browsers can cache each picture forever.

ALTER TABLE study_plans ADD COLUMN image_version bigint;

CREATE TABLE study_plan_images (
    plan         varchar(40) NOT NULL,
    content_type varchar(40) NOT NULL,
    data         bytea NOT NULL,
    CONSTRAINT study_plan_images_pkey PRIMARY KEY (plan),
    CONSTRAINT fk_study_plan_images_plan FOREIGN KEY (plan) REFERENCES study_plans (slug) ON DELETE CASCADE
);
