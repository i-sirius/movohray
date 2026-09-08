const {test} = require('node:test');
const assert = require('node:assert/strict');
const E = require('../svitlohray-engine.js');
const empty = (rows=3,cols=4) => ({rows,cols,cells:Array(rows*cols).fill(0)});
test('center, edge, corner; immutable input and involution',()=>{
  for(const [index,indices] of [[5,[1,4,5,6,9]],[1,[0,1,2,5]],[0,[0,1,4]]]){
    const b=empty(), changed=E.toggle(b,index);
    assert.deepEqual(changed.cells.flatMap((v,i)=>v?[i]:[]),indices);
    assert.deepEqual(E.toggle(changed,index),b);
    assert(b.cells.every(v=>v===0));
  }
});
test('both uniform states win; invalid data and moves rejected',()=>{
  assert(E.won(empty())); assert(E.won({...empty(),cells:Array(12).fill(1)}));
  assert(!E.won(E.toggle(empty(),0))); assert.deepEqual(E.solve(empty()),[]);
  assert.equal(E.hint(empty()),null);
  for(const i of [-1,12,.5,NaN]) assert.throws(()=>E.toggle(empty(),i));
  assert.throws(()=>E.deserialize('{"rows":5,"cols":5,"cells":[]}'));
});
test('3,000 generated boards plus arbitrary player moves solve from CURRENT state',()=>{
  let seed=346215; const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  for(const [rows,cols] of E.sizes) for(let trial=0;trial<1000;trial++){
    let b=E.generate(rows,cols,random); assert(!E.won(b));
    let initial=b; for(const m of E.solve(b)) initial=E.toggle(initial,m); assert(E.won(initial));
    for(let i=0;i<trial%31;i++) b=E.toggle(b,Math.floor(random()*rows*cols));
    assert.deepEqual(E.deserialize(E.serialize(b)),b);
    const solution=E.solve(b); assert(Array.isArray(solution));
    for(const move of solution) b=E.toggle(b,move);
    assert(E.won(b),`${rows}x${cols} trial ${trial}`);
  }
});
test('degenerate RNG terminates and produces a non-winning solvable board',()=>{
  for(const s of E.sizes) for(const random of [()=>0,()=>.999999]){
    let b=E.generate(...s,random); assert(!E.won(b));
    for(const m of E.solve(b)) b=E.toggle(b,m); assert(E.won(b));
  }
});
test('all 4096 small boards: solver agrees with independent reachable-state enumeration',()=>{
  const encode=b=>b.cells.reduce((n,v,i)=>n|(v<<i),0), reachable=new Set();
  for(let mask=0;mask<4096;mask++){
    let b=empty(); for(let i=0;i<12;i++) if(mask&(1<<i)) b=E.toggle(b,i);
    reachable.add(encode(b)); reachable.add(encode(b)^4095);
  }
  for(let mask=0;mask<4096;mask++){
    let b={...empty(),cells:Array.from({length:12},(_,i)=>(mask>>i)&1)};
    const solution=E.solve(b); assert.equal(solution!==null,reachable.has(mask));
    if(solution) {for(const m of solution) b=E.toggle(b,m);assert(E.won(b));}
  }
});
