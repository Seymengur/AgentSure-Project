/**
 * AgentSure Tarayıcı İçi InsurTech ve Telemetri Motoru
 * %100 İstemci Taraflı (Sunucusuz) — Doğrudan index.html üzerinden çalışır!
 */

// Saf JavaScript SHA-256 Kriptografik Özetleme Fonksiyonu
function sha256Sync(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i, j;
  let result = '';

  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;
  
  let hash = [];
  let k = [];
  let primeCounter = 0;

  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = candidate * candidate; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  
  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return;
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
  words[words[lengthProperty]] = (asciiBitLength | 0);
  
  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, j += 16);
    const oldHash = hash;
    hash = hash.slice(0, 8);
    
    for (i = 0; i < 64; i++) {
      const i2 = i + j;
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0
        );
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      
      hash = [(temp1 + temp2) | 0, a, hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }
    
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  
  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += ((b < 16) ? 0 : '') + b.toString(16);
    }
  }
  return result;
}

// Bellek İçi Durum Verisi
const STATE = {
  totalInsuredValue: 150000.0,
  totalClaimsPaid: 4820.0,
  selectedAgentId: 'agent_customer_support_01',
  agents: [
    {
      id: 'agent_customer_support_01',
      name: 'Müşteri Destek Asistanı',
      model: 'gpt-4o',
      policyName: 'Büyüme Paketi ($50.000 Teminat)',
      coverageLimit: 50000.0,
      burnRateMin: 0.04,
      tokensTotal: 84210,
      costTotal: 0.42,
      circuitBreakerTripped: false
    },
    {
      id: 'agent_code_assistant_02',
      name: 'Otonom Kod Düzenleme Ajanı',
      model: 'claude-3-5-sonnet',
      policyName: 'Büyüme Paketi ($50.000 Teminat)',
      coverageLimit: 50000.0,
      burnRateMin: 0.12,
      tokensTotal: 312500,
      costTotal: 2.15,
      circuitBreakerTripped: false
    },
    {
      id: 'agent_finance_trader_03',
      name: 'Arbitraj Likidite Dağıtıcısı',
      model: 'gpt-4o-mini',
      policyName: 'Büyüme Paketi ($50.000 Teminat)',
      coverageLimit: 50000.0,
      burnRateMin: 0.01,
      tokensTotal: 45100,
      costTotal: 0.18,
      circuitBreakerTripped: false
    }
  ],
  claims: [
    {
      id: 'clm_78f1a09d',
      agentName: 'Otonom Kod Düzenleme Ajanı',
      reason: 'DÖNGÜSEL_ARAÇ_ÇAĞRISI_PATLAMASI',
      detectedAt: '2026-10-06 14:22:10',
      paidAmount: 1420.0,
      settlementLatencySec: 0.84,
      proofHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      payoutMethod: 'Stripe Instant Rails / ACH Havale'
    },
    {
      id: 'clm_33e4b11c',
      agentName: 'Müşteri Destek Asistanı',
      reason: 'PROMPT_ENJEKSİYONU_ANOMALİ_HARCAMASI',
      detectedAt: '2026-09-28 09:15:44',
      paidAmount: 3400.0,
      settlementLatencySec: 0.61,
      proofHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      payoutMethod: 'Stripe Instant Rails / ACH Havale'
    }
  ]
};

// Arayüzü Güncelleme
function renderUI() {
  // Üst İstatistikler
  document.getElementById('stat-insured-cap').textContent = `$${STATE.totalInsuredValue.toLocaleString()}`;
  document.getElementById('stat-claims-paid').textContent = `$${STATE.totalClaimsPaid.toLocaleString()}`;
  
  const operationalCount = STATE.agents.filter(a => !a.circuitBreakerTripped).length;
  document.getElementById('stat-active-agents').textContent = `${operationalCount} / ${STATE.agents.length}`;

  // Nabız Göstergesi
  const pulseDot = document.getElementById('global-pulse-dot');
  const pulseText = document.getElementById('global-pulse-text');
  const trippedCount = STATE.agents.filter(a => a.circuitBreakerTripped).length;

  if (trippedCount > 0) {
    pulseDot.classList.add('tripped');
    pulseText.textContent = `${trippedCount} Devre Kesici Tetiklendi`;
  } else {
    pulseDot.classList.remove('tripped');
    pulseText.textContent = `Tüm ${STATE.agents.length} Ajan Korumada`;
  }

  // Seçili Ajan Etiketi
  const targetAgent = STATE.agents.find(a => a.id === STATE.selectedAgentId) || STATE.agents[0];
  document.getElementById('selected-agent-label').textContent = targetAgent.name;

  // Ajan Kartlarını Çiz
  renderAgents();

  // Tazminat Geçmişini Çiz
  renderClaims();

  // Güven Rozetini Çiz
  renderBadge(targetAgent);
}

