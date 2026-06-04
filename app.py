#!/usr/bin/env python3
"""
TaskFlow - Project Management Backend
Flask API for projects, tasks, kanban, calendar, and admin panel.
Usage: python3 app.py
"""

from flask import Flask, request, jsonify, send_from_directory
import json, os, uuid, datetime

app = Flask(__name__, static_folder='static', template_folder='templates')
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

def load(filename):
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return []

def save(filename, data):
    with open(os.path.join(DATA_DIR, filename), 'w') as f:
        json.dump(data, f, indent=2)

if not os.path.exists(os.path.join(DATA_DIR, 'projects.json')):
    now = datetime.datetime.now().isoformat()
    save('projects.json', [
        {'id': str(uuid.uuid4()), 'name': 'StudyHub Portal', 'description': 'Student portal with courses, assignments, and grades', 'status': 'active', 'tasks': 8, 'icon': '📚', 'created': now},
        {'id': str(uuid.uuid4()), 'name': 'DevForge Tools', 'description': 'Developer tools hub with 12+ utilities', 'status': 'active', 'tasks': 12, 'icon': '⚡', 'created': now},
        {'id': str(uuid.uuid4()), 'name': 'TaskFlow', 'description': 'Project management with kanban and calendar', 'status': 'active', 'tasks': 6, 'icon': '📋', 'created': now},
        {'id': str(uuid.uuid4()), 'name: 'VulnScope v2', 'description': 'Next-gen vulnerability intelligence platform', 'status': 'planning', 'tasks': 15, 'icon': '🔒', 'created': now},
    ])
    save('tasks.json', [
        {'id': str(uuid.uuid4()), 'title': 'Design database schema', 'project': 'StudyHub Portal', 'priority': 'high', 'status': 'done', 'due': '2026-06-05'},
        {'id': str(uuid.uuid4()), 'title': 'Build REST API endpoints', 'project': 'StudyHub Portal', 'priority': 'high', 'status': 'progress', 'due': '2026-06-10'},
        {'id': str(uuid.uuid4()), 'title': 'Create admin panel UI', 'project': 'StudyHub Portal', 'priority': 'medium', 'status': 'todo', 'due': '2026-06-15'},
        {'id': str(uuid.uuid4()), 'title': 'Implement JWT auth', 'project': 'StudyHub Portal', 'priority': 'high', 'status': 'todo', 'due': '2026-06-12'},
        {'id': str(uuid.uuid4()), 'title': 'JSON formatter tool', 'project': 'DevForge Tools', 'priority': 'high', 'status': 'done', 'due': '2026-06-03'},
        {'id': str(uuid.uuid4()), 'title': 'Regex tester', 'project': 'DevForge Tools', 'priority': 'medium', 'status': 'done', 'due': '2026-06-04'},
        {'id': str(uuid.uuid4()), 'title': 'API playground', 'project': 'DevForge Tools', 'priority': 'medium', 'status': 'progress', 'due': '2026-06-08'},
        {'id': str(uuid.uuid4()), 'title': 'Kanban board view', 'project': 'TaskFlow', 'priority': 'high', 'status': 'progress', 'due': '2026-06-10'},
        {'id': str(uuid.uuid4()), 'title': 'Calendar integration', 'project': 'TaskFlow', 'priority': 'low', 'status': 'todo', 'due': '2026-06-20'},
        {'id': str(uuid.uuid4()), 'title': 'Team collaboration', 'project': 'TaskFlow', 'priority': 'medium', 'status': 'todo', 'due': '2026-06-25'},
    ])

@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

@app.route('/login.html')
def login():
    return '''<!DOCTYPE html><html><head><title>TaskFlow Login</title><link rel="stylesheet" href="/static/css/style.css"></head><body style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg)">
<div class="card" style="max-width:400px;width:90%"><h2 style="text-align:center;margin-bottom:1.5rem">📋 TaskFlow Login</h2>
<form onsubmit="event.preventDefault();login()">
<div class="form-group"><label>Email</label><input type="email" id="email" value="user@example.com" required></div>
<div class="form-group"><label>Password</label><input type="password" id="password" value="password" required></div>
<button type="submit" class="btn btn-primary" style="width:100%">Login</button></form></div>
<script>function login(){localStorage.setItem('taskflow_user',JSON.stringify({name:'User',email:document.getElementById('email').value}));window.location.href='/'}</script></body></html>'''

# ── Projects API ──
@app.route('/api/projects', methods=['GET'])
def get_projects():
    return jsonify(load('projects.json'))

@app.route('/api/projects', methods=['POST'])
def create_project():
    p = request.json
    p['id'] = str(uuid.uuid4())
    p['created'] = datetime.datetime.now().isoformat()
    projects = load('projects.json')
    projects.append(p)
    save('projects.json', projects)
    return jsonify(p), 201

@app.route('/api/projects/<pid>', methods=['PUT'])
def update_project(pid):
    projects = load('projects.json')
    for p in projects:
        if p['id'] == pid:
            p.update(request.json)
            break
    save('projects.json', projects)
    return jsonify(p)

@app.route('/api/projects/<pid>', methods=['DELETE'])
def delete_project(pid):
    projects = [p for p in load('projects.json') if p['id'] != pid]
    save('projects.json', projects)
    return '', 204

# ── Tasks API ──
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    return jsonify(load('tasks.json'))

@app.route('/api/tasks', methods=['POST'])
def create_task():
    t = request.json
    t['id'] = str(uuid.uuid4())
    tasks = load('tasks.json')
    tasks.append(t)
    save('tasks.json', tasks)
    return jsonify(t), 201

@app.route('/api/tasks/<tid>', methods=['PUT'])
def update_task(tid):
    tasks = load('tasks.json')
    for t in tasks:
        if t['id'] == tid:
            t.update(request.json)
            break
    save('tasks.json', tasks)
    return jsonify(t)

@app.route('/api/tasks/<tid>', methods=['DELETE'])
def delete_task(tid):
    tasks = [t for t in load('tasks.json') if t['id'] != tid]
    save('tasks.json', tasks)
    return '', 204

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    print(f"📋 TaskFlow running at http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
