-- One row per company (cik) and fiscal year (fy) with an original 10-K:
-- the small table the dashboard's industry and company dropdowns read.
-- Rebuild: duckdb < scripts/build_company_years.sql, then upload
-- data/company_years.parquet to 24601p/sec-data.
COPY (
  WITH annual AS (
    SELECT cik, fy, arg_max(name, filed) AS name, arg_max(sic, filed) AS sic,
           arg_max(revenues, filed) AS revenues, arg_max(reporting_uom, filed) AS reporting_uom
    FROM 'https://huggingface.co/datasets/24601p/sec-data/resolve/main/fundamental_accounting_concepts_by_name.parquet'
    WHERE fp = 'FY' AND form NOT LIKE '%/A' AND fy IS NOT NULL
    GROUP BY cik, fy
  ),
  tickers AS (
    SELECT cik, upper(arg_min(ticker, rn)) AS ticker
    FROM (SELECT *, row_number() OVER () AS rn
          FROM read_csv('https://huggingface.co/datasets/24601p/sec-data/resolve/main/lookups/ticker.csv',
                 header = false, delim = '\t', columns = {'ticker': 'VARCHAR', 'cik': 'INTEGER'}))
    GROUP BY cik
  ),
  sic AS (
    SELECT s.sic, s.industry_title,
           lpad((s.sic // 10)::VARCHAR, 3, '0') AS industry_group, ig.Description AS industry_group_description,
           lpad((s.sic // 100)::VARCHAR, 2, '0') AS major_group, mg.Description AS major_group_description
    FROM read_csv('https://huggingface.co/datasets/24601p/sec-data/resolve/main/lookups/SICcodes.csv',
           header = false, columns = {'sic': 'INTEGER', 'sec_office': 'VARCHAR', 'industry_title': 'VARCHAR'}) s
    LEFT JOIN read_csv('https://huggingface.co/datasets/24601p/sec-data/resolve/main/lookups/major-groups.csv', all_varchar = true) mg
      ON mg.MajorGroup = lpad((s.sic // 100)::VARCHAR, 2, '0')
    LEFT JOIN read_csv('https://huggingface.co/datasets/24601p/sec-data/resolve/main/lookups/industry-groups.csv', all_varchar = true) ig
      ON ig.IndustryGroup = lpad((s.sic // 10)::VARCHAR, 3, '0')
  )
  SELECT a.cik, a.fy, a.name, t.ticker, a.sic,
         s.industry_title, s.industry_group, s.industry_group_description, s.major_group, s.major_group_description,
         a.revenues, a.reporting_uom
  FROM annual a
  LEFT JOIN tickers t USING (cik)
  LEFT JOIN sic s USING (sic)
  ORDER BY a.fy, a.name
) TO 'data/company_years.parquet' (FORMAT parquet, COMPRESSION zstd);