function renderAgents() {
  const container = document.getElementById('agents-grid-container');
  container.innerHTML = '';

  STATE.agents.forEach(agent => {
    const isTripped = agent.circuitBreakerTripped;
    const isSelected = agent.id === STATE.selectedAgentId;

    const card = document.createElement('div');
    card.className = `agent-card ${isTripped ? 'tripped' : ''}`;
    card.style.cursor = 'pointer';
    card.style.outline = isSelected ? '2px solid var(--cyan-base)' : 'none';

    card.onclick = () => {
      STATE.selectedAgentId = agent.id;
      renderUI();
    };

    card.innerHTML = `
      <div class="agent-card-top">
        <div>
          <div class="agent-title">${escapeHtml(agent.name)}</div>
          <div class="agent-subtitle">${escapeHtml(agent.model)} • ${escapeHtml(agent.policyName)}</div>
        </div>
        <span class="status-chip ${isTripped ? 'tripped' : 'operational'}">
          ${isTripped ? 'DONDURULDU / KESİCİ' : 'KORUMADA'}
        </span>
      </div>

      <div class="stats-matrix">
        <div class="matrix-cell">
          <span class="matrix-label">Yakma Hızı</span>
          <span class="matrix-value" style="color: ${isTripped ? 'var(--crimson-base)' : 'inherit'}">
            $${agent.burnRateMin.toFixed(2)}/dk
          </span>
        </div>
        <div class="matrix-cell">
          <span class="matrix-label">Token</span>
          <span class="matrix-value">${(agent.tokensTotal / 1000).toFixed(1)}k</span>
        </div>
        <div class="matrix-cell">
          <span class="matrix-label">Teminat Limiti</span>
          <span class="matrix-value" style="color: var(--emerald-base)">
            $${(agent.coverageLimit / 1000).toFixed(0)}k
          </span>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function renderClaims() {
  const tbody = document.getElementById('claims-ledger-tbody');
  tbody.innerHTML = '';

  STATE.claims.forEach(c => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${escapeHtml(c.id)}</strong></td>
      <td>${escapeHtml(c.agentName)}</td>
      <td><span style="font-family: var(--font-mono); font-size: 0.8rem; color: #fca5a5;">${escapeHtml(c.reason)}</span></td>
      <td style="font-family: var(--font-mono); font-weight: 700; color: var(--emerald-base);">$${c.paidAmount.toFixed(2)}</td>
      <td style="color: var(--cyan-base); font-family: var(--font-mono); font-size: 0.82rem;">⚡ ${c.settlementLatencySec} sn</td>
      <td><span class="code-pill" title="${c.proofHash}">${c.proofHash.substring(0, 12)}...</span></td>
    `;
    tbody.appendChild(row);
  });
}

function renderBadge(agent) {
  const badgeContainer = document.getElementById('badge-svg-container');
  if (!badgeContainer) return;

  const isSafe = !agent.circuitBreakerTripped;
  const statusText = isSafe ? 'AgentSure Güvencesinde' : 'Donduruldu (Kesici Aktif)';
  const fillColor = isSafe ? '#10B981' : '#EF4444';
  const coverage = `$${(agent.coverageLimit / 1000).toFixed(0)}k`;

  badgeContainer.innerHTML = `
    <svg width="270" height="38" viewBox="0 0 270 38" xmlns="http://www.w3.org/2000/svg">
      <rect width="270" height="38" rx="8" fill="#0D1117" stroke="#30363D" stroke-width="1"/>
      <circle cx="20" cy="19" r="5" fill="${fillColor}">
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/>
      </circle>
      <text x="36" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#E6EDF3">${statusText}</text>
      <rect x="200" y="7" width="60" height="24" rx="6" fill="{fillColor}" fill-opacity="0.16"/>
      <text x="230" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="${fillColor}" text-anchor="middle">${coverage}</text>
    </svg>
  `;
}

