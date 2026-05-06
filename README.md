# 🌞 Solar CS Health Dashboard
### A working AI tool built by a CSM — not a developer

---

Hi there! 👋

If you're reading this, you're probably evaluating whether I'd be a good fit for your Customer Success team.
Instead of just telling you what I can do, I built something to show you.

This dashboard is a **real, functional tool** — the kind a CSM would actually use on the job.
It monitors a fictional portfolio of solar energy clients, flags churn risks, tracks NRR, and generates AI-powered pre-call briefings with one click.

No developers were involved. Just a CSM who believes in using the right tools to do the job better.

---

## 🎯 What this demonstrates

Here's what you can evaluate directly by clicking around:

| What you see | What it signals |
|---|---|
| Health score per account | I understand account monitoring and proactive risk management |
| At-risk and critical flags | I know how to prioritize a book of business |
| NRR trend chart | I'm comfortable with revenue metrics and portfolio-level thinking |
| AI briefing generation | I use AI to increase speed and quality — not to replace judgment |
| Filter and sort by status | I think in workflows, not just dashboards |
| SQL queries in the docs | I can pull my own data without waiting on a BI team |

---

## 🤖 The AI briefing feature — what it actually does

Click **"Generate briefing ↗"** on any account and watch what happens.

The tool reads the account's health score, adoption rate, open tickets, renewal timeline, and internal notes — then generates a structured pre-call briefing in seconds:

- **Account snapshot** — where the relationship stands today
- **Main risk or opportunity** — what needs attention on this call
- **Talking points** — three specific items to cover
- **Suggested next action** — a clear recommendation to close the loop

This is the kind of preparation that normally takes 10–15 minutes per account. With AI, it takes 3 seconds — which means more time for the actual conversation.

---

## 🔧 How it could be adapted for your team

This was built for a fictional solar energy portfolio, but the logic is completely transferable. Here are a few examples of how it could be adapted:

**SaaS company with a large SMB book:**
> Swap the solar metrics (installed kW, grid connection status) for product-specific signals like feature adoption, login frequency, and support ticket volume. The health score formula adjusts automatically.

**Enterprise CS team with QBR cycles:**
> Add a "days to QBR" column and filter accounts that need prep in the next 2 weeks. The AI briefing becomes a QBR summary draft instead of a pre-call note.

**Startup building their first CS motion:**
> Use this as a lightweight Gainsight alternative while the team is small — no CRM integration needed, just update the account data and the dashboard recalculates everything.

**Multilingual teams:**
> The AI prompt can be adjusted to generate briefings in German, Spanish, French, or any other language — useful for regional CS teams.

---

## 📁 What's inside

```
solar-cs-dashboard/
├── index.html        ← The full dashboard (no installation needed)
├── vercel.json       ← Deployment configuration
├── README.md         ← Technical documentation
└── api/
    └── briefing.js   ← AI briefing backend (secure, no API key exposed)
```

---

## 🛠️ Built with

- **Claude AI** — briefing generation and co-pilot throughout the build
- **Chart.js** — open-source data visualization
- **Vercel** — free hosting and serverless backend
- **Vanilla HTML/CSS/JavaScript** — no frameworks, runs anywhere
- **Hugging Face Inference API** — free AI model hosting

> All account data is fictional and created exclusively for portfolio purposes.
> No real client data was used at any point.

---

## 💬 Let's talk

I'd love to hear what your team's CS motion looks like — and whether this kind of thinking would be useful where you are.

If you're curious about how I'd adapt this for your specific context, or just want to chat about how AI fits into a CSM's day-to-day, feel free to reach out:

📧 **claras.azambuja@gmail.com**
💼 **linkedin.com/in/claradinasilva**

I'm currently open to CSM and CS Lead roles — remote, with a preference for companies working in energy, sustainability, or SaaS.
