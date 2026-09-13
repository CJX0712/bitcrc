const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const m=html.match(/<script id="engine">([\s\S]*?)<\/script>/);
const ctx={console,Math,Object,Array,JSON,String,globalThis:{}};
ctx.globalThis=ctx; vm.createContext(ctx); vm.runInContext(m[1],ctx,{filename:'engine.js'});
const C=ctx.CRC;
function h(n,w){ return '0x'+(n>>>0).toString(16).toUpperCase().padStart(w,'0'); }

const samples=['', '123456789', 'Hello, World!', '晨星 BitCrc 校验和锻造炉'];
let txt='';
for (const s of samples){
  const b=C.strToBytes(s);
  txt += `IN : ${JSON.stringify(s)}  (${b.length} bytes)\n`;
  txt += `CRC32  : ${h(C.crc32(b),8)}\n`;
  txt += `CRC16  : ${h(C.crc16(b),4)}\n`;
  txt += `ADLER32: ${h(C.adler32(b),8)}\n`;
  txt += `FNV1a  : ${h(C.fnv1a32(b),8)}\n`;
  txt += `bytes  : ${b.map(x=>x.toString(16).padStart(2,'0')).join(' ')}\n\n`;
}
txt += `CRC32_CHECK (residue) = ${h(C.CRC32_CHECK,8)}\n`;
fs.writeFileSync(path.join(__dirname,'_probe.txt'), txt);
console.log(txt);
