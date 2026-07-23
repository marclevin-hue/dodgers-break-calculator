// Calculation engine — shared by both the Rojas-spot and Dodgers-spot panels.

function unitsPerBox(setEntry, boxType) {
  return setEntry.unit === 'card' ? BOX_META[boxType].cardsPerBox : BOX_META[boxType].packsPerBox;
}

function ratioOf(setEntry) {
  return 'dodgers' in setEntry ? setEntry.dodgers / setEntry.total : setEntry.target / setEntry.total;
}

// Expected number of matching cards from this set across the whole break.
function expectedCount(setEntry, boxCounts) {
  const ratio = ratioOf(setEntry);
  let total = 0;
  const byType = {};
  for (const type of BOX_TYPES) {
    const denom = setEntry.odds[type];
    const boxes = boxCounts[type] || 0;
    if (!denom || !boxes) { byType[type] = 0; continue; }
    const units = unitsPerBox(setEntry, type) * boxes;
    const c = units * (1 / denom) * ratio;
    byType[type] = c;
    total += c;
  }
  return { total, byType };
}

// P(at least one hit) across the whole break, treating each unit as an
// independent Bernoulli trial (standard for rare-event trading card odds).
function probAtLeastOne(setEntry, boxCounts) {
  const ratio = ratioOf(setEntry);
  let logSurvival = 0;
  for (const type of BOX_TYPES) {
    const denom = setEntry.odds[type];
    const boxes = boxCounts[type] || 0;
    if (!denom || !boxes) continue;
    const units = unitsPerBox(setEntry, type) * boxes;
    const p = (1 / denom) * ratio;
    logSurvival += units * Math.log1p(-Math.min(p, 0.999999));
  }
  return 1 - Math.exp(logSurvival);
}

function fmtPct(p) {
  if (p >= 0.999995) return '>99.999%';
  if (p >= 0.01) return (p * 100).toFixed(2) + '%';
  if (p <= 0) return '0%';
  return (p * 100).toPrecision(2) + '%';
}
function fmtOdds(p) {
  if (p <= 0) return '—';
  const denom = 1 / p;
  if (denom < 1.5) return 'near certain';
  return '1 in ' + denom.toLocaleString(undefined, { maximumFractionDigits: denom < 100 ? 1 : 0 });
}
function fmtMoney(v) {
  return v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}
function fmtCount(v) {
  return v < 1 ? v.toFixed(3) : v.toFixed(2);
}

function readBoxCounts() {
  return {
    hobby: parseFloat(document.getElementById('box-hobby').value) || 0,
    jumbo: parseFloat(document.getElementById('box-jumbo').value) || 0,
    mega: parseFloat(document.getElementById('box-mega').value) || 0,
    value: parseFloat(document.getElementById('box-value').value) || 0,
    delight: parseFloat(document.getElementById('box-delight').value) || 0
  };
}

function totalCostInclusive(spot, taxPct, shipping) {
  return spot * (1 + taxPct / 100) + shipping;
}
// Solve max spot price such that total (spot*(1+tax)+shipping) == budget
function maxSpotForBudget(budget, taxPct, shipping) {
  const remaining = budget - shipping;
  if (remaining <= 0) return 0;
  return remaining / (1 + taxPct / 100);
}

// ---------- Engine 1: Rojas spot ----------
function renderRojas() {
  const boxCounts = readBoxCounts();
  const valChamp = parseFloat(document.getElementById('rojas-val-champ').value) || 0;
  const valWca = parseFloat(document.getElementById('rojas-val-wca').value) || 0;
  const spotPrice = parseFloat(document.getElementById('rojas-spot-price').value) || 0;
  const taxPct = parseFloat(document.getElementById('rojas-tax').value) || 0;
  const shipping = parseFloat(document.getElementById('rojas-shipping').value) || 0;

  const champ = ROJAS_CARDS[0], wca = ROJAS_CARDS[1];
  const champExp = expectedCount(champ, boxCounts);
  const wcaExp = expectedCount(wca, boxCounts);
  const champP = probAtLeastOne(champ, boxCounts);
  const wcaP = probAtLeastOne(wca, boxCounts);
  const eitherP = 1 - (1 - champP) * (1 - wcaP);

  const ev = champExp.total * valChamp + wcaExp.total * valWca;
  const maxSpend = ev;
  const maxSpot = maxSpotForBudget(maxSpend, taxPct, shipping);
  const totalIfBuy = totalCostInclusive(spotPrice, taxPct, shipping);
  const verdict = spotPrice <= 0 ? null : totalIfBuy <= maxSpend;

  document.getElementById('rojas-champ-p').textContent = fmtPct(champP) + ' (' + fmtOdds(champP) + ')';
  document.getElementById('rojas-wca-p').textContent = fmtPct(wcaP) + ' (' + fmtOdds(wcaP) + ')';
  document.getElementById('rojas-either-p').textContent = fmtPct(eitherP) + ' (' + fmtOdds(eitherP) + ')';
  document.getElementById('rojas-champ-count').textContent = fmtCount(champExp.total) + ' expected copies';
  document.getElementById('rojas-wca-count').textContent = fmtCount(wcaExp.total) + ' expected copies';
  document.getElementById('rojas-ev').textContent = fmtMoney(ev);
  document.getElementById('rojas-max-total').textContent = fmtMoney(maxSpend);
  document.getElementById('rojas-max-spot').textContent = fmtMoney(maxSpot) + ' spot price (before tax/shipping)';

  const verdictEl = document.getElementById('rojas-verdict');
  if (verdict === null) {
    verdictEl.textContent = 'Enter a spot price to get a buy/pass call.';
    verdictEl.className = 'verdict neutral';
  } else if (verdict) {
    verdictEl.textContent = 'BUY — total cost (' + fmtMoney(totalIfBuy) + ') is at or under expected value.';
    verdictEl.className = 'verdict buy';
  } else {
    verdictEl.textContent = 'PASS — total cost (' + fmtMoney(totalIfBuy) + ') exceeds expected value (' + fmtMoney(ev) + ').';
    verdictEl.className = 'verdict pass';
  }

  const rows = [
    ['Champion Refractors — CHAMP-15', champ, champExp],
    ['World Champions Auto Refractor — WCA-MR', wca, wcaExp]
  ];
  const tbody = document.getElementById('rojas-breakdown-body');
  tbody.innerHTML = '';
  for (const [label, setEntry, exp] of rows) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + label + '</td>' + BOX_TYPES.map(t => '<td>' + (exp.byType[t] > 0 ? fmtCount(exp.byType[t]) : '—') + '</td>').join('') +
      '<td><strong>' + fmtCount(exp.total) + '</strong></td>';
    tbody.appendChild(tr);
  }
}

