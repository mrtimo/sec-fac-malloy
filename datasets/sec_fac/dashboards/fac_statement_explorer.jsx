import React from "react";
import { useQuery, useUrlState, VegaChart } from "@malloyyo/dashboard";

const PRESETS = [
  { cik: 320193, fy: "2024", label: "AAPL · Apple: multi-step commercial income statement" },
  { cik: 19617, fy: "2024", label: "JPM · JPMorgan Chase: bank (no gross profit, unclassified BS)" },
  { cik: 80661, fy: "2024", label: "PGR · Progressive: insurer" },
  { cik: 34088, fy: "2024", label: "XOM · Exxon Mobil: costs-and-expenses income statement" },
  { cik: 1326160, fy: "2024", label: "DUK · Duke Energy: regulated utility" },
  { cik: 1063761, fy: "2024", label: "SPG · Simon Property Group: REIT" },
  { cik: 37996, fy: "2025", label: "F · Ford: net loss year" },
  { cik: 47217, fy: "2024", label: "HPQ · HP Inc: negative stockholders' equity" },
  { cik: 1065280, fy: "2024", label: "NFLX · Netflix: high-growth media" },
  { cik: 78003, fy: "2021", label: "PFE · Puzzle: Pfizer FY2021 (an identity the style can't close)" },
  { cik: 355019, fy: "2014", label: "FONR · Puzzle: Fonar FY2014 (balance sheet doesn't balance)" },
];

const PEER_LEVELS = {
  sic: { label: "Same SEC industry (4-digit SIC)" },
  group: { label: "Same industry group (3-digit)" },
  major: { label: "Same major group (2-digit)" },
};
const PEER_SORTS = {
  assets_m: "Total assets",
  revenue_m: "Revenue",
  gross_margin: "Gross margin",
  net_margin: "Net margin",
  roa: "Return on assets",
  liabilities_to_equity: "Liabilities to equity",
  n_failed: "Identities failing",
};
const PEER_LIMITS = [10, 25, 50];

const IS_LINES = [
  { f: "revenues", l: "Revenues" },
  { f: "cost_of_revenue", l: "Cost of revenue", neg: true },
  { f: "gross_profit", l: "Gross profit", sub: true, quiz: true },
  { f: "interest_and_dividend_income_operating", l: "Interest and dividend income" },
  { f: "interest_expense_operating", l: "Interest expense", neg: true },
  { f: "interest_income_expense_net", l: "Net interest income", sub: true, quiz: true },
  { f: "provision_for_loan_lease_losses", l: "Provision for loan losses", neg: true },
  { f: "interest_income_after_provision", l: "Net interest income after provision", sub: true },
  { f: "noninterest_income", l: "Noninterest income" },
  { f: "noninterest_expense", l: "Noninterest expense", neg: true },
  { f: "operating_and_nonoperating_revenues", l: "Operating and nonoperating revenues" },
  { f: "operating_and_nonoperating_costs", l: "Operating and nonoperating costs", neg: true },
  { f: "costs_and_expenses", l: "Costs and expenses", neg: true },
  { f: "operating_expenses", l: "Operating expenses", neg: true },
  { f: "other_operating_income", l: "Other operating income" },
  { f: "operating_income_loss", l: "Operating income (loss)", sub: true, quiz: true },
  { f: "nonoperating_income_loss", l: "Nonoperating income (loss)" },
  { f: "income_loss_from_equity_method_investments", l: "Equity-method investment income" },
  { f: "income_loss_before_tax", l: "Income (loss) before income taxes", sub: true, quiz: true },
  { f: "income_tax_expense_benefit", l: "Income tax expense (benefit)", neg: true },
  { f: "income_loss_after_tax", l: "Income (loss) from continuing operations", sub: true },
  { f: "discontinued_operations", l: "Discontinued operations, net of tax" },
  { f: "extraordinary_items", l: "Extraordinary items" },
  { f: "net_income_loss", l: "Net income (loss)", sub: true, total: true, quiz: true },
  { f: "net_income_loss_nci", l: "  Attributable to noncontrolling interest", ind: true },
  { f: "net_income_loss_parent", l: "  Attributable to parent", ind: true },
  { f: "preferred_stock_dividends", l: "Preferred dividends", neg: true },
  { f: "net_income_available_to_common", l: "Net income available to common", sub: true },
  { f: "other_comprehensive_income", l: "Other comprehensive income (loss)" },
  { f: "comprehensive_income", l: "Comprehensive income (loss)", sub: true, quiz: true },
];
const BS_LINES = [
  { f: "current_assets", l: "Current assets" },
  { f: "noncurrent_assets", l: "Noncurrent assets" },
  { f: "assets", l: "Total assets", sub: true, total: true },
  { f: "current_liabilities", l: "Current liabilities" },
  { f: "noncurrent_liabilities", l: "Noncurrent liabilities" },
  { f: "liabilities", l: "Total liabilities", sub: true, quiz: true },
  { f: "commitments_and_contingencies", l: "Commitments and contingencies" },
  { f: "temporary_equity", l: "Temporary (mezzanine) equity" },
  { f: "redeemable_nci", l: "Redeemable noncontrolling interest" },
  { f: "equity_parent", l: "  Equity attributable to parent", ind: true },
  { f: "equity_nci", l: "  Noncontrolling interest", ind: true },
  { f: "equity", l: "Total equity", sub: true, quiz: true },
  { f: "liabilities_and_equity", l: "Total liabilities and equity", sub: true, total: true, quiz: true },
];
const CF_LINES = [
  { f: "net_cash_flows_operating", l: "Operating activities" },
  { f: "net_cash_flows_investing", l: "Investing activities" },
  { f: "net_cash_flows_financing", l: "Financing activities" },
  { f: "exchange_gains_losses", l: "Effect of exchange rates" },
  { f: "net_cash_flow", l: "Net change in cash", sub: true, total: true, quiz: true },
];

