// API Configuration
const API_BASE_URL = 'http://localhost:8000';
let currentUser = null;
let currentNoteId = null;
let isLoginMode = true;

// ============ Auth Functions ============

function toggleAuthMode(e) {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    const titleEl = document.getElementById('authTitle');
    const submitBtn = document.getElementById('authSubmitBtn');
    const confirmPasswordEl = document.getElementById('authConfirmPassword');
    const toggleText = document.getElementById('authToggleText');
    const toggleLink = document.getElementById('authToggleLink');
    
    if (isLoginMode) {
        titleEl.textContent = 'Login';
        submitBtn.textContent = 'Login';
        confirmPasswordEl.style.display = 'none';
        toggleText.textContent = "Don't have an account?";
        toggleLink.textContent = 'Register here';
    } else {
        titleEl.textContent = 'Register';
        submitBtn.textContent = 'Register';
        confirmPasswordEl.style.display = 'block';
        toggleText.textContent = 'Already have an account?';
        toggleLink.textContent = 'Login here';
    }
    
    document.getElementById('authForm').reset();
    document.getElementById('authMessage').style.display = 'none';
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    console.log('Auth submit started');
    
    const username = document.getElementById('authUsername').value;
    const password = document.getElementById('authPassword').value;
    const messageEl = document.getElementById('authMessage');
    const submitBtn = document.getElementById('authSubmitBtn');
    
    // Disable button during submission
    submitBtn.disabled = true;
    submitBtn.textContent = isLoginMode ? 'Logging in...' : 'Registering...';
    
    try {
        let response;
        
        if (isLoginMode) {
            console.log('Attempting login for user:', username);
            response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
        } else {
            const confirmPassword = document.getElementById('authConfirmPassword').value;
            
            if (password !== confirmPassword) {
                showMessage(messageEl, 'Passwords do not match', 'danger');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Register';
                return;
            }
            
            if (password.length < 6) {
                showMessage(messageEl, 'Password must be at least 6 characters', 'danger');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Register';
                return;
            }
            
            console.log('Attempting registration for user:', username);
            response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                // Auto-login after registration
                response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
            }
        }
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const error = await response.json();
            console.log('Error response:', error);
            showMessage(messageEl, error.detail || 'Authentication failed', 'danger');
            submitBtn.disabled = false;
            submitBtn.textContent = isLoginMode ? 'Login' : 'Register';
            return;
        }
        
        const data = await response.json();
        console.log('Auth successful, storing token');
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify({ username }));
        currentUser = { username };
        
        showAppUI();
        loadNotes();
    } catch (error) {
        console.error('Auth error:', error);
        showMessage(messageEl, 'Connection error. Make sure the backend is running on http://localhost:8000', 'danger');
        submitBtn.disabled = false;
        submitBtn.textContent = isLoginMode ? 'Login' : 'Register';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    isLoginMode = true;
    document.getElementById('authForm').reset();
    document.getElementById('authMessage').style.display = 'none';
    document.getElementById('authTitle').textContent = 'Login';
    document.getElementById('authSubmitBtn').textContent = 'Login';
    document.getElementById('authConfirmPassword').style.display = 'none';
    showAuthUI();
}

// ============ UI Navigation Functions ============

function showAuthUI() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('navbar').style.display = 'none';
}

function showAppUI() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    document.getElementById('navbar').style.display = 'block';
    document.getElementById('usernameDisplay').textContent = currentUser.username;
}

function showNotesListView() {
    document.getElementById('notesListView').style.display = 'block';
    document.getElementById('createNoteView').style.display = 'none';
    document.getElementById('editNoteView').style.display = 'none';
    loadNotes();
}

function showCreateNoteView() {
    document.getElementById('createNoteTitle').value = '';
    document.getElementById('createNoteContent').value = '';
    document.getElementById('createNoteMessage').style.display = 'none';
    document.getElementById('notesListView').style.display = 'none';
    document.getElementById('createNoteView').style.display = 'block';
    document.getElementById('editNoteView').style.display = 'none';
}

