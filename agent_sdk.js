/**
 * agent_sdk.js — Node.js SDK & Standalone Terminal Demo
 * Zero External Dependencies (Node.js Built-in crypto module)
 * Run in terminal: node agent_sdk.js
 */

import crypto from 'node:crypto';

class AgentSureSDK {
  constructor(config = {}) {
    this.agentId = config.agentId || 'agent_support_01';
    this.policyId = config.policyId || 'pol_growth_tier_50k';
    this.coverageLimit = config.coverageLimit || 50000;
    this.maxSpendPerMin = config.maxSpendPerMin || 1.50;
    this.maxRecursionDepth = config.maxRecursionDepth || 4;

    this.tokensTotal = 0;
    this.costTotal = 0;
    this.isFrozen = false;
    this.callHistory = [];
    this.recursionCounter = 0;
  }

  guardCall(model, tokens, costEstimate) {
    if (this.isFrozen) {
      throw new Error(`[Circuit Breaker] Agent is FROZEN. Safety limits were exceeded.`);
    }

    const now = Date.now();
    this.tokensTotal += tokens;
    this.costTotal += costEstimate;
    this.recursionCounter += 1;

    this.callHistory.push({ time: now, cost: costEstimate });
    const oneMinAgo = now - 60000;
    const recentCost = this.callHistory
      .filter(item => item.time >= oneMinAgo)
      .reduce((sum, item) => sum + item.cost, 0);

    const isRunawaySpend = recentCost > this.maxSpendPerMin;
    const isRunawayRecursion = this.recursionCounter > this.maxRecursionDepth;

    if (isRunawaySpend || isRunawayRecursion) {
      this.isFrozen = true;
      const reason = isRunawaySpend ? 'EXCESSIVE_BURN_RATE' : 'RECURSION_LOOP_DETECTED';

      // Generate SHA-256 Proof of Anomaly
      const proofPayload = `${this.agentId}:${this.tokensTotal}:${recentCost}:${now}`;
      const proofHash = crypto.createHash('sha256').update(proofPayload).digest('hex');

      const claimReceipt = {
        claimId: `clm_${crypto.randomBytes(4).toString('hex')}`,
        status: 'PARAMETRIC_SETTLED_INSTANTLY',
        paidAmount: Number(recentCost.toFixed(2)),
        settlementLatencySec: 0.38,
        proofHash,
        payoutMethod: 'Stripe Instant Rails / ACH Direct'
      };

      const error = new Error(`🚨 CIRCUIT BREAKER TRIPPED: ${reason}! Runaway spend of $${recentCost.toFixed(2)} intercepted.`);
      error.incidentData = { agentId: this.agentId, reason, excessCost: recentCost, proofHash };
      error.claimReceipt = claimReceipt;
      throw error;
    }

    return true;
  }
}

// Doğrudan çalıştırıldığında etkileşimli terminal demosu
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('agent_sdk.js')) {
  console.log('==================================================================');
  console.log('🛡️  AGENTSURE (Node.js SDK) — Otonom Sistem Devre Kesici & Teminat');
  console.log('==================================================================\n');

  const shield = new AgentSureSDK({
    agentId: 'agent_customer_support_01',
    maxSpendPerMin: 1.50,
    maxRecursionDepth: 4
  });

  console.log('[1] AgentSure Node.js SDK Aktif ($50,000 Teminat Limiti)');
  console.log('    Devre Kesici (Circuit Breaker): Dinlemede\n');

  console.log('[2] Normal Ajan Görevi Yürütülüyor...');
  for (let i = 1; i <= 2; i++) {
    shield.guardCall('gpt-4o', 850, 0.02);
    console.log(`    -> Adım ${i}: API çağrısı yapıldı, telemetri onaylandı.`);
  }
  console.log('    ✨ Görev güvenle tamamlandı.\n');

  console.log('[3] Simülasyon: Sonsuz Döngü / Fatura Patlaması Başlatılıyor...');
  try {
    let depth = 0;
    while (true) {
      depth++;
      console.log(`    ⚠️  [Döngü Derinliği ${depth}]: Alt-ajan tetiklendi, token harcanıyor...`);
      shield.guardCall('gpt-4o', 25000, 0.60);
    }
  } catch (err) {
    console.log('\n==================================================================');
    console.log(err.message);
    console.log('==================================================================');
    console.log('🔒 Kriptografik SHA-256 Anomali Kanıtı:', err.incidentData?.proofHash);
    console.log('⚡ Parametrik Anında Tazminat:');
    console.log(`   • Dosya No: ${err.claimReceipt?.claimId}`);
    console.log(`   • Durum: ${err.claimReceipt?.status}`);
    console.log(`   • Ödenen Tutar: $${err.claimReceipt?.paidAmount} USD`);
    console.log(`   • Hız: ${err.claimReceipt?.settlementLatencySec} saniye`);
    console.log(`   • Ödeme Kanalı: ${err.claimReceipt?.payoutMethod}`);
    console.log('==================================================================');
    console.log('✅ Ajan donduruldu, fatura zararı 0.38 saniyede hesaba aktarıldı!\n');
  }
}

export default AgentSureSDK;
