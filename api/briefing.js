const HUGGING_FACE_MODEL = process.env.HUGGING_FACE_MODEL || 'google/flan-t5-small';

function buildPrompt(account) {
  return `You are a Customer Success Manager preparing for a client call in the solar energy industry. Generate a concise pre-call briefing (max 180 words) for the following account. Use plain text, no markdown headers.\n\nAccount: ${account.name}\nCountry: ${account.country}\nSegment: ${account.segment}\nHealth Score: ${account.score}/100 (${account.status})\nPlatform Adoption: ${account.adoption}%\nMRR: $${account.mrr}\nOpen Tickets: ${account.tickets}\nLast Contact: ${account.lastContact}\nInstalled Capacity: ${account.installedKw} kW\nRenewal in: ${account.renewalIn}\nInternal notes: ${account.notes}\n\nStructure: 1) Account snapshot (2 sentences), 2) Main risk or opportunity (2 sentences), 3) Recommended talking points for the call (3 bullet points using - dash), 4) Suggested next action.`;
}

function localBriefing(account) {
  const snapshot = `O cliente ${account.name} (${account.segment}, ${account.country}) tem um health score de ${account.score}/100 e adoção de ${account.adoption}% da plataforma.`;
  const riskOrOpportunity = account.score >= 70
    ? `A conta está bem posicionada, com boa adoção e poucos tickets, então a oportunidade é fortalecer o relacionamento e promover expansão.`
    : account.score >= 50
      ? `Há uma oportunidade de melhorar a adoção funcional e reduzir tickets antes do período de renovação.`
      : `O principal risco é a baixa adoção e os tickets críticos abertos, especialmente com a renovação próxima.`;
  const bullets = [
    `Revisar o status dos tickets atuais e alinhar próximos passos com o time de suporte.`, 
    account.score < 50
      ? `Priorizar engajamento com o novo ponto de contato e revalidar expectativas.`
      : `Confirmar quais recursos têm maior valor para o cliente nesta fase.`,
    `Sugerir ação clara para a próxima reunião, considerando a renovação e a saúde da conta.`
  ];
  const action = account.score < 50
    ? `Próxima ação: agendar uma chamada de recuperação e resolver os principais tickets.`
    : `Próxima ação: manter o acompanhamento e preparar recomendações para o próximo checkpoint.`;

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
