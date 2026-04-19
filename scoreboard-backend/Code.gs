/**
 * ESL Games — shared leaderboard backend
 * =======================================
 * Deploy this as a Google Apps Script Web App bound to one specific
 * Sheet. The script only touches that Sheet — it cannot reach any other
 * file in your Drive, your Gmail, or anything else, because the only
 * API it uses is SpreadsheetApp.openById(SHEET_ID).
 *
 * Deploy setup (one-time, ~3 minutes):
 *   1. Go to https://script.google.com → "New project".
 *   2. Paste this entire file into Code.gs (overwrite the default).
 *   3. Replace SHEET_ID below with your Sheet's ID.
 *   4. Click "Deploy" → "New deployment" → Type: "Web app".
 *        - Description: "ESL Games scoreboard v1"
 *        - Execute as: Me
 *        - Who has access: Anyone            (required — classroom use)
 *   5. Click "Deploy", authorize (first time only), copy the Web app URL.
 *   6. Paste that URL into src/lib/remote-scoreboard.ts (SCOREBOARD_URL).
 *
 * Redeploys: if you edit this code, click "Deploy → Manage deployments →
 * the pencil icon → Version: new version → Deploy". Keep the same URL.
 * If you ever suspect URL abuse, create a NEW deployment (new URL) and
 * update the client.
 *
 * Security notes:
 *   - The URL is the only "secret". It goes in client JS (it has to).
 *     Worst case if it leaks: someone spams the Sheet. They cannot
 *     touch anything else.
 *   - We allowlist game IDs, clamp scores, sanitize names, and throttle
 *     one write per name+game per 3 seconds.
 *   - We never return anyone's IP, email, or any user metadata.
 */

// ======== CONFIG (edit this) ========
// Paste the Sheet ID from the URL: docs.google.com/spreadsheets/d/<THIS_PART>/edit
var SHEET_ID = '1VaT2Y-w_GZY--gGYO4ReR4GMEcbvsDjSgHtNqM2ZJ6s';

// Allowlisted game IDs and their max possible score.
// Reject any submission outside this list / outside [0, max].
var GAMES = {
  'mashup':        { max: 10  },
  'checkout':      { max: 24  },
  'fixtext':       { max: 100 }, // percentage
  'calendar':      { max: 40  }, // effectively unbounded, generous cap
  'speedfind':     { max: 40  }, // effectively unbounded, generous cap
  'davesday':      { max: 18  },
  'grammarquest':  { max: 12  }
};

var MAX_NAME_LEN    = 15;
var TOP_N           = 10;
var WRITE_COOLDOWN_MS = 3000; // per (name+game), anti-spam


// ======== ENDPOINTS ========
function doGet(e) {
  try {
    var game = (e && e.parameter && e.parameter.game) || '';
    if (!GAMES[game]) return jsonOut({ error: 'bad game' }, 400);
    return jsonOut({ scores: readTop(game) });
  } catch (err) {
    return jsonOut({ error: String(err && err.message || err) }, 500);
  }
}

function doPost(e) {
  try {
    // We send JSON as text/plain from the client to dodge CORS preflight.
    var raw = (e && e.postData && e.postData.contents) || '{}';
    var body = JSON.parse(raw);

    var game  = String(body.game || '');
    var name  = sanitizeName(body.name);
    var score = Number(body.score);

    if (!GAMES[game])                     return jsonOut({ error: 'bad game' }, 400);
    if (!name)                             return jsonOut({ error: 'bad name' }, 400);
    if (!isFinite(score))                  return jsonOut({ error: 'bad score' }, 400);
    if (score < 0 || score > GAMES[game].max)
                                          return jsonOut({ error: 'score out of range' }, 400);

    // Throttle: one write per (name+game) per cooldown window.
    if (throttled(game, name)) return jsonOut({ scores: readTop(game), throttled: true });

    appendRow(game, name, Math.floor(score));
    return jsonOut({ scores: readTop(game) });
  } catch (err) {
    return jsonOut({ error: String(err && err.message || err) }, 500);
  }
}


// ======== SHEET I/O ========
// Each game gets its own tab; we create it on first use.
function getSheet(game) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(game);
  if (!sh) {
    sh = ss.insertSheet(game);
    sh.appendRow(['timestamp', 'name', 'score']);
  }
  return sh;
}

function appendRow(game, name, score) {
  var sh = getSheet(game);
  sh.appendRow([new Date().toISOString(), name, score]);
}

function readTop(game) {
  var sh = getSheet(game);
  var last = sh.getLastRow();
  if (last < 2) return [];
  var values = sh.getRange(2, 1, last - 1, 3).getValues();
  var entries = [];
  for (var i = 0; i < values.length; i++) {
    var ts = values[i][0];
    var nm = values[i][1];
    var sc = Number(values[i][2]);
    if (!nm || !isFinite(sc)) continue;
    entries.push({
      name:  String(nm).slice(0, MAX_NAME_LEN),
      score: sc,
      ts:    (ts instanceof Date) ? ts.getTime() : Date.parse(ts) || 0
    });
  }
  // Sort desc by score, then asc by ts (earliest first on ties).
  entries.sort(function (a, b) {
    if (b.score !== a.score) return b.score - a.score;
    return a.ts - b.ts;
  });
  return entries.slice(0, TOP_N);
}


// ======== UTIL ========
function sanitizeName(raw) {
  if (raw == null) return '';
  var s = String(raw);
  // Strip HTML-ish brackets defensively, control chars, and trim.
  s = s.replace(/[<>]/g, '').replace(/[\u0000-\u001F\u007F]/g, '').trim();
  return s.slice(0, MAX_NAME_LEN);
}

function throttled(game, name) {
  var key = 'cd:' + game + ':' + name;
  var props = PropertiesService.getScriptProperties();
  var last = Number(props.getProperty(key) || 0);
  var now = Date.now();
  if (now - last < WRITE_COOLDOWN_MS) return true;
  props.setProperty(key, String(now));
  return false;
}

function jsonOut(obj, _status) {
  // Apps Script doesn't honor custom HTTP status codes for Web Apps, but
  // we still attach `error` to the body so the client can branch.
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