function showEditNoteView(noteId) {
    currentNoteId = noteId;
    document.getElementById('notesListView').style.display = 'none';
    document.getElementById('createNoteView').style.display = 'none';
    document.getElementById('editNoteView').style.display = 'block';
    
    // Load note data
    const messageEl = document.getElementById('editNoteMessage');
    messageEl.style.display = 'none';
    
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const note = notes.find(n => n.id === noteId);
    
    if (note) {
        document.getElementById('editNoteTitle').value = note.title;
        document.getElementById('editNoteContent').value = note.content;
    }
}

// ============ Note Functions ============

async function loadNotes() {
    const messageEl = document.getElementById('notesMessage');
    const spinnerEl = document.getElementById('notesLoadingSpinner');
    const gridEl = document.getElementById('notesGrid');
    
    messageEl.style.display = 'none';
    spinnerEl.style.display = 'block';
    gridEl.innerHTML = '';
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/notes/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        if (!response.ok) throw new Error('Failed to load notes');
        
        const notes = await response.json();
        localStorage.setItem('notes', JSON.stringify(notes));
        
        spinnerEl.style.display = 'none';
        
        if (notes.length === 0) {
            gridEl.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <h4>No notes yet</h4>
                        <p>Create your first note to get started!</p>
                        <button class="btn btn-primary" onclick="showCreateNoteView()">Create Note</button>
                    </div>
                </div>
            `;
        } else {
            notes.forEach(note => {
                const cardEl = document.createElement('div');
                cardEl.className = 'col-md-6 col-lg-4 mb-4';
                cardEl.innerHTML = `
                    <div class="card note-card h-100">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${escapeHtml(note.title)}</h5>
                            <p class="card-text flex-grow-1">${escapeHtml(note.content.substring(0, 100))}...</p>
                            <small class="text-muted">Updated: ${formatDate(note.updated_at)}</small>
                            <div class="note-actions mt-3">
                                <button class="btn btn-info btn-sm text-white" onclick="showEditNoteView(${note.id})">Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteNote(${note.id})">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
                gridEl.appendChild(cardEl);
            });
        }
    } catch (error) {
        spinnerEl.style.display = 'none';
        showMessage(messageEl, 'Failed to load notes', 'danger');
        console.error(error);
    }
}

async function handleCreateNote(e) {
    e.preventDefault();
    
    const title = document.getElementById('createNoteTitle').value;
    const content = document.getElementById('createNoteContent').value;
    const messageEl = document.getElementById('createNoteMessage');
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/notes/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        });
        
        if (!response.ok) throw new Error('Failed to create note');
        
        showNotesListView();
    } catch (error) {
        showMessage(messageEl, 'Failed to create note', 'danger');
        console.error(error);
    }
}

async function handleEditNote(e) {
    e.preventDefault();
    
    const title = document.getElementById('editNoteTitle').value;
    const content = document.getElementById('editNoteContent').value;
    const messageEl = document.getElementById('editNoteMessage');
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/notes/${currentNoteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        });
        
        if (!response.ok) throw new Error('Failed to update note');
        
        showNotesListView();
    } catch (error) {
        showMessage(messageEl, 'Failed to update note', 'danger');
        console.error(error);
    }
}

async function deleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to delete note');
        
        loadNotes();
    } catch (error) {
        alert('Failed to delete note');
        console.error(error);
    }
}

// ============ Utility Functions ============

function showMessage(element, message, type = 'danger') {
    element.textContent = message;
    element.className = `alert alert-${type}`;
    element.style.display = 'block';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============ Initialize ============

function initializeAuthUI() {
    const toggleLink = document.getElementById('authToggleLink');
    const toggleText = document.getElementById('authToggleText');
    
    if (isLoginMode) {
        toggleText.textContent = "Don't have an account?";
        toggleLink.textContent = 'Register here';
    } else {
        toggleText.textContent = 'Already have an account?';
        toggleLink.textContent = 'Login here';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        showAppUI();
        loadNotes();
    } else {
        showAuthUI();
        initializeAuthUI();
    }
});
