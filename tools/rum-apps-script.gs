/**
 * Příjem dat z rumové stránky namornicky-ples.cz/rum/ do Google tabulky.
 *
 * Nasazení (jednou, asi 5 minut):
 * 1. Založ novou Google tabulku, např. „Rumy 2027 – anketa a hodnocení“.
 * 2. Rozšíření → Apps Script, smaž ukázkový kód a vlož celý tento soubor. Ulož.
 * 3. Nasadit → Nové nasazení → typ „Webová aplikace“.
 *    Spustit jako: Já. Kdo má přístup: Kdokoli. → Nasadit, povolit přístup.
 * 4. Zkopíruj adresu webové aplikace (končí /exec) do _data/rumy.yml → odesilani_url.
 *
 * Listy se založí samy:
 *  - Anketa:    jeden řádek za každý hlas
 *  - Hodnocení: jeden řádek za host × rum (poslední hodnocení vyhrává; 0 = zrušeno)
 *  - Souhrn:    vzorce s počty hlasů a průměrným hodnocením
 */

const HODNOCENI_TEXT = { 3: 'Skvělý', 2: 'Dobrý', 1: 'Nic moc', 0: 'zrušeno' };

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const p = e.parameter || {};
    const ss = SpreadsheetApp.getActive();
    if (p.typ === 'hlas') {
      const sh = list_(ss, 'Anketa', ['Čas', 'Zařízení', 'Výroční rum', 'Nesmí chybět', 'Tip', 'E-mail']);
      sh.appendRow([new Date(), cut_(p.d, 20), cut_(p.vyrocni, 40), cut_(p.oblibene, 300), cut_(p.tip, 300), cut_(p.email, 120)]);
    } else if (p.typ === 'hodnoceni') {
      const sh = list_(ss, 'Hodnocení', ['Klíč', 'Zařízení', 'Rum', 'Hodnocení', 'Slovy', 'Čas']);
      const rows = JSON.parse(p.data || '[]').slice(0, 200);
      const keys = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map(r => r[0]) : [];
      rows.forEach(x => {
        const h = Number(x.h) || 0;
        const key = cut_(x.d, 20) + '|' + cut_(x.r, 40);
        const row = [key, cut_(x.d, 20), cut_(x.r, 40), h, HODNOCENI_TEXT[h] || '', x.t ? new Date(x.t) : new Date()];
        const i = keys.indexOf(key);
        if (i >= 0) sh.getRange(i + 2, 1, 1, row.length).setValues([row]);
        else { sh.appendRow(row); keys.push(key); }
      });
    }
    souhrn_(ss);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('Rumová stránka: příjem dat běží.');
}

function list_(ss, name, header) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, header.length).setFontWeight('bold');
  }
  return sh;
}

function souhrn_(ss) {
  if (ss.getSheetByName('Souhrn')) return;
  const sh = ss.insertSheet('Souhrn');
  sh.getRange('A1').setValue('Výroční rum – počet hlasů').setFontWeight('bold');
  sh.getRange('A2').setFormula('=IFERROR(QUERY(Anketa!C2:C, "select C, count(C) where C <> \'\' group by C order by count(C) desc label C \'Rum\', count(C) \'Hlasů\'", 0), "zatím nic")');
  sh.getRange('D1').setValue('Hodnocení rumů na plese').setFontWeight('bold');
  sh.getRange('D2').setFormula('=IFERROR(QUERY(\'Hodnocení\'!C2:D, "select C, count(D), avg(D) where D > 0 group by C order by avg(D) desc label C \'Rum\', count(D) \'Hodnocení\', avg(D) \'Průměr (1–3)\'", 0), "zatím nic")');
}

function cut_(v, n) {
  return String(v == null ? '' : v).slice(0, n);
}
