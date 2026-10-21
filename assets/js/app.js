(function(){
'use strict';
var T=window.TAX,$=function(i){return document.getElementById(i)},st={sp:1,q1:0,q2:0};
function fmt(n){return n.toLocaleString('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2})}
function num(v){var n=parseFloat(String(v).replace(/,/g,''));return isFinite(n)?n:NaN}
$('rate').value='';
document.addEventListener('input',function(e){var t=e.target;if(t.hasAttribute&&t.hasAttribute('data-num')){var dec=t.getAttribute('inputmode')==='decimal';t.value=t.value.replace(dec?/[^\d.]/g:/\D/g,'');t.classList.remove('bad');heirs()}});
function heirs(){$('heirs').textContent=((num($('kids').value)||0)+st.sp)+' 人'}
document.querySelectorAll('.seg').forEach(function(g){g.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
 g.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b)});st[g.dataset.t]=+b.dataset.v;heirs()})});
$('cur').onchange=function(){var c=this.value;$('rwrap').hidden=c==='TWD';$('rate').value=c==='USD'?T.defaults.usd:c==='JPY'?T.defaults.jpy:''};
function tax(net){if(net<=0)return 0;var B=T.gift.brackets;for(var i=0;i<B.length;i++){if(net<=B[i].upTo||i===B.length-1){return B[i].base+(net-(i?B[i-1].upTo:0))*B[i].rate}}}
function gift(v){var net=Math.max(0,v-T.gift.exemption);return{net:net,tax:tax(net)}}
function calc(){
 var m=$('msg');m.textContent='';
 var a=num($('amt').value),c=$('cur').value,r=1,n=+$('years').value,d=num($('disc').value)/100,y=num($('yld').value)/100,pay=num($('pay').value),k=num($('kids').value);
 if(c!=='TWD'){r=num($('rate').value);if(!(r>0)){$('rate').classList.add('bad');m.textContent='請輸入有效匯率。';return}}
 if(!(a>0)){m.textContent='請輸入信託資產規模（須大於 0）。';return}
 if(isNaN(k)||isNaN(y)||isNaN(pay)||!(d>0)){m.textContent='請完整輸入子女人數、折現利率、配息率與自留生活費（僅限數字，無則填 0）。';return}
 var P=a*r;
 if(pay*n>P){m.textContent='每年自留生活費 × 信託期間不可超過信託本金，請調整。';return}
 var v=Math.pow(1+d,-n),pvPay=pay*(1-v)/d;
 var gv=[null,P*v,P-P*v,Math.max(0,P-pvPay)];
 var g=gv.map(function(x){return x==null?{net:0,tax:0}:gift(x)});
 var yi=P*y*n;
 var S=[
 {name:'不使用信託',inv:0,gv:gv[1],own:'資產仍在委託人名下',left:P,flow:'不適用'，約 '+fmt(yi)},
 {name:'傳富發我 (85)',inv:P,gv:gv[1],own:'子女取得本金',left:P,flow:'孳息歸委託人，約 '+fmt(yi)},
 {name:'傳富發發 (88)',inv:P,gv:gv[2],own:'委託人取得本金',left:P,flow:'孳息歸子女，約 '+fmt(yi)},
 {name:'傳富久久 (99)',inv:P,gv:gv[3],own:'子女取得剩餘金額',left:P-pay*n,flow:'每年給付委託人 '+fmt(pay)+'，共 '+fmt(pay*n)}];
 S.forEach(function(s,i){s.net=g[i].net;s.tax=g[i].tax});
 var rec=st.q1?1:(st.q2?3:2);
 $('concl').innerHTML='最適合您的方案：'+S[rec].name+'<small>'+(st.q1?'期滿移轉本金給子女':st.q2?'本金不移轉，期間自留固定生活費':'本金不移轉，孳息移轉給子女')+'；預估贈與稅 '+fmt(S[rec].tax)+' 萬元（NT$ '+Math.round(S[rec].tax*10000).toLocaleString('zh-TW')+' 元）</small>';
 var h='<thead><tr><th>比較項目</th>'+S.map(function(s){return'<th>'+s.name+'</th>'}).join('')+'</tr></thead><tbody>';
 function row(l,f,cls){return'<tr'+(cls?' class="'+cls+'"':'')+'><td>'+l+'</td>'+S.map(function(s,i){return'<td>'+f(s,i)+'</td>'}).join('')+'</tr>'}
 h+=row('投入信託本金',function(s){return s.inv?fmt(s.inv):'0'});
 h+=row('贈與價值（稅基）',function(s){return s.gv==null?'0':fmt(s.gv)});
 h+=row('減：贈與稅免稅額',function(s){return s.gv==null?'0':fmt(T.gift.exemption)});
 h+=row('課稅贈與淨額',function(s){return fmt(s.net)});
 h+=row('預估贈與稅',function(s){return fmt(s.tax)},'key');
 h+=row('期滿後本金歸屬',function(s){return s.own});
 h+=row(n+' 年後本金／剩餘金額',function(s){return s.left==null?'不適用':fmt(s.left)});
 h+=row('信託期間現金流（配息率 '+(y*100).toFixed(2)+'%）',function(s){return s.flow});
 $('cmp').innerHTML=h+'</tbody>';
 $('cmp').querySelectorAll('tr').forEach(function(tr){var td=tr.children[rec+1];if(td&&tr.parentNode.tagName==='TBODY')td.style.outline='0'});
 chart(S,rec);
 $('detail').innerHTML='<p>信託本金折合新台幣 '+fmt(P)+' 萬；信託 '+n+' 年；折現利率 '+(d*100).toFixed(3)+'%；傳承人數 '+((k||0)+st.sp)+' 人（贈與稅免稅額 '+T.gift.exemption+' 萬為「每位贈與人每年」，不因受贈人數增加）。</p>'+
 '<p>傳富久久：每年給付 '+fmt(pay)+' 萬折現總和 '+fmt(pvPay)+' 萬；贈與價值＝本金 − 折現總和。</p>'+
 '<p>假設：僅本次贈與、同年度無其他合併計算之贈與；信託費用未計入；孳息金額以「本金 × 配息率 × 年數」簡單估算（不複利）；傳富發發之效益在孳息移轉，贈與稅基僅為本金扣除本金折現值。</p>';
 $('result').hidden=false;$('result').scrollIntoView({behavior:'smooth'});
}
function chart(S,rec){
 var W=720,H=340,pl=60,pb=50,pt=30,mx=Math.max.apply(null,S.map(function(s){return s.tax}))*1.2||1,bw=90,gap=(W-pl-4*bw)/5,ph=H-pt-pb,
 svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="預估贈與稅長條圖">';
 for(var i=0;i<=4;i++){var y=pt+ph-ph*i/4;svg+='<line x1="'+pl+'" x2="'+W+'" y1="'+y+'" y2="'+y+'" stroke="var(--line)"/><text x="'+(pl-8)+'" y="'+(y+4)+'" text-anchor="end" font-size="12" fill="var(--mute)">'+Math.round(mx*i/4).toLocaleString()+'</text>'}
 S.forEach(function(s,i){var x=pl+gap+i*(bw+gap),h=ph*s.tax/mx,y=pt+ph-h,c=i===rec?'var(--green)':(i?'var(--amber)':'var(--mute)');
  svg+='<rect x="'+x+'" y="'+y+'" width="'+bw+'" height="'+Math.max(h,1)+'" fill="'+c+'" rx="2"/><text x="'+(x+bw/2)+'" y="'+(y-6)+'" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)">'+fmt(s.tax)+'</text><text x="'+(x+bw/2)+'" y="'+(H-pb+22)+'" text-anchor="middle" font-size="12" fill="var(--ink)">'+s.name+'</text>'});
 $('chart').innerHTML=svg+'<text x="'+pl+'" y="16" font-size="12" fill="var(--mute)">單位：萬元；綠色為推薦方案</text></svg>'}
$('calc').onclick=calc;heirs();
})();
