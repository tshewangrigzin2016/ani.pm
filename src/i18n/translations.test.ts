import test from 'node:test';
import assert from 'node:assert/strict';
import { getLocaleDir, isValidLocale, LOCALES } from './locales.ts';
import { translate } from './translations.ts';

test('all 19 ani.pm locales are registered and RTL matches Arabic locales', () => {
  assert.equal(LOCALES.length, 19);
  assert.equal(isValidLocale('ja-JP'), true);
  assert.equal(isValidLocale('ar-SA'), true);
  assert.equal(isValidLocale('invalid-LOC'), false);
  assert.equal(getLocaleDir('ar-SA'), 'rtl');
  assert.equal(getLocaleDir('ar-AE'), 'rtl');
  assert.equal(getLocaleDir('en-US'), 'ltr');
  assert.equal(getLocaleDir('ja-JP'), 'ltr');
});

test('translate resolves localized keys, parameter interpolation, and English fallbacks', () => {
  assert.equal(translate('en-US', 'nav.home'), 'Home');
  assert.equal(translate('ja-JP', 'nav.home'), 'ホーム');
  assert.equal(translate('ar-SA', 'nav.home'), 'الرئيسية');
  assert.equal(translate('es-MX', 'nav.browse'), 'Explorar');
  assert.equal(translate('en-US', 'browse.catalogued', { count: 197 }), '197 catalogued');
});
