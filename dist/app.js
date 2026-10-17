import {topics, createTopicPicker} from './topics.js';
const $=s=>document.querySelector(s);
const cfg=window.ENTRELADOS_CONFIG||{};
const live=Boolean(cfg.supabaseUrl&&cfg.supabaseAnonKey);
let db,user,room,profile,channel,poll,tick,busy=false,sessionToken=0,lastSend=0;
const seen=new Set();
let matchAudio,matchAudioReady;
function enableMatchSound(){
 try{
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  if(!AudioContext)return;
  matchAudio??=new AudioContext();
  if(matchAudio.state!=='running')matchAudioReady=matchAudio.resume().catch(()=>{});
  // Start a silent buffer during the gesture to unlock audio on mobile browsers.
  const unlock=matchAudio.createBufferSource();
  unlock.buffer=matchAudio.createBuffer(1,1,matchAudio.sampleRate);
  unlock.connect(matchAudio.destination);
  unlock.onended=()=>unlock.disconnect();
  unlock.start();
 }catch{}
}
async function playMatchSound(){
 const matchedRoom=room;
 try{
  if(!matchAudio)return;
  await matchAudioReady;
  if(matchAudio.state!=='running')await matchAudio.resume();
  if(room!==matchedRoom||!$('#chat-ended').hidden||matchAudio.state!=='running')return;
  const start=matchAudio.currentTime+0.02;
  for(const [frequency,delay] of [[660,0],[880,0.2]]){
   const tone=matchAudio.createOscillator(),volume=matchAudio.createGain();
   tone.type='sine';tone.frequency.value=frequency;
   volume.gain.setValueAtTime(0,start+delay);
   volume.gain.linearRampToValueAtTime(0.12,start+delay+0.025);
   volume.gain.exponentialRampToValueAtTime(0.0001,start+delay+0.48);
   tone.connect(volume);volume.connect(matchAudio.destination);
   tone.onended=()=>{tone.disconnect();volume.disconnect()};
   tone.start(start+delay);tone.stop(start+delay+0.5);
  }
 }catch{}
}
const pickTopic=createTopicPicker();
const themeLabel=document.createElement('label');themeLabel.htmlFor='topic-theme';themeLabel.className='topic-theme-label';themeLabel.textContent='Escolha um tema';
const themeSelect=document.createElement('select');themeSelect.id='topic-theme';themeSelect.className='topic-theme';
for(const theme of ['',...new Set(topics.map(t=>t.theme))]){const option=document.createElement('option');option.value=theme;option.textContent=theme||'Todos os temas';themeSelect.append(option)}
$('#topic').before(themeLabel,themeSelect);$('#topic').setAttribute('aria-live','polite');
const topicMeta=document.createElement('small');topicMeta.className='topic-meta';$('#topic').after(topicMeta);
let currentTopic;
function drawTopic(){currentTopic=pickTopic(themeSelect.value);$('#topic').textContent=currentTopic.question;topicMeta.textContent=currentTopic.theme+' · '+currentTopic.total+(themeSelect.value?' perguntas neste tema':' perguntas no total');if($('#dialog-topic')){$('#dialog-topic').textContent=currentTopic.question;$('#dialog-topic-meta').textContent=topicMeta.textContent}}
drawTopic();themeSelect.onchange=drawTopic;
function screen(name){for(const id of ['landing','waiting','chat'])$('#'+id).hidden=id!==name;document.body.classList.toggle('in-chat',name==='chat');$('#bottom-strip').hidden=name==='chat';$('.journey').hidden=name!=='landing';if($('#public-info'))$('#public-info').hidden=name!=='landing';window.scrollTo(0,0)}
function modal(html){$('#dialog-content').innerHTML=html;$('#info-dialog').showModal()}
$('.dialog-close').onclick=()=>$('#info-dialog').close();$('#info-dialog').addEventListener('click',e=>{if(e.target===$('#info-dialog'))$('#info-dialog').close()});
$('#how').onclick=()=>modal('<div class="eyebrow">COMO FUNCIONA</div><h2>Um encontro. Duas perspectivas.</h2><ol><li>Escolha um apelido e seu posicionamento.</li><li>Encontramos a pessoa do outro lado que está esperando há mais tempo.</li><li>Vocês têm até 30 minutos para conversar por texto.</li></ol><p>Sem alguém disponível, você aguarda na fila. Você pode encerrar quando quiser.</p><p><a href="/como-funciona">Saiba mais sobre o funcionamento →</a></p>');
$('#privacy').onclick=()=>modal('<h2>Respeito e privacidade.</h2><p>Use um apelido e evite compartilhar telefone, endereço ou outros dados pessoais. Não há criptografia de ponta a ponta.</p><p>As mensagens são armazenadas; encerrar uma sala não as apaga automaticamente.</p><p>Não há canal de suporte individual neste momento. Denúncias podem ser registradas dentro das salas, sem garantia de revisão em tempo real.</p><p><a href="/privacidade">Leia sobre privacidade →</a></p><p><a href="/convivencia">Regras de convivência →</a></p>');
$('#new-topic').onclick=drawTopic;
$('#mode-label').textContent='Chat por texto · encontros de 30 minutos';
let captchaToken='',captchaWidget;
if(cfg.turnstileSiteKey){const holder=document.createElement('div');holder.id='captcha-widget';holder.className='captcha-widget';$('#enter').before(holder);const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.onload=()=>{captchaWidget=window.turnstile.render(holder,{sitekey:cfg.turnstileSiteKey,theme:'light',size:'flexible',callback:token=>{captchaToken=token},'expired-callback':()=>{captchaToken=''},'error-callback':()=>{captchaToken='';showError({message:'Não foi possível verificar a proteção contra bots. Recarregue a página.'})}})};script.onerror=()=>showError({message:'A verificação de segurança não carregou. Confira sua conexão e recarregue.'});document.head.append(script)}
async function connect(){if(user)return;const {createClient}=await import('/vendor/supabase.js');db??=createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);const {data:{session},error:sessionError}=await db.auth.getSession();check(sessionError);if(session)user=session.user;else{if(cfg.turnstileSiteKey&&!captchaToken)throw new Error('Conclua a verificação de segurança antes de entrar.');const {data,error}=await db.auth.signInAnonymously(captchaToken?{options:{captchaToken}}:{});captchaToken='';if(captchaWidget!==undefined)window.turnstile?.reset(captchaWidget);check(error);user=data.user}}
function check(error){if(error)throw error}
function showError(e){$('#entry-error').textContent=e?.message||'Não foi possível conectar. Tente novamente.'}
function stop(){clearInterval(poll);clearInterval(tick);if(channel){db?.removeChannel(channel);channel=null}}
function system(text){const p=document.createElement('p');p.className='system-message';p.textContent=text;$('#messages').append(p);scroll()}
function scroll(){$('#messages').scrollTop=$('#messages').scrollHeight}
function message(text,mine=false,at=new Date()){const el=document.createElement('div');el.className='message'+(mine?' mine':'');el.textContent=text;const stamp=document.createElement('small');stamp.textContent=new Date(at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});el.append(stamp);$('#messages').append(el);scroll()}
function receive(m){if(seen.has(m.id))return;seen.add(m.id);message(m.body,m.sender_id===user?.id,m.created_at)}
function countdown(){if(!room)return;const remaining=Math.max(0,Math.ceil((Date.parse(room.expires_at)-Date.now())/1000));$('#timer span').textContent=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;$('#timer').classList.toggle('urgent',remaining<=60);if(remaining<=300&&!room.warn5){room.warn5=true;system('Faltam 5 minutos. Que tal encontrar um ponto em comum?')}if(remaining<=60&&!room.warn1){room.warn1=true;system('A conversa termina em 1 minuto.')}if(!remaining)finish('Os 30 minutos terminaram. Que tal conhecer outra perspectiva?')}
function prepareChat(name,side){screen('chat');$('#messages').replaceChildren();seen.clear();$('#chat-ended').hidden=true;$('#message-input').disabled=false;$('#message-form button').disabled=false;$('#partner-name').textContent=name;$('#partner-side').textContent=side==='left'?'Perspectiva de esquerda':'Perspectiva de direita';$('#partner-avatar').textContent=side==='left'?'←':'→';$('#chat-status').textContent='';$('#timer').classList.remove('urgent');system('Comece com um oi. Explore as perguntas para debate e quebre o gelo. Vocês têm até 30 minutos para trocar ideias com respeito.');playMatchSound();countdown();tick=setInterval(countdown,1000)}
async function startLiveChat(id,token){if(room?.id===id)return;const {data:r,error}=await db.from('rooms').select('*').eq('id',id).single();check(error);if(token!==sessionToken)return;room=r;const other=r.user_a===user.id?r.user_b:r.user_a;const {data:p,error:pe}=await db.from('profiles').select('nickname,side').eq('id',other).single();check(pe);if(token!==sessionToken)return;stop();prepareChat(p.nickname,p.side);channel=db.channel('room-'+r.id).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`room_id=eq.${r.id}`},e=>receive(e.new)).subscribe();await syncRoom();poll=setInterval(()=>syncRoom().catch(()=>{$('#chat-status').textContent='Reconectando… suas mensagens permanecem na sala.'}),3000)}
async function syncRoom(){if(!room||!live||room.syncing)return;const current=room;current.syncing=true;try{let offset=0;const since=current.readSince||current.created_at;let latest=since;while(true){const {data:messages,error}=await db.from('messages').select('*').eq('room_id',current.id).gte('created_at',since).order('created_at').order('id').range(offset,offset+499);check(error);if(room!==current)return;messages.forEach(m=>{receive(m);if(m.created_at>latest)latest=m.created_at});if(messages.length<500)break;offset+=500}current.readSince=latest;const {data:r,error:re}=await db.from('rooms').select('status').eq('id',current.id).single();check(re);if(room!==current)return;$('#chat-status').textContent='';if(r.status!=='active')finish('A conversa foi encerrada. Obrigado por participar.')}finally{current.syncing=false}}
async function seek(token){const {data,error}=await db.rpc('join_queue',{p_nickname:profile.nickname,p_side:profile.side});check(error);if(token!==sessionToken)return;if(data.room_id){await startLiveChat(data.room_id,token);return}$('#wait-copy').textContent=data.state==='capacity'?'Todas as salas estão ocupadas neste momento.':'Procurando alguém do outro lado para conversar.';$('#wait-detail').textContent=data.state==='capacity'?'Você está aguardando uma vaga.':'Você está na fila. Pode ficar por aqui.'}
async function begin(){if(busy)return;enableMatchSound();busy=true;$('#enter').disabled=true;$('#entry-error').textContent='';const token=++sessionToken;stop();room=null;try{if(!live)throw new Error('A conexão do chat está indisponível. Tente novamente mais tarde.');await connect();screen('waiting');{await seek(token);if(!room&&token===sessionToken)poll=setInterval(async()=>{if(busy)return;busy=true;try{await seek(token)}catch(e){$('#wait-copy').textContent='A conexão oscilou. Tentando novamente…'}finally{busy=false}},4000)}}catch(e){screen('landing');showError(e)}finally{busy=false;$('#enter').disabled=false}}
$('#entry-form').onsubmit=e=>{e.preventDefault();const form=new FormData(e.target);const nickname=form.get('nickname').trim();if(nickname.length<2){showError({message:'Escolha um apelido com pelo menos 2 caracteres.'});return}profile={nickname,side:form.get('side')};begin()};


