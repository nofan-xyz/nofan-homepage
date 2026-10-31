'use strict';
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const data = window.NOFAN_DATA;
let toastTimer;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3000); }
async function copyCode(code) {
  const value = `:${code}:`;
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(value); }
    else { const field = document.createElement('textarea'); field.value=value; field.style.position='fixed'; field.style.top='-1000px'; document.body.append(field); field.select(); const copied=document.execCommand('copy'); field.remove(); if(!copied) throw Error('copy'); }
    toast(`已复制 ${value}`);
  } catch { toast(`短码：${value}`); }
}
function closeNavigation() { $('#navigation').classList.remove('open'); $('#menu-toggle').setAttribute('aria-expanded','false'); }
$('#menu-toggle').addEventListener('click',()=>{const open=$('#navigation').classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',String(open));});
$$('#navigation a').forEach(a=>a.addEventListener('click',()=>{closeNavigation();$('.more').open=false;}));
document.addEventListener('click',e=>{if(!e.target.closest('.more')) $('.more').open=false; if(!e.target.closest('.site-header')) closeNavigation();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeNavigation();$('.more').open=false;}});

const featureData = {
  writing:{title:'长文与富文本',file:'assets/features/rich-text.png',alt:'纯文本、Markdown 和 HTML 发布格式菜单',description:'每条嘟文最多 5000 字符，可选择纯文本、Markdown 或 HTML，也可设置默认格式。格式符号计入字数，HTML 会经过安全清洗。'},
  search:{title:'中文搜索与筛选',file:'assets/features/search-filters.png',alt:'搜索结果中的时间、范围、作者和内容筛选',description:'中文检索经过优化，还可按时间、范围、作者及内容筛选，或指定日期范围。公开搜索仅包含作者允许进入公开搜索的公开嘟文。'},
  accounts:{title:'快速切换账号',file:'assets/features/account-switcher.png',alt:'账号菜单中的已保存账号与登录另一个账号入口',description:'在同一浏览器保存最多 5 个本站账号，使用菜单切换。添加账号需正常登录；切换前会提示未发布草稿可能丢失。不支持跨站点切换。'}
};
let activeFeature='writing';
for(const b of $$('[data-feature]')) {
  b.querySelector('strong').dataset.short={writing:'长文与格式',search:'搜索与筛选',accounts:'账号切换'}[b.dataset.feature];
  b.addEventListener('click',()=>showFeature(b.dataset.feature));
}
function showFeature(key){activeFeature=key;const item=featureData[key];$$('[data-feature]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.feature===key)));$('#feature-image').src=item.file.replace('.png','-detail.png');$('#feature-image').alt=item.alt;$('#feature-description').textContent=item.description;}
showFeature('writing');
function zoom(file,title,note=''){ $('#image-dialog-title').textContent=title;$('#dialog-image').src=file;$('#dialog-image').alt=title;$('#dialog-image-note').textContent=note;$('#image-dialog').showModal(); }
$('#feature-zoom').addEventListener('click',()=>{const item=featureData[activeFeature];zoom(item.file,item.title,'nofan 实际界面截图。');});
$$('dialog').forEach(dialog=>{dialog.querySelector('.close-button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const box=dialog.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)dialog.close();}});});
$$('dialog').forEach(dialog=>dialog.addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;
  const controls=[...dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')].filter(el=>el.getClientRects().length>0);
  const first=controls[0],last=controls.at(-1);
  if(!first)return;
  if(e.shiftKey&&(document.activeElement===first||!dialog.contains(document.activeElement))){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&(document.activeElement===last||!dialog.contains(document.activeElement))){e.preventDefault();first.focus();}
}));

const curatedKey='__featured__';
const curatedCategories=['sheep','raccoon','blobcat','neocat','acnh','nekomimi','aru','xiaohongshu'];
const curatedItems=curatedCategories.flatMap(category=>data.groups.find(g=>g.category===category).samples.slice(0,2));
let activeGroup=curatedKey;
$('#emoji-total').textContent=`${data.groups.length} 个分组 / ${data.emojiCount} 个表情`;
function emojiButton(item,remote=false){
  const button=document.createElement('button');button.className='emoji-item';button.type='button';button.title=`复制 :${item.name}:`;button.setAttribute('aria-label',`复制表情短码 :${item.name}:`);
  const img=document.createElement('img');img.src=remote?item.url:item.file;img.alt='';img.width=70;img.height=70;if(remote)img.loading='lazy';
  img.addEventListener('error',()=>{img.hidden=true;button.title=`图片暂时无法加载；点击复制 :${item.name}:`;button.classList.add('image-unavailable');});
  const label=document.createElement('small');label.textContent=item.name;button.append(img,label);button.addEventListener('click',()=>copyCode(item.name));return button;
}
function groupNav(filter=''){
  const list=$('#group-list');list.replaceChildren();const groups=data.groups.filter(g=>g.category.toLocaleLowerCase().includes(filter.toLocaleLowerCase()));
  const includeFeatured='精选表情'.includes(filter.toLocaleLowerCase());
  $('#group-empty').hidden=groups.length>0||includeFeatured;
  if(includeFeatured){const b=document.createElement('button');b.type='button';b.className='group-button';b.dataset.category=curatedKey;b.setAttribute('aria-pressed',String(activeGroup===curatedKey));const name=document.createElement('span');name.textContent='精选表情';const count=document.createElement('span');count.textContent=curatedItems.length;b.append(name,count);b.addEventListener('click',()=>showGroup(curatedKey));list.append(b);}
  for(const group of groups){const b=document.createElement('button');b.className='group-button';b.type='button';b.dataset.category=group.category;b.setAttribute('aria-pressed',String(group.category===activeGroup));const name=document.createElement('span');name.textContent=group.category;const count=document.createElement('span');count.textContent=group.total;b.append(name,count);b.addEventListener('click',()=>showGroup(group.category));list.append(b);}
}
const featuredOption=document.createElement('option');featuredOption.value=curatedKey;featuredOption.textContent=`精选表情 · ${curatedItems.length} 个`;$('#group-select').append(featuredOption);
for(const group of data.groups){const option=document.createElement('option');option.value=group.category;option.textContent=`${group.category} · ${group.total} 个`;$('#group-select').append(option);}
function showGroup(name){activeGroup=name;const featured=name===curatedKey;const group=featured?null:data.groups.find(g=>g.category===name);$('#emoji-title').textContent=featured?'精选表情':group.category;$('#emoji-count').textContent=featured?`${curatedItems.length} 个 · 来自 ${curatedCategories.length} 个分组`:`共 ${group.total} 个`;$('#emoji-grid').classList.toggle('curated',featured);$('#emoji-credit').textContent=featured?'精选自本站表情；各分组作者与来源见下方说明。':group.credit;$('#emoji-grid').replaceChildren(...(featured?curatedItems:group.samples).map(e=>emojiButton(e)));$('#group-select').value=name;$('#all-emoji').textContent=featured?'作者与来源 ↗':'查看整组表情 ↗';$$('.group-button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===name)));}
$('#group-search').addEventListener('input',e=>groupNav(e.target.value));$('#group-select').addEventListener('change',e=>showGroup(e.target.value));groupNav();showGroup(activeGroup);
$('#all-emoji').addEventListener('click',()=>{if(activeGroup===curatedKey){$('#all-emoji-title').textContent='精选表情 · 作者与来源';$('#emoji-dialog-hint').textContent='以下为本页精选表情对应分组的来源说明。';const rows=curatedCategories.map(category=>{const g=data.groups.find(x=>x.category===category);const p=document.createElement('p');p.className='credit-row';const strong=document.createElement('strong');strong.textContent=g.category;const span=document.createElement('span');span.textContent=g.credit;p.append(strong,span);return p;});$('#all-emoji-grid').classList.add('credits-view');$('#all-emoji-grid').replaceChildren(...rows);$('#all-emoji-status').textContent='署名沿用本站原有说明；尚未核实的作者信息不作推定。';}else{const group=data.groups.find(g=>g.category===activeGroup);$('#all-emoji-title').textContent=`${group.category} · ${group.total} 个表情`;$('#emoji-dialog-hint').textContent='点击表情复制短码。整组图片需要联网加载。';$('#all-emoji-grid').classList.remove('credits-view');$('#all-emoji-grid').replaceChildren(...group.all.map(e=>emojiButton(e,true)));$('#all-emoji-status').textContent=`${group.credit}。网络不可用时部分图片可能无法显示，短码仍可复制。`;}$('#emoji-dialog').showModal();});

const families=['Mastodon UI','Mastodon Bird UI','Tangerine UI'];let activeFamily=families[0],activeTheme;
const colors={'默认':'#6967dd','自动':'#6967dd','饭否经典':'#92cec5','松烟入墨':'#484d4d','樱花':'#eca5ba','太空饭否':'#9acbdc','素笺朱印':'#bc3925','橘色':'#fd772e','樱桃色':'#d94e8c','花岗岩':'#40464b','潟湖色':'#3099b9','紫色':'#6668fa'};
for(const family of families){const b=document.createElement('button');b.type='button';b.className='family-button';b.textContent=family;b.dataset.family=family;b.addEventListener('click',()=>showFamily(family));$('#family-tabs').append(b);}
function showFamily(family){activeFamily=family;$$('[data-family]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.family===family)));const themes=data.themes.filter(t=>t.family===family);$('#theme-options').replaceChildren();for(const t of themes){const b=document.createElement('button');b.type='button';b.className='theme-option';b.dataset.theme=t.file;const swatch=document.createElement('i');swatch.style.background=colors[t.name];swatch.setAttribute('aria-hidden','true');const label=document.createElement('span');label.textContent=t.name;b.append(swatch,label);b.addEventListener('click',()=>showTheme(t));$('#theme-options').append(b);}showTheme(themes.find(t=>t.name==='饭否经典')||themes[0]);}
function showTheme(t){activeTheme=t;$$('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===t.file)));$('#theme-image').src=t.file;$('#theme-image').alt=`${t.family} · ${t.name} 实际界面截图`;$('#theme-caption').textContent=`${t.family} / ${t.name}`;}
$('#theme-zoom').addEventListener('click',()=>zoom(activeTheme.file,`${activeTheme.family} · ${activeTheme.name}`,'浅色界面截图；此处仅供预览，不修改账号设置。'));showFamily(activeFamily);
$('#source-link').href='https://github.com/nofan-xyz';
