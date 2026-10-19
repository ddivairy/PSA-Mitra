import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesFileSignature } from '../lib/file-signature.mjs';

test('accepts signatures matching the allowed PDF and image MIME types', () => {
  assert.equal(matchesFileSignature(Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d]), 'application/pdf'), true);
  assert.equal(matchesFileSignature(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]), 'image/jpeg'), true);
  assert.equal(matchesFileSignature(Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]), 'image/png'), true);
  const webp = new Uint8Array(12);
  webp.set(Buffer.from('RIFF'), 0);
  webp.set(Buffer.from('WEBP'), 8);
  assert.equal(matchesFileSignature(webp, 'image/webp'), true);
});

test('rejects spoofed MIME types and unknown content types', () => {
  const html = new TextEncoder().encode('<script>alert(1)</script>');
  assert.equal(matchesFileSignature(html, 'image/png'), false);
  assert.equal(matchesFileSignature(html, 'application/pdf'), false);
  assert.equal(matchesFileSignature(Uint8Array.from([0xff, 0xd8, 0xff]), 'image/png'), false);
  assert.equal(matchesFileSignature(html, 'text/html'), false);
});
