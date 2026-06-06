/* Joseph Myers MD5 implementation (via spark-md5, MIT) */

const HEX = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

function add32(a: number, b: number) {
  return (a + b) & 0xffffffff;
}

function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
  a = add32(add32(a, q), add32(x, t));
  return add32((a << s) | (a >>> (32 - s)), b);
}

function md5cycle(x: number[], k: number[]) {
  let a = x[0];
  let b = x[1];
  let c = x[2];
  let d = x[3];

  a = cmn((b & c) | (~b & d), a, b, k[0], 7, -680876936);
  d = cmn((a & b) | (~a & c), d, a, k[1], 12, -389564586);
  c = cmn((d & a) | (~d & b), c, d, k[2], 17, 606105819);
  b = cmn((c & d) | (~c & a), b, c, k[3], 22, -1044525330);
  a = cmn((b & c) | (~b & d), a, b, k[4], 7, -176418897);
  d = cmn((a & b) | (~a & c), d, a, k[5], 12, 1200080426);
  c = cmn((d & a) | (~d & b), c, d, k[6], 17, -1473231341);
  b = cmn((c & d) | (~c & a), b, c, k[7], 22, -45705983);
  a = cmn((b & c) | (~b & d), a, b, k[8], 7, 1770035416);
  d = cmn((a & b) | (~a & c), d, a, k[9], 12, -1958414417);
  c = cmn((d & a) | (~d & b), c, d, k[10], 17, -42063);
  b = cmn((c & d) | (~c & a), b, c, k[11], 22, -1990404162);
  a = cmn((b & c) | (~b & d), a, b, k[12], 7, 1804603682);
  d = cmn((a & b) | (~a & c), d, a, k[13], 12, -40341101);
  c = cmn((d & a) | (~d & b), c, d, k[14], 17, -1502002290);
  b = cmn((c & d) | (~c & a), b, c, k[15], 22, 1236535329);

  a = cmn((b & d) | (c & ~d), a, b, k[1], 5, -165796510);
  d = cmn((a & c) | (b & ~c), d, a, k[6], 9, -1069501632);
  c = cmn((d & b) | (a & ~b), c, d, k[11], 14, 643717713);
  b = cmn((c & a) | (d & ~a), b, c, k[0], 20, -373897302);
  a = cmn((b & d) | (c & ~d), a, b, k[5], 5, -701558691);
  d = cmn((a & c) | (b & ~c), d, a, k[10], 9, 38016083);
  c = cmn((d & b) | (a & ~b), c, d, k[15], 14, -660478335);
  b = cmn((c & a) | (d & ~a), b, c, k[4], 20, -405537848);
  a = cmn((b & d) | (c & ~d), a, b, k[9], 5, 568446438);
  d = cmn((a & c) | (b & ~c), d, a, k[14], 9, -1019803690);
  c = cmn((d & b) | (a & ~b), c, d, k[3], 14, -187363961);
  b = cmn((c & a) | (d & ~a), b, c, k[8], 20, 1163531501);
  a = cmn((b & d) | (c & ~d), a, b, k[13], 5, -1444681467);
  d = cmn((a & c) | (b & ~c), d, a, k[2], 9, -51403784);
  c = cmn((d & b) | (a & ~b), c, d, k[7], 14, 1735328473);
  b = cmn((c & a) | (d & ~a), b, c, k[12], 20, -1926607734);

  a = cmn(b ^ c ^ d, a, b, k[5], 4, -378558);
  d = cmn(a ^ b ^ c, d, a, k[8], 11, -2022574463);
  c = cmn(d ^ a ^ b, c, d, k[11], 16, 1839030562);
  b = cmn(c ^ d ^ a, b, c, k[14], 23, -35309556);
  a = cmn(b ^ c ^ d, a, b, k[1], 4, -1530992060);
  d = cmn(a ^ b ^ c, d, a, k[4], 11, 1272893353);
  c = cmn(d ^ a ^ b, c, d, k[7], 16, -155497632);
  b = cmn(c ^ d ^ a, b, c, k[10], 23, -1094730640);
  a = cmn(b ^ c ^ d, a, b, k[13], 4, 681279174);
  d = cmn(a ^ b ^ c, d, a, k[0], 11, -358537222);
  c = cmn(d ^ a ^ b, c, d, k[3], 16, -722521979);
  b = cmn(c ^ d ^ a, b, c, k[6], 23, 76029189);
  a = cmn(b ^ c ^ d, a, b, k[9], 4, -640364487);
  d = cmn(a ^ b ^ c, d, a, k[12], 11, -421815835);
  c = cmn(d ^ a ^ b, c, d, k[15], 16, 530742520);
  b = cmn(c ^ d ^ a, b, c, k[2], 23, -995338651);

  a = cmn(c ^ (b | ~d), a, b, k[0], 6, -198630844);
  d = cmn(b ^ (a | ~c), d, a, k[7], 10, 1126891415);
  c = cmn(a ^ (d | ~b), c, d, k[14], 15, -1416354905);
  b = cmn(d ^ (c | ~a), b, c, k[5], 21, -57434055);
  a = cmn(c ^ (b | ~d), a, b, k[12], 6, 1700485571);
  d = cmn(b ^ (a | ~c), d, a, k[3], 10, -1894986606);
  c = cmn(a ^ (d | ~b), c, d, k[10], 15, -1051523);
  b = cmn(d ^ (c | ~a), b, c, k[1], 21, -2054922799);
  a = cmn(c ^ (b | ~d), a, b, k[8], 6, 1873313359);
  d = cmn(b ^ (a | ~c), d, a, k[15], 10, -30611744);
  c = cmn(a ^ (d | ~b), c, d, k[6], 15, -1560198380);
  b = cmn(d ^ (c | ~a), b, c, k[13], 21, 1309151649);
  a = cmn(c ^ (b | ~d), a, b, k[4], 6, -145523070);
  d = cmn(b ^ (a | ~c), d, a, k[11], 10, -1120210379);
  c = cmn(a ^ (d | ~b), c, d, k[2], 15, 718787259);
  b = cmn(d ^ (c | ~a), b, c, k[9], 21, -343485551);

  x[0] = add32(a, x[0]);
  x[1] = add32(b, x[1]);
  x[2] = add32(c, x[2]);
  x[3] = add32(d, x[3]);
}

