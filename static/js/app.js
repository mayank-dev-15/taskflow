// TaskFlow - Project Management JavaScript
const API = '/api';

function $(sel){return document.querySelector(sel)}
function $$(sel){return document.querySelectorAll(sel)}

function logout(){localStorage.removeItem('taskflow_user');window.location.href='/login.html'}

const user = JSON.parse(localStorage.getItem('taskflow_user') || 'null');
if(user){const el=document.getElementById('userName');if(el)el.textContent=user.name}

// Load projects
async function loadProjects(){
    try{
        const res = await fetch(`${API}/projects`);
        const projects = await res.json();
        const el = document.getElementById('projectsList');
        if(!el) return;
        if(!projects.length){el.innerHTML='<p style="color:var(--text-light)">No projects yet. Create one!</p>';return;}
        el.innerHTML = projects.map(p => `
            <div class="card" onclick="openProject('${p.id}')">
                <h3>${p.icon || '📁'} ${p.name}</h3>
                <p>${p.description || 'No description'}</p>
                <div class="meta">
                    <span class="badge badge-info">${p.tasks || 0} tasks</span>
                    <span class="badge ${p.status==='active'?'badge-success':p.status==='completed'?'badge-done':'badge-warning'}">${p.status}</span>
                </div>
            </div>
        `).join('');
        const sp = document.getElementById('statProjects');
        if(sp) sp.textContent = projects.length;
    }catch(e){console.error(e)}
}

// Load tasks
async function loadTasks(){
    try{
        const res = await fetch(`${API}/tasks`);
        const tasks = await res.json();
        const el = document.getElementById('tasksList');
        if(!el) return;
        if(!tasks.length){el.innerHTML='<p style="color:var(--text-light)">No tasks yet.</p>';return;}
        el.innerHTML = tasks.slice(0,10).map(t => {
            const overdue = t.due && new Date(t.due) < new Date() && t.status !== 'done';
            return `<div class="list-item priority-${t.priority||'medium'} ${overdue?'badge-overdue':''}">
                <div><div class="title">${t.title}</div><div class="subtitle">${t.project||''} ${t.due?'· Due: '+t.due:''}</div></div>
                <span class="badge badge-${t.status==='done'?'done':t.status==='progress'?'progress':'todo'}">${t.status==='done'?'✅ Done':t.status==='progress'?'🔄 In Progress':'⬜ To Do'}</span>
            </div>`;
        }).join('');
        const st = document.getElementById('statTasks');
        const sd = document.getElementById('statDone');
        const so = document.getElementById('statOverdue');
        if(st) st.textContent = tasks.length;
        if(sd) sd.textContent = tasks.filter(t=>t.status==='done').length;
        if(so) so.textContent = tasks.filter(t=>t.due && new Date(t.due)<new Date() && t.status!=='done').length;
    }catch(e){console.error(e)}
}

// Project modal
function openProjectModal(){
    const name = prompt('Project Name:');
    if(!name) return;
    const desc = prompt('Description (optional):') || '';
    fetch(`${API}/projects`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,description:desc,status:'active',tasks:0,icon:'📁'})}).then(()=>loadProjects());
}

function openProject(id){alert('Project: '+id+'\n\nFull project view coming soon!')}

// Task modal
function openTaskModal(){
    const title = prompt('Task Title:');
    if(!title) return;
    const project = prompt('Project (optional):') || '';
    const priority = prompt('Priority (low/medium/high):') || 'medium';
    const due = prompt('Due date (YYYY-MM-DD, optional):') || '';
    fetch(`${API}/tasks`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,project,priority,due,status:'todo'})}).then(()=>loadTasks());
}

// Admin Panel
function openAdmin(){document.getElementById('adminModal').classList.add('active');showAdminTab('overview')}
function closeAdmin(){document.getElementById('adminModal').classList.remove('active')}
function showAdminTab(tab){
    $$('.admin-tabs .tab-btn').forEach(b=>b.classList.remove('active'));
    event.target.classList.add('active');
    const c = document.getElementById('adminContent');
    if(tab==='overview'){
        c.innerHTML=`<div class="stats-grid" style="grid-template-columns:repeat(4,1fr)"><div class="stat-card blue"><h3>Projects</h3><p id="aProj">0</p></div><div class="stat-card orange"><h3>Tasks</h3><p id="aTasks">0</p></div><div class="stat-card green"><h3>Done</h3><p id="aDone">0</p></div><div class="stat-card red"><h3>Overdue</h3><p id="aOver">0</p></div></div><h3 style="margin-top:1.5rem">📈 Activity</h3><p style="color:var(--text-light)">Task completion rate: <strong id="aRate">0%</strong></p>`;
        loadAdminStats();
    } else if(tab==='users'){
        c.innerHTML=`<h3>👥 Team Members</h3><p style="color:var(--text-light)">Manage team access and roles.</p><div style="margin-top:1rem"><input type="text" placeholder="Name" style="padding:0.5rem;border:1px solid var(--border);border-radius:8px;margin-right:0.5rem"><input type="email" placeholder="Email" style="padding:0.5rem;border:1px solid var(--border);border-radius:8px;margin-right:0.5rem"><select style="padding:0.5rem;border:1px solid var(--border);border-radius:8px;margin-right:0.5rem"><option>Member</option><option>Admin</option></select><button class="btn btn-primary">Add</button></div>`;
    } else if(tab==='projects'){
        c.innerHTML=`<h3>📁 All Projects</h3><div id="adminProjectsList"></div>`;
        loadAdminProjects();
    } else if(tab==='reports'){
        c.innerHTML=`<h3>📈 Reports</h3><p style="color:var(--text-light)">Generate reports on project progress and team performance.</p><div style="margin-top:1rem"><button class="btn btn-primary" onclick="alert('Report generated!')">📄 Generate Full Report</button> <button class="btn btn-outline" onclick="alert('Exported!')">📊 Export CSV</button></div>`;
    }
}

async function loadAdminStats(){
    try{
        const [projects, tasks] = await Promise.all([fetch(`${API}/projects`).then(r=>r.json()),fetch(`${API}/tasks`).then(r=>r.json())]);
        const done = tasks.filter(t=>t.status==='done').length;
        const over = tasks.filter(t=>t.due&&new Date(t.due)<new Date()&&t.status!=='done').length;
        const rate = tasks.length ? Math.round(done/tasks.length*100) : 0;
        const ap=document.getElementById('aProj');if(ap)ap.textContent=projects.length;
        const at=document.getElementById('aTasks');if(at)at.textContent=tasks.length;
        const ad=document.getElementById('aDone');if(ad)ad.textContent=done;
        const ao=document.getElementById('aOver');if(ao)ao.textContent=over;
        const ar=document.getElementById('aRate');if(ar)ar.textContent=rate+'%';
    }catch(e){}
}

async function loadAdminProjects(){
    try{
        const res = await fetch(`${API}/projects`);
        const projects = await res.json();
        const el = document.getElementById('adminProjectsList');
        if(!el) return;
        el.innerHTML = '<table><tr><th>Name</th><th>Status</th><th>Tasks</th></tr>' + projects.map(p => `<tr><td>${p.name}</td><td><span class="badge badge-info">${p.status}</span></td><td>${p.tasks||0}</td></tr>`).join('') + '</table>';
    }catch(e){}
}

// Init
loadProjects();
loadTasks();
