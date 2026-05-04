const HUGGING_FACE_MODEL = process.env.HUGGING_FACE_MODEL || 'google/flan-t5-small';

function buildPrompt(account) {
  return `You are a Customer Success Manager preparing for a client call in the solar energy industry. Generate a concise pre-call briefing (max 180 words) for the following account. Use plain text, no markdown headers.\n\nAccount: ${account.name}\nCountry: ${account.country}\nSegment: ${account.segment}\nHealth Score: ${account.score}/100 (${account.status})\nPlatform Adoption: ${account.adoption}%\nMRR: $${account.mrr}\nOpen Tickets: ${account.tickets}\nLast Contact: ${account.lastContact}\nInstalled Capacity: ${account.installedKw} kW\nRenewal in: ${account.renewalIn}\nInternal notes: ${account.notes}\n\nStructure: 1) Account snapshot (2 sentences), 2) Main risk or opportunity (2 sentences), 3) Recommended talking points for the call (3 bullet points using - dash), 4) Suggested next action.`;
}
// briefing.js — Secure proxy for AI briefing generation
// Uses Hugging Face Inference API (free tier) with Mistral-7B-Instruct

const HUGGING_FACE_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';

// Builds the prompt sent to the AI model
function buildPrompt(account) {
  return `<s>[INST] You are a Customer Success Manager in the solar energy industry preparing for a client call. Generate a concise pre-call briefing (max 180 words) in plain text with no markdown headers.

Account: ${account.name}
Country: ${account.country}
Segment: ${account.segment}
Health Score: ${account.score}/100 (${account.status})
Platform Adoption: ${account.adoption}%
MRR: $${account.mrr}
Open Tickets: ${account.tickets}
Last Contact: ${account.lastContact}
Installed Capacity: ${account.installedKw} kW
Renewal in: ${account.renewalIn}
Internal notes: ${account.notes}

Structure your response as:
1) Account snapshot (2 sentences)
2) Main risk or opportunity (2 sentences)
3) Recommended talking points (3 bullet points using - dash)
4) Suggested next action [/INST]`;
}

// Local fallback — runs when no API key is configured
function localBriefing(account) {
  const snapshot = `${account.name} (${account.segment}, ${account.country}) currently holds a health score of ${account.score}/100 with ${account.adoption}% platform adoption and ${account.tickets} open ticket(s).`;

  const riskOrOpportunity = account.score >= 70
    ? `The account is in good standing with strong adoption and low ticket volume, presenting a clear opportunity to deepen the relationship and explore expansion.`
    : account.score >= 50
      ? `There is room to improve adoption and reduce open tickets before the upcoming renewal window.`
      : `The account is at critical risk due to low adoption and unresolved tickets — immediate intervention is needed before renewal.`;

  const bullets = [
    `Review the status of all open tickets and confirm resolution timelines with the support team.`,
    account.score < 50
      ? `Re-engage the primary stakeholder and realign expectations around platform value.`
      : `Identify which features are delivering the most value and reinforce usage around them.`,
    `Define a clear next step aligned with the renewal timeline and current account health.`
  ];

  const action = account.score < 50
    ? `Next action: schedule a recovery call within 48 hours and escalate critical tickets to engineering.`
    : `Next action: prepare a brief value summary and propose a follow-up checkpoint before renewal.`;

  return `${snapshot}\n\n${riskOrOpportunity}\n\n${bullets.map(b => `- ${b}`).join('\n')}\n\n${action}`;
}

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let payload = req.body;
  if (typeof payload === 'string' && payload.length) {
    try { payload = JSON.parse(payload); }
    catch { return res.status(400).json({ error: 'Invalid JSON payload' }); }
  }

  const account = payload?.account;
  if (!account) return res.status(400).json({ error: 'Missing account data' });

  if (!process.env.HUGGING_FACE_API_KEY) {
    return res.status(200).json({ text: localBriefing(account), provider: 'local-fallback' });
  }

  const prompt = buildPrompt(account);

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${HUGGING_FACE_MODEL}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
            return_full_text: false
          },
          options: {
            wait_for_model: true,
            use_cache: false
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('HF error:', data);
      return res.status(200).json({ text: localBriefing(account), provider: 'local-fallback' });
    }

    const text =
      data?.[0]?.generated_text?.trim() ||
      data?.generated_text?.trim() ||
      localBriefing(account);

    return res.status(200).json({ text, provider: 'huggingface', model: HUGGING_FACE_MODEL });

  } catch (error) {
    console.error('Server error:', error.message);
    return res.status(200).json({ text: localBriefing(account), provider: 'local-fallback' });
  }
}

module.exports = handler;

function localBriefing(account) {
  const snapshot = `The customer ${account.name} (${account.segment}, ${account.country}) has a health score of ${account.score}/100 and ${account.adoption}% platform adoption.`;
  const riskOrOpportunity = account.score >= 70
    ? `The account is well positioned with strong adoption and few tickets, so the opportunity is to deepen the relationship and push for expansion.`
    : account.score >= 50
      ? `There is an opportunity to improve functional adoption and reduce tickets before the renewal period.`
      : `The main risk is low adoption and critical open tickets, especially with the renewal coming up.`;
  const bullets = [
    `Review current ticket status and align next steps with the support team.`, 
    account.score < 50
      ? `Prioritize engagement with the new contact and revalidate expectations.`
      : `Confirm which features provide the most value for the customer at this stage.`,
    `Suggest a clear action for the next meeting, considering renewal timing and account health.`
  ];
  const action = account.score < 50
    ? `Next action: schedule a recovery call and resolve the highest-priority tickets.`
    : `Next action: continue monitoring and prepare recommendations for the next checkpoint.`;

  return `${snapshot}\n\n${riskOrOpportunity}\n\n${bullets.map(item => `- ${item}`).join('\n')}\n\n${action}`;
}

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let payload = req.body;
  if (typeof payload === 'string' && payload.length) {
    try {
      payload = JSON.parse(payload);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }
  }

  const account = payload?.account;
  if (!account) {
    return res.status(400).json({ error: 'Missing account payload' });
  }

  const prompt = buildPrompt(account);

  if (!process.env.HUGGING_FACE_API_KEY) {
    return res.status(200).json({ text: localBriefing(account), provider: 'local-fallback' });
  }

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${HUGGING_FACE_MODEL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`
      },
      body: JSON.stringify({ inputs: prompt, options: { wait_for_model: true }, parameters: { max_new_tokens: 250 } })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || 'Hugging Face inference error', details: data });
    }

    const text = typeof data === 'string'
      ? data
      : data?.generated_text || data?.[0]?.generated_text || data?.error || JSON.stringify(data);

    return res.status(200).json({ text, provider: 'huggingface', model: HUGGING_FACE_MODEL });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

module.exports = handler;
