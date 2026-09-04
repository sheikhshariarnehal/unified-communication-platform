import assert from 'assert';

// 1. Normalization logic tests
function cleanText(input) {
  if (!input) return '';
  return input
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRating(input) {
  if (!input) return undefined;
  const match = input.replace(',', '.').match(/(\d+\.\d+|\d+)/);
  if (match) {
    const val = parseFloat(match[1]);
    if (!isNaN(val) && val >= 0 && val <= 5) {
      return Math.round(val * 10) / 10;
    }
  }
  return undefined;
}

function parseReviewCount(input) {
  if (!input) return undefined;
  const cleaned = input.toLowerCase().replace(/,/g, '');
  const kMatch = cleaned.match(/([\d.]+)\s*k/);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);
  const match = cleaned.match(/\(?(\d+)\)?/);
  if (match) {
    const val = parseInt(match[1], 10);
    return isNaN(val) ? undefined : val;
  }
  return undefined;
}

function normalizePhone(rawPhone) {
  if (!rawPhone) return {};
  const trimmed = cleanText(rawPhone);
  if (!trimmed) return {};
  let cleaned = trimmed.replace(/[^\d+]/g, '');
  let normalized = cleaned;
  if (cleaned.startsWith('00')) {
    normalized = '+' + cleaned.substring(2);
  }
  return { raw: trimmed, normalized: normalized || trimmed };
}

function cleanMapsUrl(rawUrl) {
  if (!rawUrl) return undefined;
  try {
    const url = new URL(rawUrl, 'https://www.google.com');
    ['ved', 'authuser', 'entry', 'g_ep', 'ei'].forEach(p => url.searchParams.delete(p));
    return url.origin + url.pathname + (url.search ? url.search : '');
  } catch {
    return rawUrl.split('?')[0];
  }
}

function extractCoordinates(url) {
  if (!url) return {};
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  }
  return {};
}

// 2. CSV Generator test
function escapeCsvValue(val) {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// RUN TESTS
console.log('Running LeadMap Core Logic Tests...\n');

// Test 1: Phone normalization
{
  const res1 = normalizePhone('+880 1342-716821');
  assert.strictEqual(res1.raw, '+880 1342-716821');
  assert.strictEqual(res1.normalized, '+8801342716821');

  const res2 = normalizePhone('01342 716821');
  assert.strictEqual(res2.raw, '01342 716821');
  assert.strictEqual(res2.normalized, '01342716821');
  console.log('✓ Phone normalization passed');
}

// Test 2: Rating & Reviews
{
  assert.strictEqual(parseRating('4.6 stars'), 4.6);
  assert.strictEqual(parseRating('4,8 of 5'), 4.8);
  assert.strictEqual(parseReviewCount('(263)'), 263);
  assert.strictEqual(parseReviewCount('1,420 reviews'), 1420);
  assert.strictEqual(parseReviewCount('2.5K reviews'), 2500);
  console.log('✓ Rating and Review parsing passed');
}

// Test 3: URL cleaner & coordinates
{
  const dirtyUrl = 'https://www.google.com/maps/place/Gadget+Shop/@23.7937,90.4066,15z/data=!4m?ved=0ahUKEw&entry=ttu';
  const cleaned = cleanMapsUrl(dirtyUrl);
  assert.ok(!cleaned.includes('ved='));
  assert.ok(!cleaned.includes('entry='));

  const coords = extractCoordinates(dirtyUrl);
  assert.strictEqual(coords.lat, 23.7937);
  assert.strictEqual(coords.lng, 90.4066);
  console.log('✓ URL cleaning and Coordinate extraction passed');
}

// Test 4: CSV escaping & Unicode
{
  assert.strictEqual(escapeCsvValue('Simple'), 'Simple');
  assert.strictEqual(escapeCsvValue('Name, with comma'), '"Name, with comma"');
  assert.strictEqual(escapeCsvValue('He said "Hello"'), '"He said ""Hello"""');
  assert.strictEqual(escapeCsvValue('ব্যবসা বাংলাদেশ'), 'ব্যবসা বাংলাদেশ');
  console.log('✓ CSV escaping and Unicode support passed');
}

console.log('\nAll LeadMap Core Unit Tests Passed Successfully!');
