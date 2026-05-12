(function(){
  const products = window.PRODUCTS || [];
  const qs = (s, r=document)=>r.querySelector(s);
  const qsa = (s, r=document)=>[...r.querySelectorAll(s)];
  const state = { query:'', category:'all', selected:null };
  const imgFallback = 'real-assets/real-1.jpg';
  const categories = ['all', ...Array.from(new Set(products.map(p=>p.category)))];
  const labels = Object.fromEntries(products.map(p=>[p.category,p.categoryLabel]));
  labels.all='Все';
  function norm(v){ return String(v||'').toLowerCase().replace(/ё/g,'е'); }
  function filtered(){
    const q=norm(state.query);
    return products.filter(p=>{
      const hay=norm([p.name,p.categoryLabel,p.oem,p.group,(p.tags||[]).join(' ')].join(' '));
      return (state.category==='all'||p.category===state.category) && (!q || hay.includes(q));
    });
  }
  function productCard(p){
    return `<article class="product-card" tabindex="0" role="button" data-id="${p.id}" aria-label="Открыть карточку ${escapeHtml(p.name)}">
      <img src="${p.image||imgFallback}" alt="${escapeHtml(p.name)}" loading="lazy">
      <div class="product-body">
        <div class="tags">${(p.tags||[]).slice(0,3).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
        <h3>${escapeHtml(p.name)}</h3>
        <div class="meta-row">
          <div class="meta"><span>код</span><strong>${escapeHtml(p.oem||'—')}</strong></div>
          <div class="meta"><span>остаток</span><strong>${escapeHtml(p.stock)}</strong></div>
          <div class="meta"><span>продажа</span><strong>КП</strong></div>
        </div>
      </div>
    </article>`;
  }
  function renderChips(){
    const el=qs('#chips'); if(!el) return;
    el.innerHTML=categories.map(c=>`<button class="chip ${state.category===c?'active':''}" data-cat="${c}">${escapeHtml(labels[c]||c)}</button>`).join('');
  }
  function render(){
    renderChips();
    const grid=qs('#productGrid'); const count=qs('#resultCount'); if(!grid) return;
    const rows=filtered();
    if(count) count.textContent = `${rows.length} позиций`;
    grid.innerHTML = rows.length ? rows.map(productCard).join('') : `<div class="empty"><strong>Ничего не найдено</strong><p>Попробуй: затвор, DN300, фильтр, вибратор, MIX, OMB.</p></div>`;
  }
  function openProduct(id){
    const p=products.find(x=>x.id===id); if(!p) return;
    state.selected=p;
    qs('#drawerImg').src=p.image||imgFallback; qs('#drawerImg').alt=p.name;
    qs('#drawerTitle').textContent=p.name;
    qs('#drawerSub').textContent=`${p.categoryLabel} · ${p.group}`;
    qs('#drawerSpecs').innerHTML=(p.specs||[]).map(([a,b])=>`<div><span>${escapeHtml(a)}</span><strong>${escapeHtml(b)}</strong></div>`).join('');
    qs('#drawerNote').textContent=p.note||'';
    qs('#drawer').classList.add('open');
    qs('#drawer').setAttribute('aria-hidden','false');
  }
  function closeDrawer(){ const d=qs('#drawer'); if(d){ d.classList.remove('open'); d.setAttribute('aria-hidden','true'); }}
  function openRfq(){
    const p=state.selected;
    const title=p?`КП: ${p.name}`:'Запрос КП по запчастям';
    const body=p?`Здравствуйте. Прошу подготовить КП по позиции: ${p.name}. Артикул/код: ${p.oem}. Количество: __. Срок: __. Фото узла или шильдика приложу при необходимости.`:'Здравствуйте. Нужна КП или подбор запчасти. Укажу узел, количество, срок и приложу фото при наличии.';
    const mail=`mailto:sales@limpeks.ru?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    window.location.href=mail;
  }
  function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
  document.addEventListener('click',e=>{
    const chip=e.target.closest('[data-cat]'); if(chip){ state.category=chip.dataset.cat; render(); return; }
    const card=e.target.closest('.product-card[data-id]'); if(card){ openProduct(card.dataset.id); return; }
    if(e.target.closest('[data-close]')) closeDrawer();
    if(e.target.closest('[data-rfq]')) openRfq();
    if(e.target.closest('[data-scroll-products]')) qs('#catalog')?.scrollIntoView({behavior:'smooth'});
  });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeDrawer(); if(e.key==='Enter'&&e.target.closest('.product-card[data-id]')) openProduct(e.target.closest('.product-card').dataset.id); });
  document.addEventListener('input',e=>{ if(e.target.matches('#searchInput')){ state.query=e.target.value; render(); }});
  window.addEventListener('DOMContentLoaded',()=>{
    const si=qs('#searchInput'); if(si) state.query=si.value||'';
    render();
  });
})();