$('#cancel-wait').onclick=async()=>{++sessionToken;stop();screen('landing');if(live&&db){try{const {error}=await db.rpc('leave_session');check(error)}catch(e){showError(e)}}};
function finish(text){stop();$('#chat-ended').hidden=false;$('#end-copy').textContent=text;$('#message-input').disabled=true;$('#message-form button').disabled=true}
async function leave(){if(live){const {error}=await db.rpc('leave_session');check(error)}finish('Você encerrou a conversa. Cada encontro é uma nova oportunidade.')}
$('#leave').onclick=()=>{modal('<h2>Encerrar esta conversa?</h2><p>Você pode buscar outra pessoa em seguida.</p><button class="primary" id="confirm-leave">Encerrar conversa →</button>');$('#confirm-leave').onclick=async()=>{try{await leave();$('#info-dialog').close()}catch(e){$('#confirm-leave').textContent='Falha ao encerrar. Tente novamente.'}}};
$('#back-home').onclick=()=>{room=null;screen('landing')};$('#next-chat').onclick=async()=>{
 if(busy)return;
 enableMatchSound();busy=true;const button=$('#next-chat');button.disabled=true;
 try{
  const {error}=await db.rpc('leave_session');check(error);
  ++sessionToken;stop();room=null;busy=false;await begin();
 }catch(e){$('#end-copy').textContent='Não foi possível buscar outra pessoa. Tente novamente.'}
 finally{busy=false;button.disabled=false}
};
$('#message-input').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('#message-form').requestSubmit()}};
$('#message-form').onsubmit=async e=>{e.preventDefault();const input=$('#message-input');const text=input.value.trim();if(!text||!room||!$('#chat-ended').hidden)return;if(Date.now()>=Date.parse(room.expires_at)){countdown();return}if(Date.now()-lastSend<1000){$('#chat-status').textContent='Espere um instante antes de enviar outra mensagem.';return}lastSend=Date.now();const button=$('#message-form button');button.disabled=true;try{const {data,error}=await db.rpc('send_message',{p_room:room.id,p_body:text});check(error);receive(data);input.value='';input.focus()}catch(e){$('#chat-status').textContent='Não foi possível enviar: '+e.message}finally{button.disabled=!$('#chat-ended').hidden}};
$('#report').onclick=()=>{if(!$('#chat-ended').hidden)return;modal('<h2>Denunciar e bloquear</h2><p>A conversa será encerrada e essa identidade não será pareada com você novamente.</p><label for="reason">Motivo</label><select id="reason"><option>Ataques pessoais ou discriminação</option><option>Ameaça ou exposição de dados</option><option>Spam ou comportamento inadequado</option></select><label for="details">Detalhes (opcional)</label><textarea id="details" maxlength="500" placeholder="O que aconteceu?"></textarea><button class="primary" id="send-report">Denunciar e encerrar →</button>');$('#send-report').onclick=async()=>{const btn=$('#send-report');btn.disabled=true;try{if(live){const {error}=await db.rpc('report_room',{p_room:room.id,p_reason:$('#reason').value,p_details:$('#details').value});check(error)}finish('Denúncia registrada. Esta identidade foi bloqueada para novos encontros.');$('#info-dialog').close()}catch(e){btn.textContent='Falha ao denunciar. Tente novamente.';btn.disabled=false}}};
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&room&&$('#chat-ended').hidden){countdown();if(live)syncRoom().catch(()=>{})}});
const mobileReport=document.createElement('button');mobileReport.className='icon-button mobile-report';mobileReport.textContent='⚑';mobileReport.setAttribute('aria-label','Denunciar conversa');mobileReport.onclick=()=>$('#report').click();$('#leave').before(mobileReport);
const mobileTopic=document.createElement('button');mobileTopic.className='icon-button mobile-topic';mobileTopic.textContent='Perguntas para debate';mobileTopic.setAttribute('aria-label','Abrir perguntas para debate');mobileTopic.setAttribute('aria-haspopup','dialog');mobileTopic.onclick=()=>{modal('<div class="eyebrow">PARA ABRIR A CONVERSA</div><h2>Um tema. Outras perspectivas.</h2><label for="dialog-theme">Escolha um tema</label><p id="dialog-topic" aria-live="polite"></p><small id="dialog-topic-meta" class="topic-meta"></small><button class="primary" id="dialog-next-topic">Outra pergunta ↻</button><p>Uma sugestão para vocês. Não é enviada automaticamente ao chat.</p>');const select=themeSelect.cloneNode(true);select.id='dialog-theme';select.value=themeSelect.value;$('#dialog-topic').before(select);select.onchange=()=>{themeSelect.value=select.value;drawTopic()};$('#dialog-topic').textContent=currentTopic.question;$('#dialog-topic-meta').textContent=topicMeta.textContent;$('#dialog-next-topic').onclick=drawTopic};$('.chat-top').after(mobileTopic);
