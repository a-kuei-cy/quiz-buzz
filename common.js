const API_URL = (window.XJ_CONFIG||{}).API_URL || '';
const $ = id => document.getElementById(id);
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function escA(s){return String(s??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");}
async function api(action,data={}){
  if(!API_URL || API_URL.includes('PASTE_')) throw new Error('尚未設定 config.js 的 API_URL');
  const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...data})});
  const j=await r.json(); if(!j.ok) throw new Error(j.error||'操作失敗'); return j;
}
function downloadCSV(filename, rows){
  const csv=rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); URL.revokeObjectURL(a.href);
}
function parseCSV(text){
  const rows=[];let row=[],cur='',q=false;for(let i=0;i<text.length;i++){const ch=text[i];if(ch==='"'){if(q&&text[i+1]==='"'){cur+='"';i++;}else q=!q;}else if(ch===','&&!q){row.push(cur);cur='';}else if((ch==='\n'||ch==='\r')&&!q){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cur);if(row.some(x=>x!==''))rows.push(row);row=[];cur='';}else cur+=ch;}row.push(cur);if(row.some(x=>x!==''))rows.push(row);return rows;
}
function fmtDate(x){if(!x)return'';const d=new Date(x);return isNaN(d)?x:d.toLocaleString('zh-TW',{hour12:false});}
