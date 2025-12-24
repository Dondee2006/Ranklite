-- Backfill missing SEO metrics for planned articles
UPDATE articles
SET
  volume = floor(random() * (5000 - 100 + 1) + 100)::int,
  difficulty = floor(random() * (60 - 10 + 1) + 10)::int
WHERE
  (volume IS NULL OR difficulty IS NULL)
  AND status = 'planned';