// ---------- Engine 2: Dodgers spot ----------
function renderDodgers() {
  const boxCounts = readBoxCounts();
  const valBase = parseFloat(document.getElementById('dodgers-val-base').value) || 0;
  const valInsert = parseFloat(document.getElementById('dodgers-val-insert').value) || 0;
  const valAuto = parseFloat(document.getElementById('dodgers-val-auto').value) || 0;
  const valRelic = parseFloat(document.getElementById('dodgers-val-relic').value) || 0;
  const spotPrice = parseFloat(document.getElementById('dodgers-spot-price').value) || 0;
  const taxPct = parseFloat(document.getElementById('dodgers-tax').value) || 0;
  const shipping = parseFloat(document.getElementById('dodgers-shipping').value) || 0;

  const catValues = { base: valBase, insert: valInsert, auto: valAuto, relic: valRelic };
  const catTotals = { base: 0, insert: 0, auto: 0, relic: 0 };
  let ev = 0;
  let grandTotal = 0;

  const detailRows = [];
  for (const set of DODGERS_SETS) {
    const exp = expectedCount(set, boxCounts);
    catTotals[set.category] += exp.total;
    grandTotal += exp.total;
    ev += exp.total * catValues[set.category];
    detailRows.push({ set, exp });
  }

  document.getElementById('dodgers-total-count').textContent = fmtCount(grandTotal) + ' expected Dodgers cards';
  for (const cat of ['base', 'insert', 'auto', 'relic']) {
    document.getElementById('dodgers-cat-' + cat).textContent = fmtCount(catTotals[cat]);
  }
  document.getElementById('dodgers-ev').textContent = fmtMoney(ev);

  const maxSpend = ev;
  const maxSpot = maxSpotForBudget(maxSpend, taxPct, shipping);
  const totalIfBuy = totalCostInclusive(spotPrice, taxPct, shipping);
  const verdict = spotPrice <= 0 ? null : totalIfBuy <= maxSpend;

  document.getElementById('dodgers-max-total').textContent = fmtMoney(maxSpend);
  document.getElementById('dodgers-max-spot').textContent = fmtMoney(maxSpot) + ' spot price (before tax/shipping)';

  const verdictEl = document.getElementById('dodgers-verdict');
  if (verdict === null) {
    verdictEl.textContent = 'Enter a spot price to get a buy/pass call.';
    verdictEl.className = 'verdict neutral';
  } else if (verdict) {
    verdictEl.textContent = 'BUY — total cost (' + fmtMoney(totalIfBuy) + ') is at or under expected value.';
    verdictEl.className = 'verdict buy';
  } else {
    verdictEl.textContent = 'PASS — total cost (' + fmtMoney(totalIfBuy) + ') exceeds expected value (' + fmtMoney(ev) + ').';
    verdictEl.className = 'verdict pass';
  }

  const tbody = document.getElementById('dodgers-breakdown-body');
  tbody.innerHTML = '';
  detailRows.sort((a, b) => b.exp.total - a.exp.total);
  for (const { set, exp } of detailRows) {
    if (exp.total <= 0) continue;
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + set.name + '</td><td>' + CATEGORY_LABELS[set.category] + '</td><td>' +
      set.dodgers + ' / ' + set.total + '</td><td><strong>' + fmtCount(exp.total) + '</strong></td>';
    tbody.appendChild(tr);
  }
}

function renderAll() {
  renderRojas();
  renderDodgers();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input').forEach(el => el.addEventListener('input', renderAll));
  renderAll();
});
