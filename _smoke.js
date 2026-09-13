const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const m=html.match(/<script id="engine">([\s\S]*?)<\/script>/);
if(!m){ fs.writeFileSync(path.join(__dirname,'_smoke.log'),'FAIL: engine not found\n'); process.exit(1); }
const ctx={console,Math,Object,Array,JSON,String,globalThis:{}};
ctx.globalThis=ctx; vm.createContext(ctx); vm.runInContext(m[1],ctx,{filename:'engine.js'});
const C=ctx.CRC;

let pass=0,fail=0; const fails=[];
function ok(name,cond){ if(cond){pass++;} else {fail++; fails.push(name);} }

// 1) published standard test vectors (the hard correctness gate)
ok('crc32("123456789")==0xCBF43926', C.crc32(C.strToBytes('123456789'))===0xCBF43926);
ok('crc16("123456789")==0x29B1',     C.crc16(C.strToBytes('123456789'))===0x29B1);
ok('adler32("123456789")==0x091E01DE', C.adler32(C.strToBytes('123456789'))===0x091E01DE);
ok('fnv1a32("a")==0xE40C292C', C.fnv1a32(C.strToBytes('a'))===0xE40C292C);
ok('fnv1a32("foobar")==0xBF9CF968', C.fnv1a32(C.strToBytes('foobar'))===0xBF9CF968);

// 2) CRC-32 edge cases
ok('crc32("")==0', C.crc32(C.strToBytes(''))===0);
ok('crc32("a")==0xE8B7BE43', C.crc32(C.strToBytes('a'))===0xE8B7BE43);
ok('crc32("The quick brown fox jumps over the lazy dog")==0x414FA339',
   C.crc32(C.strToBytes('The quick brown fox jumps over the lazy dog'))===0x414FA339);

// 3) determinism
ok('determinism(crc32)', C.crc32(C.strToBytes('hello'))===C.crc32(C.strToBytes('hello')));
ok('determinism(crc16)', C.crc16(C.strToBytes('hello'))===C.crc16(C.strToBytes('hello')));

// 4) CRC-32 residue closure: msg + littleEndian(CRC(msg)) -> constant (the killer invariant).
//    Reference residue computed from a known message; every message must reproduce it.
function le32(n){ return [n&0xff,(n>>8)&0xff,(n>>16)&0xff,(n>>24)&0xff]; }
const refMsg=C.strToBytes('123456789');
const refResidue=C.crc32(refMsg.concat(le32(C.crc32(refMsg))));
ok('crc32-residue === CRC32_CHECK', refResidue===C.CRC32_CHECK);
let closed=0;
for (let i=0;i<300;i++){
  const s='sample-'+i+'-'+Math.random().toString(36).slice(2);
  const b=C.strToBytes(s);
  const full=b.concat(le32(C.crc32(b)));
  if (C.crc32(full)===refResidue) closed++;
}
ok('crc32-residue-closure x300', closed===300);

// 5) UTF-8 multibyte: 晨 = [0xE6,0x99,0x9F]; crc stable across equal strings
ok('utf8-晨-bytes', C.strToBytes('晨').join(',')==='230,153,168');
const zh=C.strToBytes('晨星SudoForge校验和');
ok('utf8-multibyte-deterministic', C.crc32(zh)===C.crc32(C.strToBytes('晨星SudoForge校验和')));

const summary=`PASS ${pass} / ${pass+fail}\n`+(fail?('FAIL '+fails.join(' | ')):'ALL GREEN');
fs.writeFileSync(path.join(__dirname,'_smoke.log'), summary+'\n');
console.log(summary);
process.exit(fail?1:0);
