// Life B | Painel de Resultados — Proxy GA4
// Cole este código em script.google.com e publique como aplicativo da web.
// Após colar: Executar autorizarGA4 uma vez para autorizar o GA4, depois reimplantar.

const PROPERTY_ID = '532575691';
const GA4_BASE    = 'https://analyticsdata.googleapis.com/v1beta/properties/' + PROPERTY_ID;

function doGet(e) {
  const action   = (e.parameter.action   || 'summary').toLowerCase();
  const callback = e.parameter.callback || '';

  let dateRange;
  let isToday = false;
  if (e.parameter.startDate && e.parameter.endDate) {
    dateRange = [{ startDate: e.parameter.startDate, endDate: e.parameter.endDate }];
  } else {
    const days = parseInt(e.parameter.days || '30', 10);
    isToday    = (days === 1);
    dateRange  = isToday
      ? [{ startDate: 'today', endDate: 'today' }]
      : [{ startDate: days + 'daysAgo', endDate: 'today' }];
  }

  let data;

  try {
    if (action === 'summary') {
      data = ga4Report({
        dateRanges: dateRange,
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
        ],
      });

    } else if (action === 'chart') {
      const isSingleDay = isToday || (e.parameter.startDate && e.parameter.startDate === e.parameter.endDate);
      if (isSingleDay) {
        data = ga4Report({
          dateRanges: dateRange,
          dimensions: [{ name: 'hour' }],
          metrics:    [{ name: 'activeUsers' }],
          orderBys:   [{ dimension: { dimensionName: 'hour' }, desc: false }],
        });
      } else {
        data = ga4Report({
          dateRanges: dateRange,
          dimensions: [{ name: 'date' }],
          metrics:    [{ name: 'activeUsers' }],
          orderBys:   [{ dimension: { dimensionName: 'date' }, desc: false }],
        });
      }

    } else if (action === 'pages') {
      data = ga4Report({
        dateRanges: dateRange,
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
        ],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 10,
      });

    } else if (action === 'cities') {
      data = ga4Report({
        dateRanges: dateRange,
        dimensions: [{ name: 'region' }, { name: 'city' }],
        metrics:    [{ name: 'activeUsers' }],
        orderBys:   [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 20,
      });

    } else if (action === 'sources') {
      data = ga4Report({
        dateRanges: dateRange,
        dimensions: [{ name: 'sessionSourceMedium' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
        ],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 10,
      });

    } else if (action === 'events') {
      data = ga4Report({
        dateRanges: dateRange,
        dimensions: [{ name: 'eventName' }],
        metrics:    [{ name: 'eventCount' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            inListFilter: {
              values: [
                'Lead_Formulario',
                'Abrir_Formulario',
                'Preencheu_Formulario',
                'Abandonou_Formulario',
                'Pular_Formulario',
                'ScrollDepth_25',
                'ScrollDepth_50',
                'ScrollDepth_75',
                'ScrollDepth_100',
              ],
            },
          },
        },
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      });

    } else if (action === 'leads') {
      const dim  = (e.parameter.dim || 'pagePath');
      const dims = dim.split(',').map(d => ({ name: d.trim() }));
      data = ga4Report({
        dateRanges: dateRange,
        dimensions: dims,
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: { matchType: 'EXACT', value: 'Lead_Formulario' },
          },
        },
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      });

    } else if (action === 'realtime') {
      data = ga4Realtime({
        metrics: [{ name: 'activeUsers' }],
      });

    } else {
      data = { error: 'Ação desconhecida: ' + action };
    }
  } catch (err) {
    data = { error: err.toString() };
  }

  const json = JSON.stringify(data);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function ga4Report(body) {
  const token    = ScriptApp.getOAuthToken();
  const url      = GA4_BASE + ':runReport';
  const response = UrlFetchApp.fetch(url, {
    method:           'post',
    headers:          { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    payload:          JSON.stringify(body),
    muteHttpExceptions: true,
  });
  return JSON.parse(response.getContentText());
}

function ga4Realtime(body) {
  const token    = ScriptApp.getOAuthToken();
  const url      = GA4_BASE + ':runRealtimeReport';
  const response = UrlFetchApp.fetch(url, {
    method:           'post',
    headers:          { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    payload:          JSON.stringify(body),
    muteHttpExceptions: true,
  });
  return JSON.parse(response.getContentText());
}

function autorizarGA4() {
  const resultado = ga4Report({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    metrics: [{ name: 'activeUsers' }],
  });
  Logger.log(JSON.stringify(resultado));
}
