const fs = require("fs");
const path = require("path");

const iconsDir = path.resolve(__dirname, "..", "src", "assets", "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const createPNG = (width, height, r, g, b) => {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  const crc32 = (buf) => {
    let crc = 0xFFFFFFFF;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c;
    }
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  };

  const createChunk = (type, data) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const typeBuffer = Buffer.from(type);
    const crcData = Buffer.concat([typeBuffer, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcData));
    return Buffer.concat([length, typeBuffer, data, crc]);
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b, 255);
    }
  }

  const zlib = require("zlib");
  const compressed = zlib.deflateSync(Buffer.from(rawData));

  const ihdrChunk = createChunk("IHDR", ihdr);
  const idatChunk = createChunk("IDAT", compressed);
  const iendChunk = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
};

const icons = [
  { name: "home", color: [156, 163, 175], activeColor: [79, 70, 229] },
  { name: "medical", color: [156, 163, 175], activeColor: [79, 70, 229] },
  { name: "food", color: [156, 163, 175], activeColor: [79, 70, 229] },
  { name: "disaster", color: [156, 163, 175], activeColor: [79, 70, 229] },
  { name: "community", color: [156, 163, 175], activeColor: [79, 70, 229] },
  { name: "welfare", color: [156, 163, 175], activeColor: [79, 70, 229] },
];

icons.forEach((icon) => {
  const normalIcon = createPNG(48, 48, icon.color[0], icon.color[1], icon.color[2]);
  const activeIcon = createPNG(48, 48, icon.activeColor[0], icon.activeColor[1], icon.activeColor[2]);
  fs.writeFileSync(path.join(iconsDir, `${icon.name}.png`), normalIcon);
  fs.writeFileSync(path.join(iconsDir, `${icon.name}-active.png`), activeIcon);
});

console.log("✅ Icons generated successfully");
