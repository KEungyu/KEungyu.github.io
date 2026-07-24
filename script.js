/* ============================================
   Eungyu Kim · Portfolio Script
   ============================================ */
 
/* ─────────────────────────────
   1. 타이핑 애니메이션 (모토)
   ───────────────────────────── */
const mottos = [
  'Turning data into decisions.',
  'Where finance meets AI.',
  'Signal in the noise.',
];
 
const typedEl = document.getElementById('typed');
let mottoIdx = 0;
let charIdx = 0;
let isDeleting = false;
 
function typeLoop() {
  if (!typedEl) return;
  const current = mottos[mottoIdx];
 
  if (!isDeleting) {
    typedEl.textContent = current.substring(0, charIdx + 1);
    charIdx++;
    if (charIdx === current.length) {
      isDeleting = true;
      setTimeout(typeLoop, 2200); // 유지
      return;
    }
    setTimeout(typeLoop, 65);
  } else {
    typedEl.textContent = current.substring(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      isDeleting = false;
      mottoIdx = (mottoIdx + 1) % mottos.length;
      setTimeout(typeLoop, 400);
      return;
    }
    setTimeout(typeLoop, 30);
  }
}
typeLoop();
 
 
/* ─────────────────────────────
   2. Neural Network Canvas
   ───────────────────────────── */
const canvas = document.getElementById('neural-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let width, height, nodes;
 
  function resize() {
    const hero = document.getElementById('hero');
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
    initNodes();
  }
 
  function initNodes() {
    const count = Math.min(60, Math.floor((width * height) / 18000));
    nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
        type: Math.random() < 0.3 ? 'g' : 'c',
      });
    }
  }
 
  function draw() {
    ctx.clearRect(0, 0, width, height);
 
    // 노드 이동
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    }
 
    // 연결선
    const maxDist = 130;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.22;
          // 시안 → 그린 은은한 그라디언트
          const gradient = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
          gradient.addColorStop(0, `rgba(6, 182, 212, ${alpha})`);
          gradient.addColorStop(1, `rgba(16, 185, 129, ${alpha})`);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
 
    // 노드
    for (const n of nodes) {
      ctx.fillStyle = n.type === 'g'
        ? 'rgba(16, 185, 129, 0.6)'
        : 'rgba(6, 182, 212, 0.55)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
 
    requestAnimationFrame(draw);
  }
 
  window.addEventListener('resize', resize);
  resize();
  draw();
}
 
 
/* ─────────────────────────────
   3. Velog 최신글 불러오기
   ───────────────────────────── */
const VELOG_RSS = 'https://v2.velog.io/rss/@rladmsrb';
const RSS2JSON = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(VELOG_RSS)}`;
 
async function loadVelogPosts() {
  const listEl = document.getElementById('velog-list');
  if (!listEl) return;
 
  try {
    const res = await fetch(RSS2JSON);
    const data = await res.json();
 
    if (!data.items || data.items.length === 0) {
      listEl.innerHTML = `
        <div class="velog-loading">
          <span class="mono">$</span> no posts yet.
        </div>`;
      return;
    }
 
    const posts = data.items.slice(0, 4); // 최근 4개
    listEl.innerHTML = posts.map(post => `
      <a href="${post.link}" target="_blank" class="velog-post">
        <div class="velog-post-meta">
          <div class="velog-post-title">${escapeHtml(post.title)}</div>
          <div class="velog-post-date">${formatDate(post.pubDate)}</div>
        </div>
        <span class="velog-post-arrow">↗</span>
      </a>
    `).join('');
  } catch (err) {
    console.error('Velog fetch failed:', err);
    listEl.innerHTML = `
      <div class="velog-loading">
        <span class="mono" style="color:#f87171">✗</span>
        불러오기 실패. <a href="https://velog.io/@rladmsrb/posts"
          target="_blank" style="color:var(--cyan);text-decoration:underline;">직접 보러가기 →</a>
      </div>`;
  }
}
 
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}
 
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
 
loadVelogPosts();
 
 
/* ─────────────────────────────
   4. 부드러운 나타남 (스크롤 시)
   ───────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });
 
document.querySelectorAll('section:not(#hero)').forEach(sec => {
  sec.style.opacity = '0';
  sec.style.transform = 'translateY(20px)';
  sec.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(sec);
});
 
