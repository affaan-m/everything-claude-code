// Propgen - Set Capital purchases & Subscription (Detailed) table to transaction body field v1.19.28
// RULE: SUB_CAP_PURCH/*&PROPGEN_TYPE/DETAILED,BOTH
// Output: sets HTML to NS transaction body field custbody_propgen_data_field_third
// Source: PROPGEN_SCALES
//
// NOTES:
// - 2026-02-19 (v1.19.14)
//   - Add: "Additional Items" subgroup forced by ADD_ON_PRODUCTS GROUPING == "T".
//   - Add: "Additional Items Subtotal" row before Miscellaneous.
// - 2026-02-19 (v1.19.15)
//   - Fix: Additional Items were falling into Misc when PROPGEN_SCALES NAME had prefixes or non-code leading tokens.
//   - Fix: Add-on matching now extracts an add-on CODE from NAME (handles "Add On", "Addon", "Add-On", "Additional Items", and ":" patterns).
//   - Keep: Only ADD_ON_PRODUCTS GROUPING == "T" forces items into Additional Items.
// - 2026-02-19 (v1.19.16)
//   - Fix: ADD_ON_PRODUCTS grouping column is GROUPING (not ADD_ON_ITEM_GROUPING). T-set now populates correctly.
//   - Change: Section label and subtotal label use "Additional Items".
//   - Change: Additional Items NET_PRICE displays as whole-dollar ceil.
// - 2026-02-22 (v1.19.17)
//   - Change: When SUB_CAP_PURCH/SUBSCRIPTION is true, table header no longer shows "Third Party Storage Products".
// - 2026-02-23 (v1.19.18)
//   - Add: "Setup & Training - Estimated" table when onsiteFlag is true (same behavior as v1.19.10).
//   - Add: detectOnsiteFlag() based on INTALL_HRS / ONSITE_SERV_1.
//   - Change: Installation amount uses HIDDEN_OUTPUTS.PX9809 * HIDDEN_OUTPUTS.TOTAL_INTSTALL (same math as v1.19.10).
//   - Keep: Travel cost uses HIDDEN_OUTPUTS.TOTAL_TRAVEL_COST and Travel weeks uses TRAVEL.TRAVEL_TIME.
//   - Change: finalTotal uses calcInstallAmt + travelNum (aligns totals with Setup & Training table).
// - 2026-03-01 (v1.19.20)
//   - Remove: Facility-prefixed row handling (no special top section, no annual subtotal, no final total exclusion).
// - 2026-03-03 (v1.19.21)
//   - Change: Remove the "PAR Products" header text (left column header is blank).
// - 2026-03-10 (v1.19.25)
//   - Change: Remove cents from subtotal groups, totals, and Setup & Training subtotal amounts.
// - 2026-03-10 (v1.19.26)
//   - Change: Remove cents from regular line-item Net Price values.
// - 2026-03-10 (v1.19.27)
//   - Change: Remove all cents from all displayed currency values in this script.
//   - Change: Additional Items line-item and subtotal values now resolve as whole-dollar ceil with no cents.
// - 2026-03-10 (v1.19.28)
//   - Change: Add calcInstallAmt and travelNum to finalTotal only when the Setup & Training table renders.
//   - Keep: Setup & Training table render gate remains onsiteFlag.
//
// WHAT THIS DOES:
// 1) Inputs:
//    - QTable PROPGEN_SCALES: NAME, QUANTITY, NET_PRICE
//    - Grouping override QTables: FACILITY_LICENSE, SERVICE, INTERFACE, ADD_ON_PRODUCTS
//    - AnswerCodes / Values: SUB_CAP_PURCH, SUB_CAP_PURCH/CAPITAL_PURCHASE, SUB_CAP_PURCH/SUBSCRIPTION
//    - Setup & Training sources:
//      - HIDDEN_OUTPUTS.TOTAL_INTSTALL (hours)
//      - HIDDEN_OUTPUTS.PX9809 (rate)
//      - HIDDEN_OUTPUTS.TOTAL_TRAVEL_COST (travel total)
//      - TRAVEL.TRAVEL_TIME (weeks)
//      - INTALL_HRS / ONSITE_SERV_1 (onsite flag)
// 2) Outputs:
//    - Writes HTML to NS_ORDFLD.custbody_propgen_data_field_third
// 3) Logic:
//    - Buckets PROPGEN_SCALES rows into Fees, PAR Scale Products, Third Party Storage Products, Additional Items, Misc.
//    - GROUPING "T" in ADD_ON_PRODUCTS forces rows into Additional Items.
//    - Excludes "Total Implementation Hours" and "Installation Costs" from the main table.
//    - Renders Setup & Training table only when onsiteFlag is true.
//    - Renders all currency displays as whole dollars only.
//    - finalTotal equals: feeLineSum + addOnLineSum + scaleLineSum + thirdPartyLineSum + miscLineSum + conditional setup/training total.