const CHECKS = [
  { id: "bs1", rule: "Equity = Parent equity + Noncontrolling interest" },
  { id: "bs2", rule: "Assets = Liabilities and equity" },
  { id: "bs3", rule: "Assets = Current assets + Noncurrent assets" },
  { id: "bs4", rule: "Liabilities = Current liabilities + Noncurrent liabilities" },
  { id: "bs5", rule: "Liabilities and equity = Liabilities + Commitments + Temporary equity + Equity" },
  { id: "is1", rule: "Top of the income statement (e.g. Gross profit = Revenues − Cost of revenue)" },
  { id: "is2", rule: "Operating income = the style's operating roll-up" },
  { id: "is4", rule: "Income before tax = Operating income + Nonoperating income (or style equivalent)" },
  { id: "is5", rule: "Income after tax = Income before tax − Income tax" },
  { id: "is6", rule: "Net income = Continuing operations + Discontinued + Extraordinary" },
  { id: "is7", rule: "Net income = Attributable to parent + Attributable to NCI" },
  { id: "is8", rule: "Net income to common = Net income to parent − Preferred dividends" },
  { id: "is9", rule: "Comprehensive income = Parent + NCI" },
  { id: "is10", rule: "Comprehensive income = Net income + Other comprehensive income" },
  { id: "cf1", rule: "Net change in cash = Operating + Investing + Financing + FX" },
  { id: "cf2", rule: "Net change in cash = Continuing + Discontinued + FX" },
  { id: "cf3", rule: "Discontinued cash flow = its operating + investing + financing parts" },
  { id: "cf4", rule: "Operating cash flow = Continuing + Discontinued" },
];

const STYLE_NOTES = {
  SPEC6: "Multi-step commercial: revenues, cost of revenue, gross profit, then operating expenses down to operating income.",
  SPEC1: "Single-step commercial: costs and expenses reported in one block with no gross profit line.",
  SPEC2: "Commercial with operating income but no gross profit subtotal.",
  SPEC2A: "Variant of SPEC2.",
  SPEC2_IEMIT: "Variant of SPEC2 with equity-method income placed differently.",
  SPEC9: "Commercial style detected with low confidence; treat imputed subtotals with care.",
  SPEC6_SCI2: "Multi-step commercial with a separate comprehensive income statement.",
  INTBX: "Bank: net interest income, provision for loan losses, noninterest income and expense. Unclassified balance sheet (no current/noncurrent split).",
  INSBX: "Insurer: unclassified balance sheet; revenues and costs follow insurance presentation, so many commercial concepts are absent.",
  IS3: "Revenues and costs reported as combined operating and nonoperating lines (no operating income).",
  IS4: "Costs and expenses deducted from total revenues to reach income before tax (common for energy companies).",
  IS6: "Income statement roll-up without an operating income line.",
  IS8: "Another roll-up variant without an operating income line.",
};

const box = {
  border: "1px solid var(--dash-border)", borderRadius: "var(--dash-radius, 8px)", padding: "6px 8px",
  background: "var(--dash-control-bg)", color: "var(--dash-fg)", font: "inherit",
};
const lbl = { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--dash-muted)" };
const note = { fontSize: 13, color: "var(--dash-muted)", margin: "0 0 12px" };
const h2 = { fontSize: 17, fontWeight: 600, margin: "32px 0 8px" };
const card = { border: "1px solid var(--dash-border)", borderRadius: "var(--dash-radius, 8px)", padding: 16, background: "var(--dash-panel-bg)", color: "#1f2328" };

