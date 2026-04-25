const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const store = {
    get(k, def){ try{ const v = localStorage.getItem(k); return v? JSON.parse(v): def; } catch(e){ return def; } },
    set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  };
  const nowStr = () => new Date().toLocaleString();
  const bubbles = $('#bubbles');
  for (let i=0;i<30;i++){
    const b = document.createElement('div');
    b.className='bubble';
    b.style.left = Math.random()*100+'%';
    const s = 10 + Math.random()*30; b.style.width=s+'px'; b.style.height=s+'px';
    b.style.animationDelay = (Math.random()*8)+'s';
    b.style.animationDuration = (10+Math.random()*12)+'s';
    bubbles.appendChild(b);
  }
  const AVATARS = ["😀","🐱","🦊","🐼","🐵","🐯","🐸","🐨","🐶","🐰","🦄","🐙","🐧","🐢","🐝","🐉","👩‍🎓","👨‍🎓","🤖","👑"];
  const AVATAR_PRICES = [30, 50, 70, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 700, 800, 900, 1000, 2500, 5000];
  let unlocked = store.get('mqc_unlocked', {0:true,1:true});
  let selectedAvatar = store.get('mqc_avatar', 0);
  let coins = store.get('mqc_coins', 10);
  let badges = store.get('mqc_badges', []);
  let soundOn = store.get('mqc_sound','on');
  $('#soundToggle').value = soundOn;
  const coinsEl = $('#coins');
  const coinsLiveEl = $('#coinsLive');
  coinsEl.textContent = coins; coinsLiveEl.textContent = coins;
  function renderAvatars(){
    const grid = $('#avatarGrid');
    grid.innerHTML='';
    AVATARS.forEach((em, idx)=>{
      const d = document.createElement('div');
      d.className = 'avatar'+(idx===selectedAvatar?' selected':'')+(unlocked[idx]? '':' locked');
      d.innerHTML = `<span>${em}</span>` + (unlocked[idx]? '': `<span class="lock">🔒 ${AVATAR_PRICES[idx]}</span>`);
      d.onclick = ()=>{ if(!unlocked[idx]) return; selectedAvatar = idx; store.set('mqc_avatar', idx); renderAvatars(); $('#avatarTag').textContent = em; };
      grid.appendChild(d);
    });
    $('#avatarTag').textContent = AVATARS[selectedAvatar];
  }
  renderAvatars();
  function updateBadgesBar(){
    $('#badgesBar').textContent = badges.length? badges.join(' • '): 'None yet';
  }
  updateBadgesBar();
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const actx = new AudioCtx();
  function beep(type="good"){ if($('#soundToggle').value==='off') return; const o = actx.createOscillator(); const g= actx.createGain(); o.connect(g); g.connect(actx.destination); if(type==='good'){o.frequency.value=880; g.gain.value=.02}else if(type==='bad'){o.frequency.value=160; g.gain.value=.03}else if(type==='time'){o.frequency.value=300; g.gain.value=.03}else{ o.frequency.value=500; g.gain.value=.02 } o.start(); setTimeout(()=>{o.stop()},120); }
  $('#soundToggle').addEventListener('change', (e)=>{ store.set('mqc_sound', e.target.value); });
  const TIMER_PRESETS = {
    normal: { Easy:300, Medium:150, Hard:75 },
    speed: { Easy:0, perQ:10, Medium:0, perQ_M:5, Hard:0, perQ_H:2.5 },
    mulonly: { Easy:600, Medium:300, Hard:150 },
    boss: { Easy:300, Medium:150, Hard:75 },
    practice: { Easy:0, Medium:0, Hard:0 },
    spelling: { Easy:300, Medium:150, Hard:75 },
    mixed: { Easy:300, Medium:150, Hard:75 },
    survival:{ Easy:300, Medium:150, Hard:75 }
  };
  const ops = ['+','-','×','÷','×','+'];
  function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
  function wordProblem(){
    const items = ['🍎 apples','🍌 bananas','🍪 cookies','🎈 balloons','⚽ balls','🍇 grapes'];
    const who = ['You','Your friend','A teacher','A shopkeeper','A panda'];
    const it = items[randInt(0,items.length-1)];
    const w = who[randInt(0,who.length-1)];
    const a = randInt(6,18), b = randInt(2,10);
    const type = randInt(0,3);
    let q, ans, hint;
    if(type===0){ q = `${w} have ${a} ${it}. They get ${b} more. How many now?`; ans=a+b; hint='Think: add more ➕'; }
    else if(type===1){ const big=Math.max(a,b), small=Math.min(a,b); q = `${w} have ${big} ${it}. They gave away ${small}. How many left?`; ans=big-small; hint='Think: take away ➖'; }
    else if(type===2){ q = `${w} have ${a} bags with ${b} ${it.split(' ')[1]} in each. How many total?`; ans=a*b; hint='Groups of same size ✖️'; }
    else { let n=b*randInt(2,9); q = `${w} share ${n} ${it.split(' ')[1]} equally among ${b} friends. How many each?`; ans=n/b; hint='Share equally ➗'; }
    return {q, ans, hint};
  }
  function simpleQuestion(difficulty, mode){
    let max = difficulty==='Easy'? 12 : difficulty==='Medium'? 20 : 30;
    let a = randInt(2, max), b = randInt(2, max);
    let op = ops[randInt(0, ops.length-1)];
    if(mode==='mulonly') op='×';
    if(mode==='spelling') op = ['+','-','×','÷'][randInt(0,3)];
    let q, ans, hint;
    if(op==='+'){ ans=a+b; q=`${a} + ${b} = ?`; hint='Add the numbers'; }
    if(op==='-'){ if(b>a) [a,b]=[b,a]; ans=a-b; q=`${a} - ${b} = ?`; hint='Subtract smaller from bigger'; }
    if(op==='×'){ ans=a*b; q=`${a} × ${b} = ?`; hint='Repeated addition'; }
    if(op==='÷'){
      b = randInt(2, difficulty==='Hard'?12:10);
      ans = randInt(2, difficulty==='Hard'?12:10);
      a = b*ans;
      q=`${a} ÷ ${b} = ?`; hint='Share equally (no remainders)';
    }
    return {q, ans, hint};
  }
  function toWords(n){
    const ones = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
    const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
    if(n<20) return ones[n];
    if(n<100) return tens[Math.floor(n/10)] + (n%10? '-'+ones[n%10]:'');
    return String(n);
  }
  function spellingQuestion(difficulty){
    const q = simpleQuestion(difficulty,'mixed');
    const w = `${toWords(q.ans)}`;
    return {q:`What is ${q.q.replace(' = ?','')}? (answer in words)`, ansWord:w, ans:q.ans, hint:'Spell the number'}
  }
  let state = {};
  function newGame(){
    const playerName = $('#playerName').value.trim();
    if (!playerName) {
      alert('Please enter name');
      return;
    }
    state = {
      name: playerName,
      diff: $('#difficulty').value,
      mode: $('#mode').value,
      qTotal: 10,
      qIndex: 0,
      score: 0,
      correct: 0,
      wrong: 0,
      lives: 3,
      history: [],
      startTime: Date.now(),
      perQuestionTime: [],
      timer: null,
      timeLeft: 0,
      totalAllowed: 0,
      coinsEarned: 0
    };
    $('#playerTag').textContent = `🙂 ${state.name}`;
    $('#qTotal').textContent = state.qTotal;
    $('#qIndex').textContent = 0;
    if(state.name.toLowerCase()==='oiia cat'){
      $('#easter').innerHTML = `<div class="card" style="margin-top:10px"><div class="badge">🐱 Special!</div><div class="subtitle">Enjoy a surprise video!</div><div style="position:relative;padding-top:56%"><iframe style="position:absolute;inset:0;width:100%;height:100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1" title="Special" allow="autoplay"></iframe></div></div>`;
    } else { $('#easter').innerHTML=''; }
    const t = TIMER_PRESETS[state.mode];
    if(state.mode==='speed'){
      state.totalAllowed = 0;
    } else {
      state.totalAllowed = t[state.diff]||0;
    }
    $('#start').style.display='none';
    $('#results').style.display='none';
    $('#game').style.display='block';
    const livesTag = $('#livesTag');
    if(state.mode==='survival') { livesTag.classList.remove('hidden'); livesTag.textContent = `❤️ x${state.lives}`; }
    else { livesTag.classList.add('hidden'); }
    coinsLiveEl.textContent = coins;
    nextQuestion();
    startTimer();
  }
  function startTimer(){
    clearInterval(state.timer);
    const bar = $('#timerBar');
    let total = state.totalAllowed;
    if(state.mode==='speed'){
      total = state.diff==='Easy'?10: state.diff==='Medium'?5:2.5;
    }
    if(state.mode==='practice') total = 0;
    let remaining = total;
    state.timeLeft = remaining;
    updateTimerText(remaining);
    if(total===0){ bar.style.width='100%'; return; }
    const startAt = Date.now();
    state.timer = setInterval(()=>{
      const elapsed = (Date.now()-startAt)/1000;
      remaining = Math.max(0, total - elapsed);
      state.timeLeft = remaining;
      updateTimerText(remaining);
      const pct = Math.max(0, remaining/total)*100;
      bar.style.width = pct+'%';
      if(remaining <= 3.2){ bar.style.background='linear-gradient(90deg, var(--bad), var(--warn))'; if(Math.ceil(remaining)===3) beep('time'); }
      if(remaining===0){ clearInterval(state.timer); timeUp(); }
    }, 100);
  }
  function updateTimerText(sec){
    if(state.mode==='practice' || (state.mode!=='speed' && state.totalAllowed===0)) { $('#timerText').textContent = '⏱️ No timer'; return; }
    const s = Math.max(0, sec);
    const m = Math.floor(s/60), r = Math.floor(s%60);
    $('#timerText').textContent = `⏱️ ${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`;
  }
  function timeUp(){
    if(state.mode==='practice') return;
    registerAnswer(null, false, true);
    beep('time');
    if(state.mode==='survival') loseLife();
    if(state.mode==='speed') {
      nextQuestion(); startTimer();
    } else {
      nextQuestion(); startTimer();
    }
  }
  function loseLife(){
    state.lives--; $('#livesTag').textContent = `❤️ x${state.lives}`;
    if(state.lives<=0){ endGame(); }
  }
  function nextQuestion(){
    if(state.qIndex>=state.qTotal){ endGame(); return; }
    state.currentStart = Date.now();
    state.qIndex++;
    $('#qIndex').textContent = state.qIndex;
    let qobj;
    const chooseWord = Math.random()<0.3;
    if(state.mode==='spelling') qobj = spellingQuestion(state.diff);
    else if(chooseWord) qobj = wordProblem();
    else qobj = simpleQuestion(state.diff, state.mode);
    state.current = qobj;
    if(state.mode==='spelling'){
      $('#question').textContent = qobj.q;
      $('#answers').innerHTML = `<input id="textAns" placeholder="Type answer in words" style="padding:12px;border-radius:12px;width:100%" />`+
        `<button class='btn' id='submitText'>Submit</button>`;
      $('#submitText').onclick = ()=>{
        const val = ($('#textAns').value||'').trim().toLowerCase();
        const correct = val===qobj.ansWord;
        registerAnswer(val, correct, false);
      };
    } else {
      $('#question').textContent = qobj.q;
      const correct = qobj.ans;
      const choices = new Set([correct]);
      while(choices.size<4){ let d = correct + randInt(-10,10); if(d===correct || d<0) continue; choices.add(d); }
      const shuffled = Array.from(choices).sort(()=>Math.random()-.5);
      $('#answers').innerHTML = '';
      shuffled.forEach(v=>{
        const b=document.createElement('button'); b.className='ans'; b.textContent=v;
        b.onclick=()=>{ const ok = v===correct; registerAnswer(v, ok, false); };
        $('#answers').appendChild(b);
      });
    }
    $('#hint').classList.add('hidden');
    $('#hint').textContent = '💡 Hint: '+ qobj.hint;
    $('#hintBtn').onclick = () => {
      if (coins >= 10) {
        coins -= 10;
        store.set('mqc_coins', coins);
        coinsEl.textContent = coins;
        coinsLiveEl.textContent = coins;
        $('#hint').classList.remove('hidden');
        beep('good');
      } else {
        alert('Not enough coins for a hint!');
        beep('bad');
      }
    };
    $('#reaction').textContent = '';
  }
  function registerAnswer(value, ok, timeout){
    const elapsed = (Date.now()-state.currentStart)/1000; state.perQuestionTime.push(elapsed);
    state.history.push({ q: state.current.q, a: state.current.ans, you: value, ok: !!ok, t: elapsed });
    if(ok){ state.score+=10; state.correct++; state.coinsEarned+=2; coins+=2; coinsEl.textContent=coins; coinsLiveEl.textContent=coins; store.set('mqc_coins', coins); reaction('🎉'); beep('good'); }
    else { state.wrong++; reaction(timeout? '⏰':'😢'); beep('bad'); if(state.mode==='survival') loseLife(); }
    $$('#answers .ans').forEach(btn=>{
      const val = Number(btn.textContent);
      if(val===state.current.ans) btn.classList.add('correct'); else btn.classList.add('wrong');
      btn.disabled=true;
    });
    setTimeout(()=>{ if(state.qIndex>=state.qTotal) endGame(); else { nextQuestion(); if(state.mode==='speed') startTimer(); } }, 550);
  }
  function reaction(emoji){ $('#reaction').textContent = emoji; }
  async function endGame(){
    clearInterval(state.timer);
    $('#game').style.display='none';
    $('#results').style.display='block';
    const accuracy = Math.round((state.correct/state.qTotal)*100);
    const allBeforeTime = state.perQuestionTime.every(t=> t< (state.mode==='speed' ? (state.diff==='Easy'?10:state.diff==='Medium'?5:2.5) : 12) );
    if(accuracy===100 && !badges.includes('🎯 100% Accuracy')) badges.push('🎯 100% Accuracy');
    if(allBeforeTime && !badges.includes('⏩ Beat The Clock')) badges.push('⏩ Beat The Clock');
    if(state.mode==='boss' && accuracy>=70 && !badges.includes('👑 Boss Conqueror')) badges.push('👑 Boss Conqueror');
    store.set('mqc_badges', badges); updateBadgesBar();
    const apiUrl = 'https://sheet2api.com/v1/jHeR8KfPTEqI/leaderboard';
    const data = {
      PlayerName: state.name,
      Score: state.score,
      TotalCoins: coins,
      EarnedCoins: state.coinsEarned,
      Badges: badges.join(', '),
      Date: new Date().toLocaleString(),
      Mode: state.mode,
      Difficulty: state.diff
    };
    try {
      const saveResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (saveResponse.ok) {
        console.log('Data saved to Google Sheets');
      } else {
        console.error('Failed to save data:', saveResponse.status);
      }
    } catch (e) {
      console.error('Error saving to Google Sheets:', e);
    }
    if(accuracy>=80) fireConfetti();
    $('#summary').textContent = `${state.name}, you scored ${state.score} with ${accuracy}% accuracy.`;
    const tbl = $('#reviewTable');
    tbl.innerHTML = `<tr><th>#</th><th>Question</th><th>Your Answer</th><th>Correct</th><th>Time (s)</th></tr>` +
      state.history.map((h,i)=>`<tr><td>${i+1}</td><td>${h.q}</td><td>${h.you??'—'}</td><td>${h.a}</td><td>${h.t.toFixed(1)}</td></tr>`).join('');
    const avg = state.perQuestionTime.reduce((a,b)=>a+b,0)/state.perQuestionTime.length;
    const hardest = state.history.reduce((m,h)=> h.ok? m : (m.t>h.t? m : h), {t:0,q:'—'}).q;
    $('#perf').innerHTML = `
      <div>✅ Correct: <b>${state.correct}</b> / ${state.qTotal}</div>
      <div>❌ Wrong: <b>${state.wrong}</b></div>
      <div>⏱️ Avg Time/Q: <b>${(avg||0).toFixed(1)}s</b></div>
      <div>🧩 Hardest: <i>${hardest||'—'}</i></div>
    `;
    const certificateSection = $('#certificateSection');
    if (state.score > 5) {
      certificateSection.style.display = 'block';
      certificateSection.querySelector('.subtitle').textContent = 'Download your certificate of achievement!';
    } else {
      certificateSection.style.display = 'none';
    }
  }
  const certModal = $('#certificateModal');
  const cert = $('#certificate');
  $('#openCert').onclick = ()=>{
    if (state.score <= 5) {
      alert('You need to score more than 5 points to earn a certificate!');
      return;
    }
    certModal.style.display='flex';
    $('#certName').textContent = state.name;
    $('#certDetails').innerHTML = `
      Completed <b>Math Quiz Challenge</b> on <b>${nowStr()}</b><br/>
      Score: <b>${state.score}</b>, Accuracy: <b>${Math.round((state.correct/state.qTotal)*100)}%</b>
    `;
    $('#certDate').textContent = `Date: ${new Date().toLocaleDateString()}`;
    $('#certId').textContent = `Certificate ID: MQC-${randInt(1,100000000)}`;
  };
  certModal.addEventListener('click', (e)=>{ if(e.target===certModal) certModal.style.display='none'; });
  $('#downloadCert').onclick = async ()=>{
    if (state.score <= 5) {
      alert('You need to score more than 5 points to earn a certificate!');
      return;
    }
    if(certModal.style.display!=='flex'){ certModal.style.display='flex'; await new Promise(r=>setTimeout(r,50)); }
    html2canvas(cert, {backgroundColor:'#ffffff'}).then(canvas=>{
      const link = document.createElement('a');
      link.download = `MQC_Certificate_${state.name.replace(/\s+/g,'_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };
  function fireConfetti(){
    const cv = $('#confetti'), ctx = cv.getContext('2d');
    const w = cv.width = innerWidth, h = cv.height = innerHeight;
    const parts = Array.from({length:160},()=>({x:Math.random()*w,y:Math.random()*h, vy:2+Math.random()*3, rot:Math.random()*6, vr:(Math.random()-.5)*.2, s:4+Math.random()*6}));
    let t=0; function step(){ ctx.clearRect(0,0,w,h); parts.forEach(p=>{ p.y+=p.vy; p.rot+=p.vr; if(p.y>h) p.y=-10; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle = `hsl(${(p.x+p.y+t)%360},80%,60%)`; ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s); ctx.restore(); }); t++; if(t<600) requestAnimationFrame(step); else ctx.clearRect(0,0,w,h); }
    step();
  }
  $('#openShop').onclick = ()=>{
    const shopModal = $('#shopModal');
    shopModal.style.display = 'flex';
    const grid = $('#shopGrid');
    grid.innerHTML = '';
    AVATARS.forEach((em,i)=>{
      const d = document.createElement('div'); 
      d.className = 'shop-avatar' + (unlocked[i] ? '' : ' locked'); 
      d.innerHTML = `<span>${em}</span>` + (unlocked[i] ? '' : `<span class='shop-lock'>${AVATAR_PRICES[i]}</span>`);
      d.onclick = ()=>{
        if(unlocked[i]){ 
          selectedAvatar = i; 
          store.set('mqc_avatar', i); 
          renderAvatars(); 
          shopModal.style.display = 'none';
          return; 
        }
        if(coins >= AVATAR_PRICES[i]){ 
          coins -= AVATAR_PRICES[i]; 
          store.set('mqc_coins', coins); 
          coinsEl.textContent = coins; 
          coinsLiveEl.textContent = coins; 
          unlocked[i] = true; 
          store.set('mqc_unlocked', unlocked); 
          renderAvatars(); 
          beep('good');
          d.classList.remove('locked');
          d.innerHTML = `<span>${em}</span>`;
        } else { 
          alert('Not enough coins!'); 
          beep('bad'); 
        }
      };
      grid.appendChild(d);
    });
  };
  $('#closeShop').onclick = ()=>{
    $('#shopModal').style.display = 'none';
  };
  $('#shopModal').addEventListener('click', (e)=>{
    if(e.target === $('#shopModal')) {
      $('#shopModal').style.display = 'none';
    }
  });
  $('#startBtn').onclick = ()=>{
    newGame();
  };
  $('#quitBtn').onclick = ()=>{ clearInterval(state.timer); $('#game').style.display='none'; $('#start').style.display='block'; };
  $('#toggleReview').onclick = ()=>{ const t = $('#reviewTable'); t.style.display = (t.style.display==='none')? 'table':'none'; };
  $('#playAgainBtn').onclick = () => { newGame(); };
  $('#resetBtn').onclick = () => {
    localStorage.clear();
    unlocked = {0:true,1:true};
    selectedAvatar = 0;
    coins = 10;
    badges = [];
    store.set('mqc_unlocked', unlocked);
    store.set('mqc_avatar', selectedAvatar);
    store.set('mqc_coins', coins);
    store.set('mqc_badges', badges);
    coinsEl.textContent = coins;
    coinsLiveEl.textContent = coins;
    renderAvatars();
    updateBadgesBar();
  };
  badges = store.get('mqc_badges', badges); updateBadgesBar();
  $('#playerName').addEventListener('input', (e)=>{ if((e.target.value||'').toLowerCase()==='oiia cat'){ $('#easter').textContent='Special mode will unlock at start!'; } else $('#easter').textContent=''; });