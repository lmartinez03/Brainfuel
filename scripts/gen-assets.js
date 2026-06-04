// Generates simple branded placeholder PNGs so app.json icon/splash refs resolve.
// Solid Brainfuel navy with a centered cyan rounded square mark. Replace with real art later.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function makePNG(width, height, draw) {
  const rowLen = width * 4;
  const raw = Buffer.alloc((rowLen + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (rowLen + 1)] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const o = y * (rowLen + 1) + 1 + x * 4;
      const [r, g, b, a] = draw(x, y);
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(Buffer.concat([typeBuf, data])) >>> 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit, RGBA
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const NAVY = [13, 15, 26, 255];
const CYAN = [0, 245, 255, 255];

// Icon: navy bg with a centered cyan rounded square "mark"
function iconDraw(size) {
  const m = size * 0.28;        // margin
  const lo = m, hi = size - m;  // mark bounds
  const radius = size * 0.12;
  return (x, y) => {
    if (x >= lo && x <= hi && y >= lo && y <= hi) {
      // rounded-corner test
      const cx = Math.min(Math.max(x, lo + radius), hi - radius);
      const cy = Math.min(Math.max(y, lo + radius), hi - radius);
      const d = Math.hypot(x - cx, y - cy);
      if (d <= radius) return CYAN;
    }
    return NAVY;
  };
}

const dir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'icon.png'), makePNG(1024, 1024, iconDraw(1024)));
fs.writeFileSync(path.join(dir, 'adaptive-icon.png'), makePNG(1024, 1024, iconDraw(1024)));
fs.writeFileSync(path.join(dir, 'favicon.png'), makePNG(48, 48, iconDraw(48)));
// Splash: solid navy with small centered cyan mark
fs.writeFileSync(path.join(dir, 'splash.png'), makePNG(1242, 2436, (x, y) => {
  const cx = 621, cy = 1218, half = 160, radius = 60;
  const lo = [cx - half, cy - half], hi = [cx + half, cy + half];
  if (x >= lo[0] && x <= hi[0] && y >= lo[1] && y <= hi[1]) {
    const ccx = Math.min(Math.max(x, lo[0] + radius), hi[0] - radius);
    const ccy = Math.min(Math.max(y, lo[1] + radius), hi[1] - radius);
    if (Math.hypot(x - ccx, y - ccy) <= radius) return CYAN;
  }
  return NAVY;
}));
console.log('Generated icon.png, adaptive-icon.png, favicon.png, splash.png');
