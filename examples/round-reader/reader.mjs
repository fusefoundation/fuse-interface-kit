import { rootActor, unwrap } from '../fuse.mjs';
const root = rootActor();
const limit = 5;
const select = s => document.querySelector(s);
const elem = (tag, value) => Object.assign(document.createElement(tag), { textContent: String(value) });
function disclosure(panel, purpose) {
  const toggle = elem('button', '(?)');
  toggle.className = 'help';
  toggle.setAttribute('aria-label', 'Query details for ' + panel.querySelector('h2').textContent);
  const note = elem('div', '');
  note.className = 'note';
  note.id = panel.id + '-query';
  toggle.setAttribute('aria-controls', note.id);
  toggle.setAttribute('aria-expanded', 'false');
  note.hidden = true;
  const example = elem('code', '');
  const copy = elem('button', 'Copy example');
  note.append(elem('p', purpose), example, copy);
  panel.querySelector('.heading').append(toggle);
  panel.querySelector('.heading').after(note);
  toggle.onclick = () => {
    note.hidden = !note.hidden;
    toggle.setAttribute('aria-expanded', String(!note.hidden));
  };
  copy.onclick = async () => {
    try { await navigator.clipboard.writeText(example.textContent); copy.textContent = 'Copied'; }
    catch { copy.textContent = 'Select the example to copy'; }
  };
  return value => { example.textContent = value; copy.textContent = 'Copy example'; };
}
const latest = select('#latest');
const archive = select('#archive');
const latestHelp = disclosure(latest, 'Reads the latest published result without any arguments.');
latestHelp('await root.current_tour_summary()');
const archiveHelp = disclosure(archive, 'Reads up to five indexed rounds after the supplied cursor, starting with an empty cursor on page one.');
function stamp() {
  const now = new Date().toISOString();
  select('#stamp').dateTime = now;
  select('#stamp').textContent = now.replace('T',' ').slice(0,19) + ' UTC';
}
function metric(label, value) {
  const pair = elem('dl','');
  pair.append(elem('dt',label),elem('dd',value));
  return pair;
}
async function loadLatest() {
  const out = latest.querySelector('.output');
  const retry = latest.querySelector('.retry');
  retry.hidden = true;
  out.textContent = 'Loading latest result…';
  try {
    const [round] = unwrap(await root.current_tour_summary()).latest_tour;
    stamp();
    if (!round) { out.textContent = 'No published round is available yet.'; retry.hidden = false; return; }
    const metrics = elem('div','');
    metrics.className = 'metrics';
    metrics.append(metric('Cycle',round.cycle_id), metric('Winners',round.winners_count), metric('Prize pool (ckUSDT)', amount(round.quote.prize)));
    out.replaceChildren(metrics);
  } catch { out.textContent = 'Latest result unavailable.'; retry.hidden = false; }
}
function amount(micro) {
  return (micro / 1000000n).toString() + '.' + (micro % 1000000n).toString().padStart(6,'0');
}
let cursors = [[]], page = 0, next = [], attempted = 0;
async function loadArchive(index) {
  const out = archive.querySelector('.output');
  const retry = archive.querySelector('.retry');
  const cursor = cursors[index];
  attempted = index;
  archiveHelp('await root.tour_statistics_page([' + cursor.map(n => n + 'n').join(', ') + '], ' + limit + ')');
  retry.hidden = true;
  select('#prev').disabled = select('#next').disabled = true;
  select('#page').textContent = '';
  out.textContent = 'Loading archive…';
  try {
    const data = unwrap(await root.tour_statistics_page(cursor,limit));
    page = index;
    next = data.next_after_cycle;
    cursors = cursors.slice(0,index + 1);
    if (next.length) cursors.push(next);
    const table = elem('table','');
    const heading = table.createTHead().insertRow();
    for (const title of ['Cycle','Paid wallets','Prize pool (ckUSDT)']) heading.append(elem('th',title));
    const body = table.createTBody();
    for (const round of data.items) {
      const row = body.insertRow();
      for (const value of [round.cycle_id,round.paid_wallets,amount(round.quote.prize)]) row.insertCell().textContent = String(value);
    }
    out.replaceChildren(data.items.length ? table : elem('p','No indexed rounds on this page.'));
    if (!data.caught_up) out.append(elem('p','Indexing through cycle ' + data.indexed_through_cycle + '.'));
    select('#page').textContent = 'Page ' + (page + 1);
    select('#prev').disabled = page === 0;
    select('#next').disabled = !next.length;
    stamp();
  } catch { out.textContent = 'Archive page unavailable.'; retry.hidden = false; }
}
latest.querySelector('.retry').onclick = loadLatest;
archive.querySelector('.retry').onclick = () => loadArchive(attempted);
select('#prev').onclick = () => loadArchive(page - 1);
select('#next').onclick = () => loadArchive(page + 1);
loadLatest();
loadArchive(0);
