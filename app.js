let DATA=JSON.parse(JSON.stringify(MOCK_DATA));
let currentPage="dashboard";
let LIVE_MODE=false;
let API_LOADING=false;

function apiUrl(){return (localStorage.getItem("examApiUrl")||"").trim()}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function normaliseLive(payload){
  if(!payload || payload.success!==true) throw new Error(payload?.error||"API returned success=false");
  const examInfo=payload.exam||{};
  const rows=Array.isArray(payload.results)?payload.results:[];
  const total=Number(examInfo.totalMarks||8);
  const passing=Number(examInfo.passingMarks||4);
  const results=rows.map((r,i)=>({
    id:String(r.id||("RES-"+(i+1))),
    student:String(r.student||r.name||""),
    roll:String(r.rollNumber||r.roll||""),
    email:String(r.email||""),
    exam:String(examInfo.name||"Computer Science Online Examination"),
    examId:"LIVE-EXAM",
    score:Number(r.score)||0,
    total:Number(r.total||total),
    status:String(r.status||((Number(r.score)||0)>=passing?"PASS":"FAIL")),
    submitted:String(r.submitted||""),
    mobile:String(r.mobile||""),
    classDepartment:String(r.classDepartment||""),
    questions:Array.isArray(r.questions)?r.questions:[]
  }));
  const submitted=results.length;
  const pass=results.filter(r=>r.status==="PASS").length;
  const avg=submitted?results.reduce((a,r)=>a+(r.score/r.total*100||0),0)/submitted:0;
  const exam={id:"LIVE-EXAM",name:String(examInfo.name||"Computer Science Online Examination"),code:"LIVE",date:"Live",students:submitted,submitted:submitted,avg:Number(avg.toFixed(1)),status:"ACTIVE"};
  const studentMap={};
  results.forEach(r=>{const k=r.roll||r.email||r.student||r.id;if(!studentMap[k]) studentMap[k]={name:r.student,roll:r.roll,email:r.email,className:r.classDepartment,attempts:0};studentMap[k].attempts++;});
  const questions=[];
  results.forEach(r=>r.questions.forEach(q=>{const key=q.question||("Question "+q.number);let x=questions.find(v=>v.q===key);if(!x){x={q:key,correct:0,total:0};questions.push(x)}x.total++;}));
  return {exams:[exam],results,students:Object.values(studentMap),questions,meta:{total,passing,stats:payload.statistics||{}}};
}
async function loadLiveData(silent=false){
  const url=apiUrl();
  if(!url) throw new Error("No Google Apps Script Web App URL is saved.");
  API_LOADING=true;
  try{
    const response=await fetch(url,{method:"GET",cache:"no-store",redirect:"follow"});
    if(!response.ok) throw new Error("API HTTP error: "+response.status);
    const payload=await response.json();
    DATA=normaliseLive(payload);
    LIVE_MODE=true;
    if(!silent){render();setUpdated("Live data loaded");}
    return payload;
  }finally{API_LOADING=false;}
}
function setUpdated(text){const el=$("#lastUpdated");if(el)el.textContent=text;}
async function refreshData(){
  if(apiUrl()){
    try{await loadLiveData();return true}catch(e){setUpdated("API error");alert("Google API could not be loaded.\n\n"+e.message);return false;}
  }
  render();setUpdated("Demo data refreshed");return false;
}
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
function pct(r){return Math.round(r.score/r.total*100)}
function statusBadge(s){return `<span class="status ${s==="PASS"?"pass":s==="FAIL"?"fail":"pending"}">${s}</span>`}
function render(){
  const titles={dashboard:["Dashboard","Exam performance overview"],exams:["Exams","Manage and monitor your examinations"],results:["Results","Search, filter and inspect submissions"],students:["Students","Student directory and exam history"],analytics:["Analytics","Performance and question-level analysis"],reports:["Reports","Export and print examination data"],settings:["Settings","Configure dashboard and Google integration"]};
  $("#pageTitle").textContent=titles[currentPage][0];$("#pageSub").textContent=titles[currentPage][1];
  const fn={dashboard:dashboard,exams:exams,results:results,students:students,analytics:analytics,reports:reports,settings:settings}[currentPage];$("#content").innerHTML=fn();
  $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===currentPage));
  bindPage();
}
function dashboard(){
 const submitted=DATA.exams.reduce((a,e)=>a+e.submitted,0), students=DATA.exams.reduce((a,e)=>a+e.students,0);
 const avg=(DATA.exams.reduce((a,e)=>a+e.avg,0)/DATA.exams.length).toFixed(1);
 const pass=DATA.results.filter(r=>r.status==="PASS").length, fail=DATA.results.filter(r=>r.status==="FAIL").length;
 return `<div class="cards">
  <div class="card"><div class="metric-label">Total Exams</div><div class="metric">${DATA.exams.length}</div><div class="metric-foot">↑ ${DATA.exams.filter(e=>e.status==="ACTIVE").length} active</div></div>
  <div class="card"><div class="metric-label">Registered Students</div><div class="metric">${students}</div><div class="metric-foot">Across all exams</div></div>
  <div class="card"><div class="metric-label">Submissions</div><div class="metric">${submitted}</div><div class="metric-foot">Google Forms synced</div></div>
  <div class="card"><div class="metric-label">Average Score</div><div class="metric">${avg}%</div><div class="metric-foot">Current exam set</div></div>
 </div>
 <div class="grid2">
  <div class="card"><div class="section-title"><h2>Recent Submissions</h2><button class="btn" data-go="results">View all</button></div>${resultsTable(DATA.results.slice(0,6))}</div>
  <div class="card"><div class="section-title"><h2>Submission Status</h2><span class="muted">${LIVE_MODE?"Live Google Sheets":"Demo data"}</span></div>
   <div class="bar-row"><span>Pass</span><div class="bar"><i style="width:${Math.round(pass/(pass+fail)*100)}%"></i></div><b>${pass}</b></div>
   <div class="bar-row"><span>Fail</span><div class="bar"><i style="width:${Math.round(fail/(pass+fail)*100)}%"></i></div><b>${fail}</b></div>
   <div class="bar-row"><span>Pending</span><div class="bar"><i style="width:18%"></i></div><b>79</b></div>
   <div class="notice">${LIVE_MODE?"Live Google Sheets data is connected. Click Refresh to fetch the latest submissions.":"Demo data is displayed. Add your Apps Script /exec URL in Settings, save it, then click Load Live Data."}</div>
  </div>
 </div>
 <div class="page-card" style="margin-top:18px"><div class="section-title"><h2>Exam Overview</h2><button class="btn" data-go="exams">Manage exams</button></div>${examMiniTable()}</div>`;
}
function resultsTable(rows){
 return `<div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Exam</th><th>Score</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r.student}</b><br><span class="muted">${r.roll}</span></td><td>${r.exam}</td><td><b>${r.score}/${r.total}</b> <span class="muted">(${pct(r)}%)</span></td><td>${statusBadge(r.status)}</td><td><button class="btn view-result" data-id="${r.id}">View</button></td></tr>`).join("")}</tbody></table></div>`;
}
function examMiniTable(){return `<div class="table-wrap"><table class="table"><thead><tr><th>Exam</th><th>Date</th><th>Registered</th><th>Submitted</th><th>Average</th><th>Status</th></tr></thead><tbody>${DATA.exams.map(e=>`<tr><td><b>${e.name}</b><br><span class="muted">${e.code}</span></td><td>${e.date}</td><td>${e.students}</td><td>${e.submitted}</td><td>${e.avg}%</td><td>${statusBadge(e.status)}</td></tr>`).join("")}</tbody></table></div>`}
function exams(){
 return `<div class="section-title"><div></div><button class="btn btn-primary" id="demoAdd">+ Add Exam</button></div><div class="exam-grid">${DATA.exams.map(e=>`<div class="exam-card"><span class="status ${e.status==="ACTIVE"?"active-status":"pending"}">${e.status}</span><h3 style="margin-top:12px">${e.name}</h3><div class="muted">${e.code} · ${e.date}</div><div class="exam-meta">Registered: <b>${e.students}</b><br>Submitted: <b>${e.submitted}</b><br>Average: <b>${e.avg}%</b></div><div class="progress"><i style="width:${Math.round(e.submitted/e.students*100)}%"></i></div><button class="btn" data-exam="${e.id}">View results</button></div>`).join("")}</div>`;
}
function results(){
 return `<div class="page-card"><div class="filters"><select class="field" id="examFilter"><option value="">All Exams</option>${DATA.exams.map(e=>`<option value="${e.id}">${e.name}</option>`).join("")}</select><select class="field" id="statusFilter"><option value="">All Status</option><option>PASS</option><option>FAIL</option></select><input class="field search" id="search" placeholder="Search name, roll number or email"><input class="field" id="minScore" type="number" placeholder="Min score"><input class="field" id="maxScore" type="number" placeholder="Max score"><button class="btn btn-primary" id="exportBtn">↓ Export CSV</button></div><div id="resultTable"></div></div>`;
}
function renderFiltered(){
 let rows=DATA.results.slice();const ex=$("#examFilter")?.value, st=$("#statusFilter")?.value, q=($("#search")?.value||"").toLowerCase(), min=Number($("#minScore")?.value||-1), max=Number($("#maxScore")?.value||101);
 rows=rows.filter(r=>(!ex||String(r.examId)===ex)&&(!st||r.status===st)&&(!q||`${r.student} ${r.roll} ${r.email}`.toLowerCase().includes(q))&&r.score>=min&&r.score<=max);
 $("#resultTable").innerHTML=rows.length?resultsTable(rows):`<div class="empty">No matching results found.</div>`;
}
function students(){
 return `<div class="page-card"><div class="filters"><input class="field search" id="studentSearch" placeholder="Search student, roll or email"></div><div id="studentTable"></div></div>`;
}
function renderStudents(){let q=($("#studentSearch")?.value||"").toLowerCase();let s=DATA.students.filter(x=>`${x.name} ${x.roll} ${x.email}`.toLowerCase().includes(q));$("#studentTable").innerHTML=`<div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Roll</th><th>Email</th><th>Class</th><th>Attempts</th><th></th></tr></thead><tbody>${s.map(x=>`<tr><td><b>${x.name}</b></td><td>${x.roll}</td><td>${x.email}</td><td>${x.className}</td><td>${x.attempts}</td><td><button class="btn student-view" data-roll="${x.roll}">History</button></td></tr>`).join("")}</tbody></table></div>`}
function analytics(){
 return `<div class="cards"><div class="card"><div class="metric-label">Average Score</div><div class="metric">74.6%</div></div><div class="card"><div class="metric-label">Pass Rate</div><div class="metric">81.7%</div></div><div class="card"><div class="metric-label">Highest Score</div><div class="metric">98%</div></div><div class="card"><div class="metric-label">Lowest Score</div><div class="metric">31%</div></div></div>
 <div class="grid2"><div class="card"><div class="section-title"><h2>Question Correctness</h2><span class="muted">Percentage correct</span></div><div class="chart-box">${DATA.questions.map(q=>`<div class="bar-row"><span>${q.q}</span><div class="bar"><i style="width:${q.correct}%"></i></div><b>${q.correct}%</b></div>`).join("")}</div><div class="card"><div class="section-title"><h2>Exam Average</h2></div>${DATA.exams.map(e=>`<div class="bar-row"><span>${e.code}</span><div class="bar"><i style="width:${e.avg}%"></i></div><b>${e.avg}%</b></div>`).join("")}</div></div>`;
}
function reports(){
 return `<div class="cards"><div class="card"><div class="metric-label">Result Records</div><div class="metric">${DATA.results.length}</div><button class="btn btn-primary" id="exportAll" style="margin-top:12px">Export Results CSV</button></div><div class="card"><div class="metric-label">Student Records</div><div class="metric">${DATA.students.length}</div><button class="btn" id="exportStudents" style="margin-top:12px">Export Students CSV</button></div></div><div class="page-card" style="margin-top:18px"><h2 style="font-size:16px">Report tools</h2><p class="muted">CSV export works entirely in your browser. No server is required.</p><button class="btn" id="printBtn">🖨 Print current page</button></div>`;
}
function settings(){
 return `<div class="page-card"><div class="notice">${LIVE_MODE?"Connected to Google Sheets successfully.":"Paste the deployed Google Apps Script Web App /exec URL below."}</div><label class="muted">Google Apps Script Web App URL</label><input class="field" id="apiUrl" style="width:100%;margin:7px 0 12px" placeholder="https://script.google.com/macros/s/.../exec" value="${esc(apiUrl())}"><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-primary" id="saveSettings">Save URL</button><button class="btn" id="loadLive">Load Live Data</button><button class="btn" id="testApi">Test API</button><button class="btn" id="clearApi">Clear</button></div><div id="apiStatus" class="notice" style="margin-top:14px">${LIVE_MODE?"API status: Connected":"API status: Not loaded"}</div><div class="setting"><div><b>Auto refresh</b><div class="muted">Refresh Google Sheets data every 60 seconds</div></div><button class="toggle on" id="autoToggle"></button></div><div class="setting"><div><b>Demo fallback</b><div class="muted">If no API URL is configured, the portal displays sample data.</div></div><button class="toggle on" id="demoToggle"></button></div></div>`;
}
function openResult(id){const r=DATA.results.find(x=>x.id===id);if(!r)return;$("#modal").innerHTML=`<div class="modal-head"><div><h2 style="margin:0">${r.student}</h2><div class="muted">Result ID: ${r.id} · Roll ${r.roll}</div></div><button class="close" id="closeModal">✕</button></div><div class="detail-grid"><div class="detail"><small>Exam</small><b>${r.exam}</b></div><div class="detail"><small>Score</small><b>${r.score}/${r.total}</b></div><div class="detail"><small>Status</small><b>${statusBadge(r.status)}</b></div></div><div class="question"><b>Submission</b><br><span class="muted">${r.submitted} · ${r.email}</span></div><h3>Question Analysis</h3>${DATA.questions.slice(0,6).map((q,i)=>`<div class="question"><b>${q.q}</b> &nbsp; ${i===2?"✕ Incorrect":"✓ Correct"} <span style="float:right">${i===2?0:Math.round(r.score/100*2)}/2 marks</span></div>`).join("")}`;$("#modalBackdrop").classList.add("show");$("#closeModal").onclick=()=>$("#modalBackdrop").classList.remove("show")}
function csv(rows,headers){let out=[headers.join(",")];rows.forEach(r=>out.push(headers.map(h=>`"${String(r[h]??"").replaceAll('"','""')}"`).join(",")));let blob=new Blob([out.join("\\n")],{type:"text/csv"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="exam-report.csv";a.click();URL.revokeObjectURL(a.href)}
function bindPage(){
 $$("[data-go]").forEach(b=>b.onclick=()=>{currentPage=b.dataset.go;render()});
 $$(".view-result").forEach(b=>b.onclick=()=>openResult(b.dataset.id));
 if(currentPage==="results"){["examFilter","statusFilter","search","minScore","maxScore"].forEach(id=>$("#"+id)?.addEventListener("input",renderFiltered));$("#exportBtn").onclick=()=>csv(DATA.results,["student","roll","email","exam","score","total","status","submitted"]);renderFiltered()}
 if(currentPage==="students"){$("#studentSearch").oninput=renderStudents;renderStudents();$$(".student-view").forEach(b=>b.onclick=()=>{currentPage="results";render();$("#search").value=b.dataset.roll;renderFiltered()})}
 $$("[data-exam]").forEach(b=>b.onclick=()=>{currentPage="results";render();$("#examFilter").value=b.dataset.exam;renderFiltered()});
 if(currentPage==="reports"){$("#exportAll").onclick=()=>csv(DATA.results,["student","roll","email","exam","score","total","status","submitted"]);$("#exportStudents").onclick=()=>csv(DATA.students,["name","roll","email","className","attempts"]);$("#printBtn").onclick=()=>window.print()}
 if(currentPage==="settings"){
  $("#saveSettings").onclick=()=>{localStorage.setItem("examApiUrl",$("#apiUrl").value.trim());alert("API URL saved. Click Load Live Data.");};
  $("#loadLive").onclick=async()=>{try{await loadLiveData();currentPage="dashboard";render();}catch(e){$("#apiStatus").textContent="API error: "+e.message;alert("Unable to load live data.\n\n"+e.message);}};
  $("#testApi").onclick=async()=>{try{const p=await loadLiveData(true);$("#apiStatus").textContent="API status: Connected ✓ | Results: "+(p.results||[]).length;LIVE_MODE=true;}catch(e){$("#apiStatus").textContent="API status: Error — "+e.message;}};
  $("#clearApi").onclick=()=>{localStorage.removeItem("examApiUrl");LIVE_MODE=false;DATA=JSON.parse(JSON.stringify(MOCK_DATA));render();};
  ["autoToggle","demoToggle"].forEach(id=>$("#"+id).onclick=()=>$("#"+id).classList.toggle("on"));
}
}
$$(".nav-item").forEach(b=>b.onclick=()=>{currentPage=b.dataset.page;render();$("#sidebar").classList.remove("open")});
$("#menuBtn").onclick=()=>$("#sidebar").classList.toggle("open");
$("#refreshBtn").onclick=()=>{refreshData();};
$("#modalBackdrop").onclick=e=>{if(e.target.id==="modalBackdrop")$("#modalBackdrop").classList.remove("show")};
render();
if(apiUrl()){
  loadLiveData(true).then(()=>{render();setUpdated("Live data loaded");}).catch(()=>{LIVE_MODE=false;render();setUpdated("Demo data — API not loaded");});
}
setInterval(()=>{if(apiUrl()) loadLiveData(true).then(()=>{setUpdated("Auto-refreshed "+new Date().toLocaleTimeString());render();}).catch(()=>{});},60000);