function md5blkArray(a: Uint8Array) {
  const md5blks: number[] = [];
  for (let i = 0; i < 64; i += 4) {
    md5blks[i >> 2] =
      a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
  }
  return md5blks;
}

function rhex(n: number) {
  let s = '';
  for (let j = 0; j < 4; j += 1) {
    s +=
      HEX[(n >> (j * 8 + 4)) & 0x0f] + HEX[(n >> (j * 8)) & 0x0f];
  }
  return s;
}

function hex(x: number[]) {
  return x.map((value) => rhex(value)).join('');
}

function finish(state: number[], tail: Uint8Array, totalByteLength: number) {
  const blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const tailLength = tail.length;

  for (let i = 0; i < tailLength; i += 1) {
    blocks[i >> 2] |= tail[i] << ((i % 4) << 3);
  }
  blocks[tailLength >> 2] |= 0x80 << ((tailLength % 4) << 3);

  if (tailLength > 55) {
    md5cycle(state, blocks);
    for (let i = 0; i < 16; i += 1) {
      blocks[i] = 0;
    }
  }

  const bitLength = totalByteLength * 8;
  const tmp = bitLength.toString(16).match(/(.*?)(.{0,8})$/);
  const lo = parseInt(tmp![2], 16);
  const hi = parseInt(tmp![1], 16) || 0;
  blocks[14] = lo;
  blocks[15] = hi;
  md5cycle(state, blocks);
}

export class IncrementalMd5 {
  private buff = new Uint8Array(0);
  private totalLength = 0;
  private state = [1732584193, -271733879, -1732584194, 271733878];

  append(buffer: ArrayBuffer) {
    const incoming = new Uint8Array(buffer);
    const merged = new Uint8Array(this.buff.length + incoming.length);
    merged.set(this.buff);
    merged.set(incoming, this.buff.length);
    this.totalLength += incoming.length;

    let offset = 0;
    while (offset + 64 <= merged.length) {
      md5cycle(this.state, md5blkArray(merged.subarray(offset, offset + 64)));
      offset += 64;
    }
    this.buff = merged.subarray(offset);
  }

  end() {
    finish(this.state, this.buff, this.totalLength);
    const result = hex(this.state);
    this.buff = new Uint8Array(0);
    this.totalLength = 0;
    this.state = [1732584193, -271733879, -1732584194, 271733878];
    return result;
  }
}

export function md5ArrayBuffer(buffer: ArrayBuffer) {
  const hasher = new IncrementalMd5();
  hasher.append(buffer);
  return hasher.end();
}
