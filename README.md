# CloudFinalProject — Frontend

Static web frontend for the 8451 / Kroger retail analytics project. Vanilla HTML / CSS / JS, deployed via GitHub Actions → Azure Static Web Apps.

- **Live site:** https://wonderful-desert-05af0470f.7.azurestaticapps.net
- **Backend API:** https://retail-fastapi-ss-acgxdhamh2dybjeg.eastus2-01.azurewebsites.net
- **Backend repo:** https://github.com/nagarisn/CloudFinalProject

## Pages
| File | Purpose |
|------|---------|
| `index.html` | Login |
| `register.html` | Register a new user (stored in localStorage) |
| `portal.html` | Logged-in landing page with navigation |
| `search.html` | Search transactions by `HSHD_NUM` (Req #4) |
| `upload.html` | Upload latest Households / Transactions / Products CSV (Req #5) |
| `dashboard.html` | Retail KPI dashboard + ML insights (Req #6, #7, #8) |

## Dashboard
- Per-household metrics: total spend, baskets, items, average spend, units
- Top 5 commodities chart
- Basket analysis (table + pie)
- Churn risk distribution (bar)
- **ML section** (calls `/ml/clv`, `/ml/basket`, `/ml/churn`):
  - CLV predictions (Linear Regression + Random Forest R²)
  - Basket association rules with lift
  - Churn probability (Gradient Boosting + Logistic Regression accuracy)

## Auth
Lightweight client-side auth — register stores credentials in `localStorage`, login validates against them. Demo-grade only.

## Local Preview
Open any `.html` file directly in a browser, or serve with:
```bash
python -m http.server 5500
```
The backend URL is hard-coded in `script.js` (`BACKEND_URL`).

## Deployment
Auto-deploys to Azure Static Web Apps on every push to `main` via the workflow in `.github/workflows/`.
