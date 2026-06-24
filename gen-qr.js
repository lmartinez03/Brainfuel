const QR = require('qrcode');
const opts = { width: 640, margin: 2, errorCorrectionLevel: 'M' };
const installUrl = 'https://expo.dev/accounts/lucafmartinez/projects/brainfuel/builds/2c4de814-1766-4ac7-a25e-57cb4664d669';
const connectUrl = 'brainfuel://expo-development-client/?url=http%3A%2F%2F10.252.159.236%3A8081';
Promise.all([
  QR.toFile('install-qr.png', installUrl, opts),
  QR.toFile('connect-qr.png', connectUrl, opts),
]).then(() => console.log('OK generated')).catch((e) => console.log('ERR', e.message));