// 391035000000, "USD" -> "$391.0B"; other currencies keep their ISO code.
function compactMoney(v, uom) {
  const n = Number(v);
  const a = Math.abs(n);
  const [d, s] = a >= 1e12 ? [1e12, "T"] : a >= 1e9 ? [1e9, "B"] : a >= 1e6 ? [1e6, "M"] : a >= 1e3 ? [1e3, "K"] : [1, ""];
  const prefix = !uom || uom === "USD" ? "$" : `${uom} `;
  return `${n < 0 ? "−" : ""}${prefix}${(a / d).toFixed(d === 1 ? 0 : 1)}${s}`;
}

function Status({ q }) {
  if (q.loading) return <p style={note}>Loading…</p>;
  if (q.error) return <p style={{ color: "var(--dash-danger)" }}>{String(q.error.message || q.error)}</p>;
  return null;
}

export default function Dashboard() {
  const [cik, setCik] = useUrlState("cik", 320193);
  const [fy, setFy] = useUrlState("fy", "2024");
  const [quiz, setQuiz] = useUrlState("quiz", false);
  const [revealed, setRevealed] = React.useState({});
  const [majorGroup, setMajorGroup] = useUrlState("mg", "");
  const [industryGroup, setIndustryGroup] = useUrlState("ig", "");
  const [peerLevel, setPeerLevel] = useUrlState("peers", "group");
  const [peerSort, setPeerSort] = useUrlState("psort", "assets_m");
  const [peerN, setPeerN] = useUrlState("pn", 10);

  const c = Math.trunc(Number(cik)) || 320193;
  const y = /^\d{4}$/.test(String(fy)) ? String(fy) : "2024";
  const mg = /^\d{2}$/.test(String(majorGroup)) ? String(majorGroup) : "";
  const ig = /^\d{3}$/.test(String(industryGroup)) && String(industryGroup).startsWith(mg) ? String(industryGroup) : "";
  const pl = PEER_LEVELS[peerLevel] ? peerLevel : "group";
  const ps = PEER_SORTS[peerSort] ? peerSort : "assets_m";
  const pn = PEER_LIMITS.includes(Number(peerN)) ? Number(peerN) : 10;

  // Industry and company pickers read company_years (one small row per company
  // with an original 10-K for the fiscal year) rather than scanning fac.
  const majors = useQuery({ malloy: `run: company_years -> {
  where: fy = '${y}', major_group is not null
  group_by: code is major_group
  aggregate:
    label is major_group_description.max()
    n is companies
  order_by: code
}` });
  const groups = useQuery({ malloy: mg ? `run: company_years -> {
  where: fy = '${y}', major_group = '${mg}'
  group_by: code is industry_group
  aggregate:
    label is industry_group_description.max()
    sec_title is industry_title.min()
    n is companies
  order_by: code
}` : null });
  // Every year has 5,000+ filers, over useQuery's 5,000-row limit, so the full
  // list is fetched as two halves split on name and merged.
  const industryCond = ig ? `, industry_group = '${ig}'` : mg ? `, major_group = '${mg}'` : "";
  const companyQuery = (half) => `run: company_years -> {
  where: fy = '${y}'${industryCond}, ${half}
  select:
    cik
    company is name
    tk is ticker
    rev is revenues
    uom is reporting_uom
  order_by: company
}`;
  const companiesAL = useQuery({ malloy: companyQuery("name < 'M'") });
  const companiesMZ = useQuery({ malloy: companyQuery("name >= 'M'") });
  const companyList = [];
  const seen = new Set();
  for (const row of [...(companiesAL.rows || []), ...(companiesMZ.rows || [])]) {
    const k = Number(row.cik);
    if (!seen.has(k)) { seen.add(k); companyList.push(row); }
  }
  const companiesLoading = companiesAL.loading || companiesMZ.loading;
  const companiesError = companiesAL.error || companiesMZ.error;
  const companiesTruncated = companiesAL.truncated || companiesMZ.truncated;

  const info = useQuery({ malloy: `run: fac -> {
  where: cik = ${c}, fy = '${y}', fp = 'FY', not is_amendment
  select:
    tk is ticker.ticker
    all_tk is ticker.all_tickers
    sic_code is sic
    industry_title is industry.industry_title
    industry_group is industry.industry_group
    industry_group_desc is industry.industry_group_description
    major_group is industry.major_group
    major_group_desc is industry.major_group_description
    division is industry.division
    division_desc is industry.division_description
    sec_office is industry.sec_office
  limit: 1
}` });
  const inf = (info.rows && info.rows[0]) || null;

  const digits = (v) => String(v ?? "").replace(/[^0-9]/g, "");
  let peerCond = null;
  if (inf) {
    if (pl === "sic" && digits(inf.sic_code)) peerCond = `sic = ${digits(inf.sic_code)}`;
    if (pl === "group" && digits(inf.industry_group)) peerCond = `industry.industry_group = '${digits(inf.industry_group)}'`;
    if (pl === "major" && digits(inf.major_group)) peerCond = `industry.major_group = '${digits(inf.major_group)}'`;
  }
  const RT = "greatest(1, 0.00001 * abs(coalesce(assets, 0)))";
  const peers = useQuery({ malloy: peerCond ? `run: fac -> {
  where: fp = 'FY', fy = '${y}', not is_amendment, reporting_uom = 'USD', ${peerCond}
  group_by: cik
  aggregate:
    company is name.max()
    tk is ticker.ticker.max()
    ind is industry.industry_title.max()
    style_x is style.max()
    rev is revenues.max()
    ni is net_income_loss.max()
    ta is assets.max()
    eq is equity.max()
    gp is gross_profit.max()
    tl is liabilities.max()
    nf is max(${CHECKS.map((k) => `(pick 1 when abs(${k.id}_check) > ${RT} else 0)`).join(" + ")})
} -> {
  select:
    cik, company, tk, ind, style_x
    revenue_m is rev / 1e6
    assets_m is ta / 1e6
    gross_margin is 100 * gp / nullif(rev, 0)
    net_margin is 100 * ni / nullif(rev, 0)
    roa is 100 * ni / nullif(ta, 0)
    liabilities_to_equity is tl / nullif(eq, 0)
    n_failed is nf
} -> {
  where: ${ps} is not null
  select: *
  order_by: ${ps} desc
  limit: ${pn}
}` : null });

  const years = useQuery({ malloy: `run: fac -> {
  where: cik = ${c}, fp = 'FY', not is_amendment
  group_by: fy
  aggregate: company is name.max()
  order_by: fy desc
}` });

  const filing = useQuery({ malloy: `run: fac -> {
  where: cik = ${c}, fy = '${y}', fp = 'FY', not is_amendment
  select: *
  order_by: filed desc
  limit: 1
}` });

  const trend = useQuery({ malloy: `run: fac -> {
  where: cik = ${c}, fp = 'FY', not is_amendment
  group_by: fy
  aggregate:
    rev is revenues.max()
    ni is net_income_loss.max()
    ocf is net_cash_flows_operating.max()
    ta is assets.max()
    eq is equity.max()
    gp is gross_profit.max()
    oi is operating_income_loss.max()
    ca is current_assets.max()
    cl is current_liabilities.max()
    tl is liabilities.max()
} -> {
  select:
    fy
    revenue_m is rev / 1e6
    net_income_m is ni / 1e6
    operating_cf_m is ocf / 1e6
    gross_margin is 100 * gp / nullif(rev, 0)
    operating_margin is 100 * oi / nullif(rev, 0)
    net_margin is 100 * ni / nullif(rev, 0)
    roa is 100 * ni / nullif(ta, 0)
    roe is 100 * ni / nullif(eq, 0)
    current_ratio is ca / nullif(cl, 0)
    liabilities_to_equity is tl / nullif(eq, 0)
    accruals_to_assets is 100 * (ni - ocf) / nullif(ta, 0)
  order_by: fy
}` });

  const r = (filing.rows && filing.rows[0]) || null;
  const yearList = (years.rows || []).map((x) => String(x.fy));
  const companyName = (years.rows && years.rows[0] && String(years.rows[0].company)) || "";

  React.useEffect(() => { setRevealed({}); }, [c, y, quiz]);

  const scale = r && Math.abs(Number(r.assets || 0)) >= 1e9 ? 1e6 : 1e3;
  const unit = scale === 1e6 ? "$ millions" : "$ thousands";
  const fmt = (v) => {
    if (v == null) return "—";
    const n = Number(v) / scale;
    const s = Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
    return n < 0 ? `(${s})` : s;
  };

  function Statement({ title, lines }) {
    const shown = lines.filter((x) => r && r[x.f] != null);
    return (
      <div style={card}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
        {shown.length === 0 ? <div style={{ fontSize: 13, color: "#57606a" }}>Not reported in this style.</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <tbody>
              {shown.map((x) => {
                const hidden = quiz && x.quiz && !revealed[x.f];
                return (
                  <tr key={x.f}>
                    <td style={{ padding: "4px 0", paddingLeft: x.ind ? 16 : 0, fontWeight: x.sub ? 600 : 400,
                      borderTop: x.sub ? "1px solid #d0d7de" : "none", color: x.ind ? "#57606a" : "inherit" }}>{x.l.trim()}
                      <span style={{ fontSize: 11, color: "#8c959f", marginLeft: 6, fontFamily: "ui-monospace, monospace" }}>{x.f}</span>
                    </td>
                    <td style={{ padding: "4px 0", textAlign: "right", fontWeight: x.sub ? 600 : 400, whiteSpace: "nowrap",
                      borderTop: x.sub ? "1px solid #d0d7de" : "none", borderBottom: x.total ? "3px double #57606a" : "none" }}>
                      {hidden ? (
                        <button type="button" onClick={() => setRevealed((p) => ({ ...p, [x.f]: true }))}
                          style={{ border: "1px dashed #8c959f", background: "#f6f8fa", borderRadius: 4, padding: "1px 10px", cursor: "pointer", font: "inherit" }}>
                          ? reveal
                        </button>
                      ) : fmt(r[x.f])}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  const checks = r ? CHECKS.filter((k) => r[`${k.id}_check`] != null) : [];
  const roundTol = r ? Math.max(1, 0.00001 * Math.abs(Number(r.assets || 0))) : 1;
  const state = (d) => (Math.abs(d) <= 1 ? "ok" : Math.abs(d) <= roundTol ? "round" : "fail");
  const failing = checks.filter((k) => state(Number(r[`${k.id}_check`])) === "fail").length;
  const tr = trend.rows || [];
  const p1 = (v, d = 1) => (v == null || !isFinite(Number(v)) ? "—" : Number(v).toFixed(d));

  const trendSpec = {
    height: 240, width: "container",
    transform: [{ fold: ["revenue_m", "net_income_m", "operating_cf_m"], as: ["key", "value"] },
      { filter: "datum.value != null" },
      { calculate: "{revenue_m:'Revenues',net_income_m:'Net income',operating_cf_m:'Operating cash flow'}[datum.key]", as: "Concept" }],
    mark: { type: "line", point: true, tooltip: true },
    encoding: {
      x: { field: "fy", type: "ordinal", title: "Fiscal year" },
      y: { field: "value", type: "quantitative", title: "$ millions" },
      color: { field: "Concept", type: "nominal", sort: ["Revenues", "Net income", "Operating cash flow"] },
    },
  };

  const ratioDefs = [
    ["gross_margin", "Gross margin %", "Gross profit ÷ Revenues"],
    ["operating_margin", "Operating margin %", "Operating income ÷ Revenues"],
    ["net_margin", "Net margin %", "Net income ÷ Revenues"],
    ["roa", "Return on assets %", "Net income ÷ Assets (year-end)"],
    ["roe", "Return on equity %", "Net income ÷ Equity (year-end)"],
    ["current_ratio", "Current ratio", "Current assets ÷ Current liabilities", 2],
    ["liabilities_to_equity", "Liabilities to equity", "Liabilities ÷ Equity", 2],
    ["accruals_to_assets", "Accruals % of assets", "(Net income − Operating cash flow) ÷ Assets"],
  ];
  const recent = tr.slice(-6);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto", color: "var(--dash-fg)", fontFamily: "var(--dash-font)" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 4px" }}>Financial statements through the Fundamental Accounting Concepts</h1>
      <p style={{ ...note, fontSize: 14, maxWidth: 900 }}>
        Pick any SEC registrant and fiscal year to see its 10-K restated in Charles Hoffman's Fundamental Accounting Concepts:
        the same ~60 concepts for every company, with the accounting identities that tie them together checked line by line.
        Turn on practice mode to hide subtotals so students can work them out from the identities.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", padding: 16, margin: "16px 0 8px",
        background: "var(--dash-controls-bg)", borderRadius: "var(--dash-radius, 8px)", border: "1px solid var(--dash-border)" }}>
        <label style={lbl}>Teaching examples
          <select style={{ ...box, maxWidth: 360 }} value=""
            onChange={(e) => { const p = PRESETS[Number(e.target.value)]; if (p) { setCik(p.cik); setFy(p.fy); setMajorGroup(""); setIndustryGroup(""); } }}>
            <option value="">Choose an example…</option>
            {PRESETS.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
          </select>
        </label>
        <label style={lbl}>Industry (2-digit major group)
          <select style={{ ...box, maxWidth: 260 }} value={mg}
            onChange={(e) => { setMajorGroup(e.target.value); setIndustryGroup(""); }}>
            <option value="">All industries</option>
            {(majors.rows || []).map((m) => (
              <option key={String(m.code)} value={String(m.code)}>{`${m.code} · ${m.label || "Unnamed"} (${m.n})`}</option>
            ))}
          </select>
        </label>
        <label style={lbl}>Industry group (3-digit)
          <select style={{ ...box, maxWidth: 260 }} value={ig} disabled={!mg}
            onChange={(e) => setIndustryGroup(e.target.value)}>
            <option value="">{mg ? "All groups in this industry" : "Pick an industry first"}</option>
            {(groups.rows || []).map((g) => (
              <option key={String(g.code)} value={String(g.code)}>{`${g.code} · ${g.label || String(g.sec_title || "").toLowerCase()} (${g.n})`}</option>
            ))}
          </select>
        </label>
        <label style={lbl}>Company
          <select style={{ ...box, maxWidth: 320 }} value={seen.has(c) ? String(c) : ""}
            onChange={(e) => { if (e.target.value) setCik(Number(e.target.value)); }}>
            <option value="">
              {companiesLoading ? "Loading companies…" : companiesError ? "Couldn't load companies" : `Choose a company (${companyList.length.toLocaleString()})…`}
            </option>
            {companyList.map((m) => (
              <option key={String(m.cik)} value={String(m.cik)}>
                {`${m.tk ? `${m.tk} · ` : ""}${m.company}${m.rev == null ? "" : ` (${compactMoney(m.rev, m.uom)})`}`}
              </option>
            ))}
          </select>
        </label>
        <label style={lbl}>Fiscal year
          <select style={box} value={y} onChange={(e) => setFy(e.target.value)}>
            {(yearList.includes(y) ? yearList : [y, ...yearList]).map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label style={{ ...lbl, flexDirection: "row", alignItems: "center", gap: 6, paddingBottom: 8 }}>
          <input type="checkbox" checked={!!quiz} onChange={(e) => setQuiz(e.target.checked)} />
          Practice mode (hide subtotals)
        </label>
      </div>

      {companiesError ? <p style={{ color: "var(--dash-danger)" }}>{String(companiesError.message || companiesError)}</p> : null}
      {companiesTruncated ? <p style={note}>The company list hit the 5,000-row limit; pick an industry to see the rest.</p> : null}

      {Status({ q: filing }) || (!r ? (
        <p style={note}>No original 10-K found for {companyName || `CIK ${c}`} in fiscal {y}. Pick another year.</p>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "baseline", margin: "20px 0 8px" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 600 }}>
                {inf && inf.tk ? <span style={{ fontSize: 14, fontWeight: 700, padding: "2px 8px", marginRight: 10, borderRadius: 6,
                  background: "var(--dash-accent)", color: "var(--dash-accent-fg, #fff)", verticalAlign: "middle" }}>{String(inf.tk)}</span> : null}
                {String(r.name)}
              </div>
              {inf && inf.industry_title ? (
                <div style={{ fontSize: 14, margin: "4px 0 2px" }}>
                  {String(inf.division_desc)} › {String(inf.major_group_desc)} › {inf.industry_group_desc ? `${String(inf.industry_group_desc)} › ` : ""}<b>{String(inf.industry_title).toLowerCase().replace(/(^|[\s(&/-])\w/g, (m) => m.toUpperCase())}</b>
                  {inf.sec_office ? <span style={{ color: "var(--dash-muted)", fontSize: 12 }}> · reviewed by SEC {String(inf.sec_office)}</span> : null}
                </div>
              ) : null}
              <div style={{ fontSize: 13, color: "var(--dash-muted)" }}>
                Form {String(r.form)} · fiscal {String(r.fy)} · SIC {String(r.sic ?? "—")}{inf && inf.all_tk && String(inf.all_tk) !== String(inf.tk) ? ` · all tickers: ${String(inf.all_tk)}` : ""} · amounts in {unit} ({String(r.reporting_uom)}) ·{" "}
                <a style={{ color: "var(--dash-accent)" }} target="_blank" rel="noreferrer"
                  href={`https://www.sec.gov/Archives/edgar/data/${String(r.cik)}/${String(r.adsh).replace(/-/g, "")}/${String(r.adsh)}-index.htm`}>
                  filing on EDGAR ↗</a>
              </div>
            </div>
          </div>
          <div style={{ ...card, background: "var(--dash-controls-bg)", color: "var(--dash-fg)", margin: "8px 0 20px" }}>
            <b>Reporting style {String(r.style)}</b> <span style={{ color: "var(--dash-muted)", fontSize: 12 }}>({String(r.style_confidence)} confidence · {String(r.style_code)})</span>
            <div style={{ fontSize: 14, marginTop: 4 }}>{STYLE_NOTES[r.style] || "Style-specific presentation."} Concepts this style doesn't present are blank, not zero.</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
            <Statement title="Income statement" lines={IS_LINES} />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Statement title="Balance sheet" lines={BS_LINES} />
              <Statement title="Cash flow statement (net by activity)" lines={CF_LINES} />
            </div>
          </div>

          <h2 style={h2}>Do the statements tie? {checks.length ? `${checks.length - failing} of ${checks.length} identities hold` : ""}</h2>
          <p style={note}>Difference = left side − right side, in {unit}. ✓ exact · ≈ off only by rounding (filers that report in millions) · ✗ doesn't tie. Identities that don't apply to this reporting style are omitted.</p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <tbody>
              {checks.map((k) => {
                const d = Number(r[`${k.id}_check`]);
                const s = state(d);
                const ok = s !== "fail";
                return (
                  <tr key={k.id}>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid var(--dash-border)", width: 28, fontSize: 16,
                      color: ok ? "var(--dash-accent)" : "var(--dash-danger)" }} title={s === "round" ? "Off only by rounding" : ""}>{s === "ok" ? "✓" : s === "round" ? "≈" : "✗"}</td>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid var(--dash-border)", fontWeight: 600, width: 50 }}>{k.id.toUpperCase()}</td>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid var(--dash-border)" }}>{k.rule}</td>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid var(--dash-border)", textAlign: "right", whiteSpace: "nowrap",
                      color: ok ? "var(--dash-muted)" : "var(--dash-danger)", fontWeight: ok ? 400 : 600 }}>
                      {quiz && !revealed.__checks ? "?" : s === "ok" ? "0" : s === "round" ? `${fmt(d)} (rounding)` : fmt(d)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {quiz && !revealed.__checks ? (
            <button type="button" onClick={() => setRevealed((p) => ({ ...p, __checks: true }))}
              style={{ ...box, cursor: "pointer", marginTop: 8 }}>Reveal differences</button>
          ) : null}
        </>
      ))}

      <h2 style={h2}>Industry peers, fiscal {y}</h2>
      <p style={note}>
        Companies in the same SIC classification
        {inf ? (pl === "sic" ? ` (${String(inf.sic_code)} · ${String(inf.industry_title || "").toLowerCase()})`
          : pl === "group" ? ` (${String(inf.industry_group || "")} · ${String(inf.industry_group_desc || inf.industry_title || "")})`
          : ` (${String(inf.major_group || "")} · ${String(inf.major_group_desc || "")})`) : ""}{", "}
        ranked in fiscal {y}. Click a company to load its statements. Peers can use different reporting styles even within one industry. Ask students why.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", marginBottom: 12 }}>
        <label style={lbl}>Peer group
          <select style={box} value={pl} onChange={(e) => setPeerLevel(e.target.value)}>
            {Object.entries(PEER_LEVELS).map(([k, x]) => <option key={k} value={k}>{x.label}</option>)}
          </select>
        </label>
        <label style={lbl}>Rank by (highest first)
          <select style={box} value={ps} onChange={(e) => setPeerSort(e.target.value)}>
            {Object.entries(PEER_SORTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </label>
        <label style={lbl}>Show
          <select style={box} value={pn} onChange={(e) => setPeerN(Number(e.target.value))}>
            {PEER_LIMITS.map((n) => <option key={n} value={n}>Top {n}</option>)}
          </select>
        </label>
      </div>
      {!inf ? (info.loading ? <p style={note}>Loading…</p> : <p style={note}>No industry classification for this filing.</p>)
        : !peerCond ? <p style={note}>This company has no SIC classification at this level.</p>
        : Status({ q: peers }) || (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr>
              {["#", "Ticker", "Company", "Style", "Revenue ($M)", "Assets ($M)", "Gross margin", "Net margin", "ROA", "Liab. / equity", "Identities failing"].map((h, i) => (
                <th key={h} style={{ padding: "6px 8px", borderBottom: "1px solid var(--dash-border)", fontSize: 12, color: "var(--dash-muted)", fontWeight: 500,
                  textAlign: i < 4 ? "left" : "right", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {(peers.rows || []).map((p, i) => {
                const self = Number(p.cik) === c;
                const td = { padding: "6px 8px", borderBottom: "1px solid var(--dash-border)", textAlign: "right", whiteSpace: "nowrap" };
                const m0 = (v) => (v == null ? "—" : Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 }));
                return (
                  <tr key={String(p.cik)} onClick={() => { if (!self) setCik(Number(p.cik)); }}
                    style={{ cursor: self ? "default" : "pointer", background: self ? "var(--dash-chip-bg, rgba(127,127,127,0.15))" : "transparent" }}>
                    <td style={{ ...td, textAlign: "left", color: "var(--dash-muted)" }}>{i + 1}</td>
                    <td style={{ ...td, textAlign: "left", fontWeight: 600 }}>{p.tk ? String(p.tk) : "—"}</td>
                    <td style={{ ...td, textAlign: "left", whiteSpace: "normal" }}>
                      <span style={{ color: self ? "inherit" : "var(--dash-accent)", fontWeight: self ? 600 : 400 }}>{String(p.company)}</span>
                      {self ? <span style={{ fontSize: 11, color: "var(--dash-muted)" }}> (selected)</span> : null}
                      {pl !== "sic" && p.ind ? <div style={{ fontSize: 11, color: "var(--dash-muted)" }}>{String(p.ind).toLowerCase()}</div> : null}
                    </td>
                    <td style={{ ...td, textAlign: "left" }}>{String(p.style_x ?? "—")}</td>
                    <td style={td}>{m0(p.revenue_m)}</td>
                    <td style={td}>{m0(p.assets_m)}</td>
                    <td style={td}>{p1(p.gross_margin)}{p.gross_margin == null ? "" : "%"}</td>
                    <td style={td}>{p1(p.net_margin)}{p.net_margin == null ? "" : "%"}</td>
                    <td style={td}>{p1(p.roa)}{p.roa == null ? "" : "%"}</td>
                    <td style={td}>{p1(p.liabilities_to_equity, 2)}</td>
                    <td style={{ ...td, color: Number(p.n_failed) > 0 ? "var(--dash-danger)" : "var(--dash-muted)", fontWeight: Number(p.n_failed) > 0 ? 600 : 400 }}>{String(p.n_failed ?? "—")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(peers.rows || []).length > 0 && !(peers.rows || []).some((p) => Number(p.cik) === c) ? (
            <p style={{ ...note, fontSize: 12, marginTop: 8 }}>The selected company isn't in this top {pn}, or doesn't report the ranking concept (for example, banks have no revenue or gross margin concept).</p>
          ) : null}
          <p style={{ ...note, fontSize: 12, marginTop: 8 }}>US-dollar filers only. A dash means the company's reporting style doesn't present that concept. "Identities failing" allows for rounding.</p>
        </div>
      )}

      <h2 style={h2}>{companyName ? `${companyName}: ` : ""}revenue, net income and operating cash flow</h2>
      <p style={note}>Every fiscal year with an original 10-K. A widening gap between net income and operating cash flow is a classic discussion point on accruals.</p>
      {Status({ q: trend }) || <VegaChart spec={trendSpec} data={tr} />}

      <h2 style={h2}>Ratios computed from the concepts</h2>
      <p style={note}>Because every company uses the same concepts, the same formula works across firms and industries. A dash means the style doesn't present an input (banks have no gross profit or current ratio).</p>
      {Status({ q: trend }) || (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr>
              <th style={{ padding: "6px 8px", borderBottom: "1px solid var(--dash-border)", textAlign: "left", fontSize: 12, color: "var(--dash-muted)" }}>Ratio</th>
              <th style={{ padding: "6px 8px", borderBottom: "1px solid var(--dash-border)", textAlign: "left", fontSize: 12, color: "var(--dash-muted)" }}>Formula</th>
              {recent.map((t) => <th key={String(t.fy)} style={{ padding: "6px 8px", borderBottom: "1px solid var(--dash-border)", textAlign: "right", fontSize: 12, color: "var(--dash-muted)" }}>FY{String(t.fy)}</th>)}
            </tr></thead>
            <tbody>
              {ratioDefs.map(([f, l, formula, d]) => (
                <tr key={f}>
                  <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--dash-border)", fontWeight: 600 }}>{l}</td>
                  <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--dash-border)", color: "var(--dash-muted)", fontSize: 13 }}>{formula}</td>
                  {recent.map((t) => <td key={String(t.fy)} style={{ padding: "6px 8px", borderBottom: "1px solid var(--dash-border)", textAlign: "right" }}>{p1(t[f], d || 1)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ ...note, marginTop: 24, fontSize: 12 }}>
        Source: SEC Financial Statement and Notes data sets, standardised to the Fundamental Accounting Concepts (consolidated, parent-entity facts).
        Values are the highest-priority XBRL tag each filer reported, with gaps filled by the reporting style's imputation rules.
      </p>
    </div>
  );
}
