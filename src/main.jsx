import React, {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ChevronDown,ExternalLink,Settings2,X,Check,Link2,ShieldCheck,RefreshCw,MonitorSmartphone} from 'lucide-react';
import './style.css';
import {ArchiveManager,readArchived} from './ArchiveManager';

const HUB = "Style Flow";
const MODES = [["fashion","Fashion",""],["cosmetic","Cosmetic",""]].map(([id,label,url])=>({id,label,defaultUrl:url}));
const STORAGE_KEY = 'flow-hub-links-v1-' + HUB.toLowerCase().replace(/\W+/g,'-');
const sanitizeUrl = value => {
  try {
    const input = value.trim();
    const u = new URL(input);
    if (u.protocol !== 'https:') return '';
    if (u.username || u.password) return '';
    return u.href;
  } catch { return ''; }
};
function readSaved() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}
const ARCHIVE_KEY = STORAGE_KEY + '-archived-v1';
function App() {
  const [archived,setArchived] = useState(()=>readArchived(ARCHIVE_KEY, MODES));
  const [archiveOpen,setArchiveOpen] = useState(false);
  const visibleModes = MODES.filter(mode=>!archived.includes(mode.id));
  const initial = new URLSearchParams(window.location.search).get('app');
  const [selected,setSelected] = useState(()=>visibleModes.some(m=>m.id===initial)?initial:(visibleModes[0]?.id||''));
  const [links,setLinks] = useState(readSaved);
  const [settings,setSettings] = useState(false);
  const [draft,setDraft] = useState('');
  const [error,setError] = useState('');
  const [frameVersion,setFrameVersion] = useState(0);
  const current = visibleModes.find(m=>m.id===selected)||{id:'',label:'보관함',defaultUrl:''};
  const activeUrl = selected && sanitizeUrl(Object.prototype.hasOwnProperty.call(links,selected)?String(links[selected]||''):current.defaultUrl);
  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    if(selected)params.set('app',selected);else params.delete('app');
    window.history.replaceState(null,'',window.location.pathname+'?'+params.toString()+window.location.hash);
  },[selected]);
  useEffect(()=>{setDraft(activeUrl);setError('');setSettings(false)},[selected]);
  function toggleArchived(id) {
    const next=archived.includes(id)?archived.filter(value=>value!==id):[...archived,id];
    try {localStorage.setItem(ARCHIVE_KEY,JSON.stringify(next));}
    catch {return '보관 상태를 저장하지 못했어. 브라우저 저장 공간을 확인해 줘.';}
    setArchived(next);
    if(selected===id && next.includes(id))setSelected(MODES.find(mode=>!next.includes(mode.id))?.id||'');
    else if(!selected && !next.includes(id))setSelected(id);
    return '';
  }
  function saveUrl(e) {
    e.preventDefault();
    const url = draft.trim()?sanitizeUrl(draft):'';
    if (draft.trim() && !url) {setError('https://로 시작하는 올바른 주소를 입력해 줘.');return;}
    const next={...links,[selected]:url};
    try {localStorage.setItem(STORAGE_KEY,JSON.stringify(next));} catch {setError('브라우저 저장 공간을 확인해 줘.');return;}
    setLinks(next);setFrameVersion(n=>n+1);setSettings(false);setError('');
  }
  function resetUrl() {
    const next={...links};delete next[selected];
    try {localStorage.setItem(STORAGE_KEY,JSON.stringify(next));} catch {}
    setLinks(next);setDraft(current.defaultUrl);setFrameVersion(n=>n+1);setSettings(false);
  }
  return <div className="hub">
    <header className="topbar">
      <div className="brand">
        <span className="brand-symbol">✦</span>
        <div><strong>{HUB}</strong><small>MY FLOW STUDIO</small></div>
      </div>
      <div className="top-actions">
        <label className="mode-select"><span className="sr-only">앱 선택</span>
          <select value={selected} onChange={e=>{if(e.target.value==='__archive__'){setSettings(false);setArchiveOpen(true)}else setSelected(e.target.value)}} aria-label="앱 전환">
            {!selected&&<option value="" disabled>사용 중인 프로젝트 없음</option>}
            {visibleModes.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
            <option value="__archive__">보관함 · {archived.length}개</option>
          </select><ChevronDown size={14}/></label>
        <button className={'icon-btn'+(settings?' active':'')} type="button" aria-label="허브 설정" onClick={()=>{setDraft(activeUrl);setSettings(x=>!x);setError('')}}><Settings2 size={17}/></button>
      </div>
    </header>
    {settings&&<section className="settings" aria-label="원본 앱 주소 설정">
      <div className="settings-title"><b>{selected?current.label+' 배포 URL':'허브 설정'}</b><button type="button" className="icon-btn" onClick={()=>setSettings(false)} aria-label="닫기"><X size={17}/></button></div>
      {selected&&<>
      <p>원본 앱의 Cloudflare Pages 주소를 넣어줘. 이 허브에만 저장되며 기존 앱의 데이터는 변경되지 않아.</p>
      <form onSubmit={saveUrl}>
        <input type="url" inputMode="url" value={draft} onChange={e=>setDraft(e.target.value)} placeholder="https://your-app.pages.dev/" autoCapitalize="off" autoCorrect="off" spellCheck="false" />
        {error&&<p className="error" role="alert">{error}</p>}
        <div className="form-buttons"><button type="button" className="secondary" onClick={resetUrl}>기본값 복원</button><button type="submit" className="primary"><Check size={15}/> 저장</button></div>
      </form></>}
      <button className="secondary archive-link" type="button" onClick={()=>{setSettings(false);setArchiveOpen(true)}}>프로젝트 보관·복원 <span>보관함 · {archived.length}개</span></button>
    </section>}
    {archiveOpen&&<ArchiveManager modes={MODES} archived={archived} onToggle={toggleArchived} onClose={()=>setArchiveOpen(false)}/>}
    <div className="info-strip">
      <span className="app-name"><ShieldCheck size={14}/> {current.label} <i>독립 로그인 · DB 유지</i></span>
      <div className="strip-actions">
        {activeUrl&&<button type="button" onClick={()=>setFrameVersion(n=>n+1)} aria-label="앱 새로고침" title="앱 새로고침"><RefreshCw size={15}/></button>}
        {activeUrl&&<a href={activeUrl} target="_blank" rel="noopener noreferrer" title="원본 앱 열기"><ExternalLink size={15}/><span>원본 열기</span></a>}
      </div>
    </div>
    <main className="frame-area">
      {!selected ? <div className="empty"><h2>모든 프로젝트를 보관했어</h2><p>보관함에서 언제든 다시 꺼낼 수 있어.</p><button className="primary" type="button" onClick={()=>setArchiveOpen(true)}>보관함 · {archived.length}개</button></div> : activeUrl ? <iframe key={selected+'-'+frameVersion+'-'+activeUrl} title={current.label+' 앱'} src={activeUrl} allow="microphone; camera; clipboard-write" referrerPolicy="strict-origin-when-cross-origin"/>:
        <div className="empty">
          <div className="empty-icon"><Link2 size={25}/></div>
          <h2>{current.label} 연결 준비</h2>
          <p>이 앱의 실제 배포 주소가 아직 등록되지 않았어. 우상단 설정에서 원본 앱 URL을 한 번 등록하면 이 화면에 표시돼.</p>
          <button className="primary" type="button" onClick={()=>{setSettings(true);setDraft('')}}><Settings2 size={16}/> URL 등록하기</button>
        </div>}
    </main>
    <footer className="foot"><MonitorSmartphone size={12}/><span>앱 화면이 표시되지 않으면 ‘원본 열기’를 사용해 줘. 일부 앱은 외부 삽입이 제한될 수 있어.</span></footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);

import './mobile-readability.css';
