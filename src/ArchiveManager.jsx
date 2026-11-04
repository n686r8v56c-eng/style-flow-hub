import React, {useState,useEffect,useRef} from 'react';
import {X} from 'lucide-react';
import './archive.css';

export function readArchived(key, modes, storage = localStorage) {
  try {
    const saved = JSON.parse(storage.getItem(key) || '[]');
    return Array.isArray(saved) ? modes.filter(mode => saved.includes(mode.id)).map(mode => mode.id) : [];
  } catch { return []; }
}

export function ArchiveManager({modes, archived, onToggle, onClose}) {
  const dialog=useRef(null);
  useEffect(()=>{const node=dialog.current;node.showModal();return ()=>node.close()},[]);
  return <dialog ref={dialog} className="archive-panel" aria-labelledby="archive-title" onCancel={onClose} onClick={event=>{if(event.target===dialog.current){const rect=dialog.current.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)onClose()}}}>
      <div className="settings-title"><b id="archive-title">프로젝트 보관·복원</b><button autoFocus className="icon-btn" type="button" onClick={onClose} aria-label="보관함 닫기"><X size={17}/></button></div>
      <p>잠깐 쉬는 프로젝트는 보관해 줘. 다시 꺼내면 원래 순서로 돌아와.</p>
      <p className="archive-note">보관 상태는 이 기기에 저장돼. 프로젝트 데이터와 연결 주소는 그대로 유지돼.</p>
      <ArchiveList title="사용 중" modes={modes.filter(mode=>!archived.includes(mode.id))} action="보관" onToggle={onToggle}/>
      <ArchiveList title={'보관함 · '+archived.length+'개'} modes={modes.filter(mode=>archived.includes(mode.id))} action="다시 꺼내기" onToggle={onToggle}/>
  </dialog>;
}
function ArchiveList({title,modes,action,onToggle}) {
  const [error,setError]=useState('');
  return <section className="archive-group"><h3>{title}</h3>
    {modes.length ? modes.map(mode=><div className="archive-row" key={mode.id}><span>{mode.label}</span><button className="secondary" type="button" onClick={()=>{setError(onToggle(mode.id)||'')}}>{action}<span className="sr-only"> {mode.label}</span></button></div>) : <p className="archive-empty">{action==='보관'?'사용 중인 프로젝트가 없어. 아래 보관함에서 다시 꺼내 줘.':'보관한 프로젝트가 없어.'}</p>}
    {error&&<p role="alert" className="archive-error">{error}</p>}
  </section>;
}