// Kullanıcı Eylemleri
function executeSafeTask() {
  const agent = STATE.agents.find(a => a.id === STATE.selectedAgentId);
  if (!agent) return;

  agent.tokensTotal += Math.floor(Math.random() * 1500) + 800;
  agent.costTotal += 0.02;
  agent.burnRateMin = 0.04 + (Math.random() * 0.02);

  renderUI();
}

function simulateRogueRunaway() {
  const agent = STATE.agents.find(a => a.id === STATE.selectedAgentId);
  if (!agent) return;

  // Aşırı Anomali Simülasyonu
  const spikeTokens = 1450000;
  const spikeCost = 1420.50;
  agent.tokensTotal += spikeTokens;
  agent.costTotal += spikeCost;
  agent.burnRateMin = 385.20; // Yüksek yakma hızı patlaması
  agent.circuitBreakerTripped = true;

  // Gerçek SHA-256 Kriptografik Anomali Kanıtı
  const incidentPayload = `${agent.id}:${spikeTokens}:${spikeCost}:${Date.now()}`;
  const proofHash = sha256Sync(incidentPayload);
  const claimId = `clm_${Math.random().toString(16).substring(2, 10)}`;
  const txHash = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`;

  const claimEntry = {
    id: claimId,
    agentName: agent.name,
    reason: 'SONSUZ_DÖNGÜ_VE_FATURA_PATLAMASI',
    detectedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    paidAmount: spikeCost,
    settlementLatencySec: 0.38,
    proofHash: proofHash,
    txHash: txHash,
    payoutMethod: 'Anında Geliştirici Banka Transferi (Stripe Rails)'
  };

  STATE.claims.unshift(claimEntry);
  STATE.totalClaimsPaid += spikeCost;

  // Olay Kutusunu Göster
  const alertBox = document.getElementById('incident-alert-box');
  document.getElementById('incident-timer').textContent = `0.38 sn içinde Tazmin Edildi`;
  document.getElementById('inc-agent').textContent = agent.name;
  document.getElementById('inc-reason').textContent = claimEntry.reason;
  document.getElementById('inc-reimbursed').textContent = `$${spikeCost.toFixed(2)} USD`;
  document.getElementById('inc-proof').textContent = proofHash;
  document.getElementById('inc-payout-rail').textContent = claimEntry.payoutMethod;

  alertBox.classList.add('visible');

  renderUI();
}

function resetAll() {
  STATE.agents.forEach(agent => {
    agent.circuitBreakerTripped = false;
    agent.burnRateMin = 0.04;
  });

  const alertBox = document.getElementById('incident-alert-box');
  if (alertBox) alertBox.classList.remove('visible');

  renderUI();
}

function copyEmbedSnippet() {
  const targetAgent = STATE.agents.find(a => a.id === STATE.selectedAgentId) || STATE.agents[0];
  const snippet = `<!-- AgentSure Güven Rozeti -->\n<a href="https://agentsure.dev/dogrula/${targetAgent.id}" target="_blank">\n  <img src="https://agentsure.dev/api/rozet/${targetAgent.id}" alt="AgentSure Korumasında" />\n</a>`;
  
  navigator.clipboard.writeText(snippet).then(() => {
    const btn = document.getElementById('btn-copy-embed');
    const orig = btn.textContent;
    btn.textContent = '✅ Panoya Kopyalandı!';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Başlangıç Yüklemesi
document.addEventListener('DOMContentLoaded', () => {
  renderUI();

  document.getElementById('btn-safe-task').addEventListener('click', executeSafeTask);
  document.getElementById('btn-simulate-rogue').addEventListener('click', simulateRogueRunaway);
  document.getElementById('btn-reset-all').addEventListener('click', resetAll);
  document.getElementById('btn-copy-embed').addEventListener('click', copyEmbedSnippet);
});
