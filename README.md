# SEC Fundamental Accounting Concepts

One row per 10-K / 10-Q filing in the SEC
[Financial Statement and Notes data sets](https://www.sec.gov/dera/data/financial-statement-and-notes-data-sets),
2009–2026: 397,225 filings from 14,755 companies. The ~200,000 XBRL tags US
filers use are normalised into ~60 comparable *fundamental accounting
concepts* (Charles Hoffman's "Seattle Method"), imputed according to each
filing's detected reporting style, plus accounting-identity check columns.

## Contents

| path | what |
|---|---|
| `datasets/sec_fac/fac.malloy` | Malloy source `fac` — every column public and documented |
| `datasets/sec_fac/index.malloy` | dataset entry point for malloyyo |

The data (93 columns, ~54 MB parquet) is hosted on Hugging Face in
[24601p/sec-data](https://huggingface.co/datasets/24601p/sec-data), and the
Malloy source reads it straight from there:

```
https://huggingface.co/datasets/24601p/sec-data/resolve/main/fundamental_accounting_concepts_by_name.parquet
```

## Things to know

- Income statement and cash flow values are **fiscal year-to-date** (Q2 = 6 months). Use `fp = 'FY'` for annual figures.
- Amounts are in `reporting_uom` (99.8% USD).
- NULL means the filing's reporting style does not present that concept, not zero.
- `*_check` columns are identity residuals; 0 means the identity holds.
- Forms ending `/A` are amendments of earlier filings.
