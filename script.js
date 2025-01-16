const sectionTemplates = {
    header: () => `
        <div class="resume-section fade-in" data-section="header">
            <h1 contenteditable="true">Your Name</h1>
            <p contenteditable="true">Professional Title</p>
            <p contenteditable="true">Email • Phone • Location</p>
        </div>
    `,
    experience: () => `
        <div class="resume-section fade-in" data-section="experience">
            <h2 contenteditable="true">Work Experience</h2>
            <div class="experience-item">
                <h3 contenteditable="true">Company Name</h3>
                <p contenteditable="true">Position • Date Range</p>
                <ul>
                    <li contenteditable="true">Key achievement or responsibility</li>
                    <li contenteditable="true">Click to edit this bullet point</li>
                </ul>
            </div>
        </div>
    `,
    education: () => `
        <div class="resume-section fade-in" data-section="education">
            <h2 contenteditable="true">Education</h2>
            <h3 contenteditable="true">University Name</h3>
            <p contenteditable="true">Degree • Graduation Date</p>
            <p contenteditable="true">Relevant Coursework • GPA</p>
        </div>
    `,
    skills: () => `
        <div class="resume-section fade-in" data-section="skills">
            <h2 contenteditable="true">Skills</h2>
            <p contenteditable="true">Technical Skills: Skill 1, Skill 2, Skill 3</p>
            <p contenteditable="true">Soft Skills: Skill 1, Skill 2, Skill 3</p>
        </div>
    `,
    projects: () => `
        <div class="resume-section fade-in" data-section="projects">
            <h2 contenteditable="true">Projects</h2>
            <div class="project-item">
                <h3 contenteditable="true">Project Name</h3>
                <p contenteditable="true">Technologies Used</p>
                <ul>
                    <li contenteditable="true">Key feature or achievement</li>
                    <li contenteditable="true">Click to edit this bullet point</li>
                </ul>
            </div>
        </div>
    `
};

let versions = [];
let isDarkTheme = false;

const resumePreview = document.getElementById('resumePreview');
const sectionItems = document.querySelectorAll('.section-item');
const initialPrompt = document.getElementById('initial-prompt');
const commandPalette = document.getElementById('commandPalette');
const themeToggle = document.getElementById('themeToggle');

document.addEventListener('DOMContentLoaded', initializeApp);
themeToggle.addEventListener('click', toggleTheme);
document.getElementById('exportPDF').addEventListener('click', exportToPDF);
document.getElementById('saveVersion').addEventListener('click', saveVersion);

function initializeApp() {
    setupDragAndDrop();
    setupCommandPalette();
    setupContentObserver();
    setupVersionHistory();
    updateProgress();
}

function setupDragAndDrop() {
    sectionItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });

    resumePreview.addEventListener('dragover', handleDragOver);
    resumePreview.addEventListener('drop', handleDrop);
}

function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.section);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const sectionType = e.dataTransfer.getData('text/plain');
    
    if (initialPrompt) {
        initialPrompt.remove();
    }

    if (sectionTemplates[sectionType]) {
        const newSection = sectionTemplates[sectionType]();
        resumePreview.insertAdjacentHTML('beforeend', newSection);
        addSectionToolbar(resumePreview.lastElementChild);
    }

    document.querySelectorAll('.drag-over').forEach(element => {
        element.classList.remove('drag-over');
    });
}

function setupCommandPalette() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            toggleCommandPalette();
        }
    });

    const commandInput = commandPalette.querySelector('.command-input');
    commandInput.addEventListener('input', handleCommandSearch);
}

function toggleCommandPalette() {
    commandPalette.classList.toggle('active');
    if (commandPalette.classList.contains('active')) {
        commandPalette.querySelector('input').focus();
    }
}

function handleCommandSearch(e) {
    const commands = [
        { label: 'Export PDF', action: exportToPDF },
        { label: 'Toggle Theme', action: toggleTheme },
        { label: 'Save Version', action: saveVersion },
        { label: 'Show AI Suggestions', action: toggleAISuggestions },
        { label: 'Show Version History', action: toggleVersionHistory }
    ];

    const searchTerm = e.target.value.toLowerCase();
    const filteredCommands = commands.filter(cmd => 
        cmd.label.toLowerCase().includes(searchTerm)
    );

    const commandList = commandPalette.querySelector('.command-list');
    commandList.innerHTML = filteredCommands
        .map(cmd => `
            <div class="command-item" onclick="executeCommand('${cmd.label}')">
                ${cmd.label}
            </div>
        `).join('');
}

