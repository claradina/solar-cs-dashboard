const HUGGING_FACE_MODEL = process.env.HUGGING_FACE_MODEL || 'google/flan-t5-small';

function buildPrompt(account) {
  return `You are a Customer Success Manager preparing for a client call in the solar energy industry. Generate a concise pre-call briefing (max 180 words) for the following account. Use plain text, no markdown headers.\n\nAccount: ${account.name}\nCountry: ${account.country}\nSegment: ${account.segment}\nHealth Score: ${account.score}/100 (${account.status})\nPlatform Adoption: ${account.adoption}%\nMRR: $${account.mrr}\nOpen Tickets: ${account.tickets}\nLast Contact: ${account.lastContact}\nInstalled Capacity: ${account.installedKw} kW\nRenewal in: ${account.renewalIn}\nInternal notes: ${account.notes}\n\nStructure: 1) Account snapshot (2 sentences), 2) Main risk or opportunity (2 sentences), 3) Recommended talking points for the call (3 bullet points using - dash), 4) Suggested next action.`;
}

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

  const account = req.body?.account;
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