(function buildScalesTable() {
  var OUT_GROUP = 'NS_ORDFLD';
  var OUT_FIELD = 'custbody_propgen_data_field_third';

  try {
    console.group('Propgen HTML v1.19.28');

    function safeGetQTable(name, required) {
      var t = null;
      try { t = getQTable(name); } catch (e) { t = null; }

      var info = {
        table: name,
        exists: !!t,
        hasGet: !!(t && typeof t.get === 'function'),
        hasRowCount: !!(t && typeof t.getRowCount === 'function')
      };

      console.group('QTable check: ' + name);
      console.log(info);
      console.groupEnd();

      if (required && (!t || !info.hasGet || !info.hasRowCount)) {
        throw new Error(name + ' not available');
      }

      return t;
    }

    var q = safeGetQTable('PROPGEN_SCALES', true);
    var rows = safeInt(q.getRowCount());

    var headerBlue = '#B8CCE4';
    var zebraBlue = '#F5F7FA';

    var isCapPurchase =
      truthy(getAnswerCodeSafe('SUB_CAP_PURCH/CAPITAL_PURCHASE')) ||
      truthy(getValueSafe('SUB_CAP_PURCH', 'CAPITAL_PURCHASE'));
    var isSubscription =
      truthy(getAnswerCodeSafe('SUB_CAP_PURCH/SUBSCRIPTION')) ||
      truthy(getValueSafe('SUB_CAP_PURCH', 'SUBSCRIPTION'));

    var nameHeader = '&nbsp;';

    var subCapCode = String(getAnswerCodeSafe('SUB_CAP_PURCH') || '').trim();
    var totalLabel = 'Total Project Cost';
    if (subCapCode === 'CAPITAL_PURCHASE') totalLabel = 'Total Project Cost';
    else if (subCapCode === 'SUBSCRIPTION') totalLabel = 'Total One Time Cost';

    var tFacility = buildGroupedItemSet('FACILITY_LICENSE', 'FACILITY_ITEMS', 'DESCRIPTION', 'GROUPING');
    var tService = buildGroupedItemSet('SERVICE', 'SERVICE_ITEMS', 'DESCRIPTION', 'GROUPING');
    var tInterface = buildGroupedItemSet('INTERFACE', 'INTERFACE_ITEMS', 'DESCRIPTION', 'GROUPING');
    var tAddOn = buildGroupedItemSet('ADD_ON_PRODUCTS', 'ADD_ON_ITEM_SELECT', 'ADD_ON_ITEM_DESCRIPTION', 'GROUPING');

    console.group('ADD_ON_PRODUCTS T-set');
    console.log({ addOnKeys: Object.keys(tAddOn || {}).length, isSubscription: isSubscription });
    console.groupEnd();

    var feeRows = [];
    var scaleRows = [];
    var thirdPartyRows = [];
    var addOnRows = [];
    var miscRows = [];

    var feeLineSum = 0;
    var addOnLineSum = 0;
    var scaleLineSum = 0;
    var thirdPartyLineSum = 0;
    var miscLineSum = 0;

    var softwareLicSubtotal = 0;
    var interfaceFeesSubtotal = 0;
    var serviceFeesSubtotal = 0;
    var addOnProductsSubtotal = 0;

    for (var i = 1; i <= rows; i++) {
      var name = cleanse(q.get('NAME', i));
      var qty = cleanse(q.get('QUANTITY', i));
      var net = cleanse(q.get('NET_PRICE', i));

      var allEmpty = (!name && !qty && !net) || (isFalseyWord(name) && isFalseyWord(qty) && isFalseyWord(net));
      if (allEmpty) continue;

      var netNum = parseNumber(net);
      var qtyNum = parseNumber(qty);

      if (isTotalImplementationHoursName(name)) continue;
      if (isInstallationCostsName(name)) continue;

      var subgroup = '';
      if (matchesAddOnT(name, tAddOn)) subgroup = 'addon_products';
      else if (matchesAny(name, tFacility)) subgroup = 'software';
      else if (matchesAny(name, tInterface)) subgroup = 'interface';
      else if (matchesAny(name, tService)) subgroup = 'service';

      var isFee = isFeeName(name);
      var isScale = isScaleName(name);
      var isThirdParty = isThirdPartyName(name);

      var bucket = '';
      if (subgroup === 'addon_products') bucket = 'addon_products';
      else if (subgroup) bucket = 'fee';
      else bucket = (isFee ? 'fee' : (isScale ? 'scale' : (isThirdParty ? 'third' : 'misc')));

      if (!isNaN(netNum)) {
        if (bucket === 'addon_products') {
          var extendedNet = (!isNaN(qtyNum) && qtyNum > 0) ? netNum * qtyNum : netNum;
          addOnLineSum += extendedNet;
          addOnProductsSubtotal += extendedNet;
        } else if (bucket === 'fee') {
          feeLineSum += netNum;

          if (subgroup === 'software' || isFacilityLicenseFeeName(name) || isLocationLicenseFeeName(name)) {
            softwareLicSubtotal += netNum;
          }
          if (subgroup === 'interface' || isInterfaceFeeName(name)) {
            interfaceFeesSubtotal += netNum;
          }
          if (subgroup === 'service' || isServiceFeeExactName(name) || isProjectManagementFeeName(name) || isImplementationBaseRateName(name)) {
            serviceFeesSubtotal += netNum;
          }
        } else if (bucket === 'scale') {
          scaleLineSum += netNum;
        } else if (bucket === 'third') {
          thirdPartyLineSum += netNum;
        } else {
          miscLineSum += netNum;
        }
      }

      var rowNetNum = (bucket === 'addon_products' && !isNaN(qtyNum) && qtyNum > 0) ? netNum * qtyNum : netNum;
      var rowObj = { name: name, qty: qty, net: net, netNum: rowNetNum, subgroup: subgroup, isFacilityTop: false };

      if (bucket === 'addon_products') addOnRows.push(rowObj);
      else if (bucket === 'fee') feeRows.push(rowObj);
      else if (bucket === 'scale') scaleRows.push(rowObj);
      else if (bucket === 'third') thirdPartyRows.push(rowObj);
      else miscRows.push(rowObj);
    }

    var html = '';
    html += '<figure class="table" style="width:100%;margin:0 auto;">';
    html += '<table style="width:100%;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;font-size:12pt;table-layout:auto;">';
    html += '<colgroup><col style="width:60%"><col style="width:20%"><col style="width:20%"></colgroup>';
    html += '<thead><tr>';
    html += '<th style="background-color:' + headerBlue + ';color:#000;padding:8px;text-align:left;font-weight:bold;">' + nameHeader + '</th>';
    html += '<th style="background-color:' + headerBlue + ';color:#000;padding:8px;text-align:left;font-weight:bold;">Quantity</th>';
    html += '<th style="background-color:' + headerBlue + ';color:#000;padding:8px;text-align:left;font-weight:bold;">Net Price</th>';
    html += '</tr></thead>';
    html += '<tbody>';

    var paintedIndex = 0;

    function parBarDivisorFromName(nm) {
      var s = String(nm || '').toLowerCase();
      if (s.indexOf('par bar 8') >= 0) return 8;
      if (s.indexOf('par bar 6') >= 0) return 6;
      if (s.indexOf('par bar 4') >= 0) return 4;
      return 0;
    }

    function formatQtyForDisplay(qtyRaw, divisor) {
      var n = parseNumber(qtyRaw);
      if (!isNaN(n) && divisor > 0) return String(Math.ceil(n / divisor));
      return cleanse(qtyRaw);
    }

    function formatDisplayNet(netRaw, netNum, subgroup) {
      if (subgroup === 'addon_products') {
        if (!isNaN(netNum) && netNum > 0) return formatCurrencyWholeCeilNoCents(netNum);
        return String(netRaw || '');
      }
      if (!isNaN(netNum) && netNum !== 0) return formatCurrencyNoCents(netNum);
      return String(netRaw || '');
    }

    function renderDataRow(r) {
      var divisor = parBarDivisorFromName(r.name);
      var isParBar = divisor > 0;

      var displayName = isParBar ? (String(r.name || '') + ' units') : String(r.name || '');
      var displayQty = isParBar ? formatQtyForDisplay(r.qty, divisor) : String(r.qty || '');
      var displayNet = formatDisplayNet(r.net, r.netNum, r.subgroup);

      html += '<tr style="background:' + (paintedIndex % 2 ? zebraBlue : '#FFFFFF') + ';">';
      html += '<td style="padding:8px;vertical-align:top;text-align:left;">' + escapeHtml(displayName) + '</td>';
      html += '<td style="padding:8px;vertical-align:top;text-align:left;">' + escapeHtml(displayQty) + '</td>';
      html += '<td style="padding:8px;vertical-align:top;text-align:left;">' + escapeHtml(displayNet) + '</td>';
      html += '</tr>';
      paintedIndex++;
    }

    function renderBlueRow(label, amountNum, forceWholeCeil) {
      if (!(amountNum > 0)) return;
      var disp = forceWholeCeil ? formatCurrencyWholeCeilNoCents(amountNum) : formatCurrencyNoCents(amountNum);
      html += '<tr>';
      html += '<td style="background-color:' + headerBlue + ';padding:8px;font-weight:bold;">' + escapeHtml(label) + '</td>';
      html += '<td style="background-color:' + headerBlue + ';padding:8px;"></td>';
      html += '<td style="background-color:' + headerBlue + ';padding:8px;text-align:left;font-weight:bold;">' + disp + '</td>';
      html += '</tr>';
      paintedIndex++;
    }

    feeRows.filter(function (r) { return r.subgroup === 'software' || isFacilityLicenseFeeName(r.name) || isLocationLicenseFeeName(r.name); }).forEach(renderDataRow);
    if (softwareLicSubtotal > 0) renderBlueRow('Software License Fees Subtotal', softwareLicSubtotal, false);

    feeRows.filter(function (r) { return r.subgroup === 'interface' || isInterfaceFeeName(r.name); }).forEach(renderDataRow);
    if (interfaceFeesSubtotal > 0) renderBlueRow('Interface Development Fees Subtotal', interfaceFeesSubtotal, false);

    feeRows.filter(function (r) {
      return !(r.subgroup === 'software' || r.subgroup === 'interface' || r.subgroup === 'service' || isFacilityLicenseFeeName(r.name) || isLocationLicenseFeeName(r.name) || isInterfaceFeeName(r.name) || isServiceFeeExactName(r.name) || isProjectManagementFeeName(r.name) || isImplementationBaseRateName(r.name));
    }).forEach(renderDataRow);

    feeRows.filter(function (r) {
      return r.subgroup === 'service' || isServiceFeeExactName(r.name) || isProjectManagementFeeName(r.name) || isImplementationBaseRateName(r.name);
    }).forEach(renderDataRow);
    if (serviceFeesSubtotal > 0) renderBlueRow('Service Fees Subtotal', serviceFeesSubtotal, false);

    scaleRows.forEach(renderDataRow);
    renderBlueRow('PAR Scale Products Subtotal', scaleLineSum, false);

    thirdPartyRows.forEach(renderDataRow);
    renderBlueRow('Third Party Storage Products Subtotal', thirdPartyLineSum, false);

    addOnRows.forEach(renderDataRow);
    if (addOnRows.length) renderBlueRow('Additional Items Subtotal', addOnProductsSubtotal, true);

    miscRows.forEach(renderDataRow);
    if (miscRows.length) renderBlueRow('Miscellaneous Subtotal', miscLineSum, false);

    html += '</tbody></table></figure>';

    var tlcRaw = getValueSafe('HIDDEN_OUTPUTS', 'TOTAL_TRAVEL_COST');
    var travelNum = parseNumber(tlcRaw);
    if (isNaN(travelNum)) travelNum = 0;

    var rateGlobal = parseNumber(getValueSafe('HIDDEN_OUTPUTS', 'PX9809'));
    var hoursGlobal = parseNumber(getValueSafe('HIDDEN_OUTPUTS', 'TOTAL_INTSTALL'));
    var calcInstallAmt = (rateGlobal > 0 && hoursGlobal > 0) ? (rateGlobal * hoursGlobal) : 0;

    var onsiteFlag = detectOnsiteFlag();
    var conditionalSetupTrainingTotal = 0;
    if (onsiteFlag) {
      html += '<p> </p><p> </p>';
      html += '<figure class="table" style="width:100%;margin:0 auto;">';
      html += '<table style="width:100%;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;font-size:12pt;table-layout:auto;">';
      html += '<colgroup><col style="width:60%"><col style="width:20%"><col style="width:20%"></colgroup>';
      html += '<thead><tr>';
      html += '<th style="background-color:' + headerBlue + ';color:#000;padding:8px;text-align:left;font-weight:bold;">Setup &amp; Training - Estimated</th>';
      html += '<th style="background-color:' + headerBlue + ';color:#000;padding:8px;text-align:left;font-weight:bold;">Quantity</th>';
      html += '<th style="background-color:' + headerBlue + ';color:#000;padding:8px;text-align:left;font-weight:bold;">Amount</th>';
      html += '</tr></thead><tbody>';

      var installHoursQty = cleanse(getValueSafe('HIDDEN_OUTPUTS', 'TOTAL_INTSTALL'));
      var implWeeks = cleanse(getValueSafe('TRAVEL', 'TRAVEL_TIME'));

      html += '<tr style="background:#FFFFFF;">';
      html += '<td style="padding:8px;text-align:left;">Total Implementation Hours</td>';
      html += '<td style="padding:8px;text-align:left;">' + escapeHtml(installHoursQty) + '</td>';
      html += '<td style="padding:8px;text-align:left;">' + escapeHtml(formatCurrencyNoCents(calcInstallAmt)) + '</td>';
      html += '</tr>';

      html += '<tr style="background:' + zebraBlue + ';">';
      html += '<td style="padding:8px;text-align:left;">Travel and Living / # of Weeks</td>';
      html += '<td style="padding:8px;text-align:left;">' + escapeHtml(implWeeks) + '</td>';
      html += '<td style="padding:8px;text-align:left;">' + escapeHtml(formatCurrencyNoCents(travelNum)) + '</td>';
      html += '</tr>';

      var setupTrainSubtotal = (calcInstallAmt > 0 ? calcInstallAmt : 0) + (travelNum > 0 ? travelNum : 0);
      conditionalSetupTrainingTotal = setupTrainSubtotal;

      if (setupTrainSubtotal > 0) {
        html += '<tr>';
        html += '<td style="background-color:' + headerBlue + ';padding:8px;font-weight:bold;">Setup and Training Subtotal</td>';
        html += '<td style="background-color:' + headerBlue + ';padding:8px;"></td>';
        html += '<td style="background-color:' + headerBlue + ';padding:8px;text-align:left;font-weight:bold;">' + escapeHtml(formatCurrencyNoCents(setupTrainSubtotal)) + '</td>';
        html += '</tr>';
      }

      html += '</tbody></table></figure>';
    }

    var finalTotal = feeLineSum + addOnLineSum + scaleLineSum + thirdPartyLineSum + miscLineSum + conditionalSetupTrainingTotal;

    html += '<p> </p>';
    html += '<figure class="table" style="width:100%;margin:0 auto;">';
    html += '<table style="width:100%;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;font-size:12pt;table-layout:auto;">';
    html += '<colgroup><col style="width:60%"><col style="width:20%"><col style="width:20%"></colgroup>';
    html += '<tbody><tr>';
    html += '<td style="background-color:' + headerBlue + ';padding:8px;font-weight:bold;">' + escapeHtml(totalLabel) + '</td>';
    html += '<td style="background-color:' + headerBlue + ';padding:8px;"></td>';
    html += '<td style="background-color:' + headerBlue + ';padding:8px;text-align:left;font-weight:bold;">' + escapeHtml(formatCurrencyNoCents(finalTotal)) + '</td>';
    html += '</tr></tbody></table></figure>';

    setValue(OUT_GROUP, OUT_FIELD, html);
    console.log('Wrote HTML length:', String(html || '').length);
    console.groupEnd();

    function safeInt(n) { var v = parseInt(n, 10); return isNaN(v) ? 0 : v; }
    function cleanse(v) { if (typeof v === 'boolean') return v ? 'true' : ''; if (v === undefined || v === null) return ''; if (typeof v === 'number') return String(v); return String(v).trim(); }
    function isFalseyWord(s) { return typeof s === 'string' && s.trim().toLowerCase() === 'false'; }
    function parseNumber(x) { var n = parseFloat(String(x).replace(/[^0-9.\-]/g, '')); return isNaN(n) ? NaN : n; }
    function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
    function formatCurrencyNoCents(n) { var v = +n; if (isNaN(v)) return ''; try { return '$' + Math.round(v).toLocaleString('en-US', { maximumFractionDigits: 0 }); } catch (e) { return '$' + Math.round(v); } }
    function wholeDollarCeil(n) { var v = Number(n); if (!isFinite(v) || isNaN(v)) return 0; return v > 0 ? Math.ceil(v) : 0; }
    function formatCurrencyWholeCeilNoCents(n) { var d = wholeDollarCeil(n); return '$' + Number(d).toLocaleString('en-US', { maximumFractionDigits: 0 }); }
    function getValueSafe(group, field) { try { return getValue(group, field); } catch (e) { return ''; } }
    function getAnswerCodeSafe(path) { try { return getAnswerCode(path); } catch (e) {} try { var parts = String(path).split('/'); if (parts.length > 0) return getAnswerCode(parts[0]); } catch (e2) {} return ''; }
    function truthy(val) { if (val === true) return true; var s = String(val || '').trim().toUpperCase(); return s === 'TRUE' || s === 'YES' || s === 'Y' || s === '1' || s === 'ONSITE_SERV_1'; }
    function detectOnsiteFlag() { try { if (typeof getAnswer === 'function') { var ans = getAnswer('INTALL_HRS', 'ONSITE_SERV_1'); if (ans === true) return true; } } catch (e) {} var v = getValueSafe('INTALL_HRS', 'ONSITE_SERV_1'); if (truthy(v)) return true; var code = getAnswerCodeSafe('INTALL_HRS'); if (truthy(code)) return true; var code2 = getAnswerCodeSafe('INTALL_HRS/ONSITE_SERV_1'); if (truthy(code2)) return true; return false; }
    function buildGroupedItemSet(tableCode, itemCol, descCol, groupingCol) { var out = Object.create(null); var t = safeGetQTable(tableCode, false); if (!t || typeof t.getRowCount !== 'function' || typeof t.get !== 'function') return out; var rc = +t.getRowCount() || 0; for (var i = 1; i <= rc; i++) { var g = cleanse(t.get(groupingCol, i)); if (String(g).trim().toUpperCase() !== 'T') continue; var code = cleanse(t.get(itemCol, i)); var desc = descCol ? cleanse(t.get(descCol, i)) : ''; if (!code) continue; var full = desc ? (code + ' ' + desc) : code; addKey(out, code); addKey(out, full); } return out; }
    function addKey(setObj, key) { var k = cleanse(key); if (!k) return; if (!setObj[k]) setObj[k] = true; var low = String(k).toLowerCase(); if (!setObj[low]) setObj[low] = true; }
    function matchesAny(name, setObj) { if (!setObj) return false; var nm = cleanse(name); if (!nm) return false; if (setObj[nm]) return true; var lowFull = String(nm).toLowerCase(); if (setObj[lowFull]) return true; var code = firstToken(nm); if (code) { if (setObj[code]) return true; var lowCode = String(code).toLowerCase(); if (setObj[lowCode]) return true; } return false; }
    function matchesAddOnT(name, setObj) { if (!setObj) return false; if (matchesAny(name, setObj)) return true; var code2 = extractAddOnCode(name); if (!code2) return false; if (setObj[code2]) return true; var low = String(code2).toLowerCase(); if (setObj[low]) return true; return false; }
    function extractAddOnCode(name) { var nm = cleanse(name); if (!nm) return ''; var s = String(nm); var low = s.toLowerCase(); var colonIdx = s.indexOf(':'); if (colonIdx >= 0 && colonIdx < s.length - 1) { s = s.slice(colonIdx + 1); s = s.replace(/^[\s\-]+/, ''); return firstToken(s); } if (low.indexOf('add on') === 0) s = s.slice(6); else if (low.indexOf('add-on') === 0) s = s.slice(6); else if (low.indexOf('addon') === 0) s = s.slice(5); else if (low.indexOf('add on products') === 0) s = s.slice(14); else if (low.indexOf('add-on products') === 0) s = s.slice(14); else if (low.indexOf('addon products') === 0) s = s.slice(13); else if (low.indexOf('additional items') === 0) s = s.slice(16); else if (low.indexOf('additional item') === 0) s = s.slice(15); s = s.replace(/^[\s\-]+/, ''); return firstToken(s); }
    function firstToken(s) { var t = cleanse(s); if (!t) return ''; var parts = t.split(/\s+/); return parts && parts.length ? cleanse(parts[0]) : ''; }
    function isTotalImplementationHoursName(name) { var s = String(name || '').toLowerCase().trim(); return s === 'total implementation hours' || s === 'total implementation hour'; }
    function isInstallationCostsName(name) { var s = String(name || '').toLowerCase().trim(); return s === 'installation costs' || s === 'installation cost'; }
    function isFeeName(name) { var s = String(name || '').toLowerCase().trim(); if (!s) return false; return s === 'facility license fee' || s === 'location license fee' || s === 'service fee' || s === 'addon fee' || s === 'project management fee' || s === 'implementation base rate' || s === 'interface fee'; }
    function isFacilityLicenseFeeName(name) { return String(name || '').toLowerCase().trim() === 'facility license fee'; }
    function isLocationLicenseFeeName(name) { return String(name || '').toLowerCase().trim() === 'location license fee'; }
    function isInterfaceFeeName(name) { return String(name || '').toLowerCase().trim() === 'interface fee'; }
    function isServiceFeeExactName(name) { return String(name || '').toLowerCase().trim() === 'service fee'; }
    function isProjectManagementFeeName(name) { return String(name || '').toLowerCase().trim() === 'project management fee'; }
    function isImplementationBaseRateName(name) { return String(name || '').toLowerCase().trim() === 'implementation base rate'; }
    function isScaleName(name) { var s = String(name || '').toLowerCase(); if (!s) return false; return s.indexOf('cantilever 15k') >= 0 || s.indexOf('cantilever') >= 0 || s.indexOf('small/medium platform') >= 0 || s.indexOf('par bar 8') >= 0 || s.indexOf('par bar 6') >= 0 || s.indexOf('par bar 4') >= 0 || s.indexOf('large platform') >= 0 || s.indexOf('cath hanger') >= 0 || s.indexOf('controller') >= 0 || s.indexOf('hardware accessories') >= 0 || s.indexOf('qr tags') >= 0; }
    function isThirdPartyName(name) { var s = String(name || '').toLowerCase(); if (!s) return false; return s === 'bridges' || s === 'dunnage' || s === 'free standing louvers' || s === 'wall mounted louvers' || s === 'plastic bins' || s === 'wire mesh bins'; }

  } catch (e) {
    var msg = (e && e.message) ? e.message : String(e || 'Unknown error');
    try { setValue('NS_ORDFLD', 'custbody_propgen_data_field_third', '<p>Propgen error v1.19.28: ' + escapeHtml(msg) + '</p>'); } catch (e2) {}
    console.group('Propgen HTML error v1.19.28');
    console.log(msg);
    console.groupEnd();
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();