function executeCommand(commandLabel) {
    const commands = {
        'Export PDF': exportToPDF,
        'Toggle Theme': toggleTheme,
        'Save Version': saveVersion,
        'Show AI Suggestions': toggleAISuggestions,
        'Show Version History': toggleVersionHistory
    };

    if (commands[commandLabel]) {
        commands[commandLabel]();
        toggleCommandPalette();
    }
}

function setupVersionHistory() {
    saveVersion();
}

function saveVersion() {
    const content = resumePreview.innerHTML;
    const timestamp = new Date();
    versions.push({ timestamp, content });
    showToast('Version saved');
    updateVersionHistory();
}

function updateVersionHistory() {
    const historyList = document.querySelector('.history-list');
    historyList.innerHTML = versions.map((version, index) => `
        <div class="version-item">
            <span>Version ${index + 1}</span>
            <span>${version.timestamp.toLocaleTimeString()}</span>
            <button onclick="restoreVersion(${index})">Restore</button>
        </div>
    `).join('');
}

function restoreVersion(index) {
    if (versions[index]) {
        resumePreview.innerHTML = versions[index].content;
        showToast('Version restored');
        setupSectionToolbars();
    }
}

function toggleVersionHistory() {
    document.getElementById('versionHistory').classList.toggle('active');
}

function toggleAISuggestions() {
    const suggestions = document.getElementById('aiSuggestions');
    suggestions.classList.toggle('active');
    if (suggestions.classList.contains('active')) {
        updateAISuggestions();
    }
}

function updateAISuggestions() {
    const content = resumePreview.textContent.toLowerCase();
    const suggestions = [];

    if (!content.includes('achieved') && !content.includes('improved')) {
        suggestions.push('Consider adding measurable achievements');
    }
    if (!content.includes('skill') || !content.includes('proficient')) {
        suggestions.push('Add more detail to your skills section');
    }
    if (content.length < 500) {
        suggestions.push('Your resume could use more content');
    }

    document.querySelector('.suggestions-content').innerHTML = suggestions
        .map(s => `<div class="suggestion-item">${s}</div>`)
        .join('');
}

function updateProgress() {
    const sections = resumePreview.querySelectorAll('.resume-section');
    const filledSections = Array.from(sections).filter(section => {
        return section.textContent.trim().length > 50; // Arbitrary threshold
    });
    
    const progress = sections.length ? (filledSections.length / sections.length) * 100 : 0;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

function setupSectionToolbars() {
    document.querySelectorAll('.resume-section').forEach(addSectionToolbar);
}

function addSectionToolbar(section) {
    const existingToolbar = section.querySelector('.section-toolbar');
    if (existingToolbar) {
        existingToolbar.remove();
    }

    const toolbar = document.createElement('div');
    toolbar.className = 'section-toolbar';
    toolbar.innerHTML = `
        <button class="toolbar-button" onclick="duplicateSection(this)">
            <i class="fas fa-copy"></i>
        </button>
        <button class="toolbar-button" onclick="deleteSection(this)">
            <i class="fas fa-trash"></i>
        </button>
        <button class="toolbar-button" onclick="moveSection(this, 'up')">
            <i class="fas fa-arrow-up"></i>
        </button>
        <button class="toolbar-button" onclick="moveSection(this, 'down')">
            <i class="fas fa-arrow-down"></i>
        </button>
    `;
    section.appendChild(toolbar);
}

function duplicateSection(button) {
    const section = button.closest('.resume-section');
    const clone = section.cloneNode(true);
    section.after(clone);
    addSectionToolbar(clone);
    saveVersion();
}

function deleteSection(button) {
    const section = button.closest('.resume-section');
    section.remove();
    saveVersion();
}

function moveSection(button, direction) {
    const section = button.closest('.resume-section');
    const sibling = direction === 'up' ? section.previousElementSibling : section.nextElementSibling;
    
    if (sibling && sibling.classList.contains('resume-section')) {
        if (direction === 'up') {
            sibling.before(section);
        } else {
            sibling.after(section);
        }
        saveVersion();
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    isDarkTheme = !isDarkTheme;
    
    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
    
    showToast(`${isDarkTheme ? 'Dark' : 'Light'} theme activated`);
}

function exportToPDF() {
    const element = resumePreview;
    const opt = {
        margin: 1,
        filename: 'resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    const toolbars = element.querySelectorAll('.section-toolbar');
    toolbars.forEach(toolbar => toolbar.style.display = 'none');

    html2pdf().set(opt).from(element).save().then(() => {
        toolbars.forEach(toolbar => toolbar.style.display = '');
        showToast('PDF exported successfully');
    });
}

function setupContentObserver() {
    const observer = new MutationObserver(() => {
        updateProgress();
        updateAISuggestions();
    });

    observer.observe(resumePreview, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    toast.style.display = 'block';
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

document.addEventListener('DOMContentLoaded', initializeApp);
