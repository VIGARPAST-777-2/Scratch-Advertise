// ==UserScript==
// @name         Scratch Advertise Projects (restdb.io + GM_xmlhttpRequest
// @namespace    https://scratch.mit.edu/
// @version      1.5
// @description  Save and display Scratch projects using restdb.io (with CORS bypass, date update, CSS, and back button) + Advertisements button
// @match        https://scratch.mit.edu/*
// @grant        GM_xmlhttpRequest
// @connect      scratchadvertise-f787.restdb.io
// ==/UserScript==

(async function () {
    'use strict';

    const API_URL = "https://scratchadvertise-f787.restdb.io/rest/projects";
    const API_KEY = "cd63aae7f08557b4dfb02354ca300e9acff0d";

    const isAdvertisePage = window.location.pathname === "/advertise";

    if (!isAdvertisePage) {
        // Crear botón "Advertisements" en esquina superior izquierda
        const advBtn = document.createElement('button');
        advBtn.textContent = 'Advertisements';
        advBtn.style.position = 'fixed';
        advBtn.style.top = '10px';
        advBtn.style.left = '10px';
        advBtn.style.zIndex = '9999';
        advBtn.style.padding = '8px 12px';
        advBtn.style.background = '#0055cc';
        advBtn.style.color = 'white';
        advBtn.style.border = 'none';
        advBtn.style.borderRadius = '6px';
        advBtn.style.cursor = 'pointer';
        advBtn.style.fontWeight = 'bold';
        advBtn.style.fontSize = '14px';
        advBtn.addEventListener('mouseenter', () => {
            advBtn.style.background = '#003d99';
        });
        advBtn.addEventListener('mouseleave', () => {
            advBtn.style.background = '#0055cc';
        });
        advBtn.addEventListener('click', () => {
            window.location.href = 'https://scratch.mit.edu/advertise';
        });
        document.body.appendChild(advBtn);
        return; // Salir para no cargar la UI del advertise aquí
    }

    // --- Código original para la página /advertise ---

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f0f0f0;
            margin: 0;
            padding: 60px 20px 20px 20px;
        }
        #container {
            max-width: 600px;
            margin: auto;
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        #backBtn {
            position: fixed;
            top: 15px;
            left: 15px;
            background: #0055cc;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 10px 14px;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: background 0.3s;
            z-index: 9999;
        }
        #backBtn:hover {
            background: #003d99;
        }
        input[type="text"] {
            padding: 8px;
            width: 200px;
            border-radius: 6px;
            border: 1px solid #ccc;
            font-size: 16px;
            box-sizing: border-box;
        }
        button#submitBtn {
            padding: 8px 14px;
            margin-left: 8px;
            border-radius: 6px;
            border: none;
            background: #28a745;
            color: white;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
        }
        button#submitBtn:disabled {
            background: #7cd59e;
            cursor: default;
        }
        button#submitBtn:hover:not(:disabled) {
            background: #1e7e34;
        }
        #projectList div.project {
            border: 1px solid #ccc;
            padding: 12px;
            margin: 12px 0;
            border-radius: 10px;
            background: #fafafa;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        #projectList img {
            border-radius: 6px;
            width: 100px;
            height: 80px;
            object-fit: cover;
        }
        #projectList .info {
            flex-grow: 1;
        }
        #projectList a {
            color: #0055cc;
            text-decoration: none;
            font-weight: 600;
        }
        #projectList a:hover {
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);

    // Create container
    const container = document.createElement('div');
    container.id = 'container';
    container.innerHTML = `
        <h2>📢 Advertise Scratch Project (restdb.io)</h2>
        <div style="margin-bottom: 15px;">
            <input type="text" id="projectId" placeholder="Project ID (numbers only)" />
            <button id="submitBtn">📤 Advertise</button>
        </div>
        <div id="projectList"><em>🔄 Loading projects...</em></div>
    `;
    document.body.innerHTML = '';
    document.body.appendChild(container);

    // Add back button
    const backBtn = document.createElement('button');
    backBtn.id = 'backBtn';
    backBtn.textContent = '← Back to Scratch';
    backBtn.addEventListener('click', () => {
        window.location.href = 'https://scratch.mit.edu/';
    });
    document.body.appendChild(backBtn);

    // GM_xmlhttpRequest functions as before
    function getProjects() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: `${API_URL}?sort=-date&max=50`,
                headers: {
                    "x-apikey": API_KEY
                },
                onload: res => {
                    try {
                        resolve(JSON.parse(res.responseText));
                    } catch (e) {
                        reject("Error parsing projects");
                    }
                },
                onerror: () => reject("Network error fetching projects")
            });
        });
    }

    function saveProject(project) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: API_URL,
                headers: {
                    "Content-Type": "application/json",
                    "x-apikey": API_KEY
                },
                data: JSON.stringify(project),
                onload: res => {
                    if (res.status >= 200 && res.status < 300) {
                        resolve();
                    } else {
                        reject("Error saving the project");
                    }
                },
                onerror: () => reject("Network error saving the project")
            });
        });
    }

    function updateProjectDate(id, newDate) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "PATCH",
                url: `${API_URL}/${id}`,
                headers: {
                    "Content-Type": "application/json",
                    "x-apikey": API_KEY
                },
                data: JSON.stringify({ date: newDate }),
                onload: res => {
                    if (res.status >= 200 && res.status < 300) {
                        resolve();
                    } else {
                        reject("Error updating the date");
                    }
                },
                onerror: () => reject("Network error updating the date")
            });
        });
    }

    async function addProject(id) {
        try {
            const submitBtn = document.getElementById("submitBtn");
            submitBtn.disabled = true;

            const res = await fetch(`https://api.scratch.mit.edu/projects/${id}`);
            if (!res.ok) throw new Error("Invalid project");
            const data = await res.json();

            const existingProjects = await getProjects();
            const existing = existingProjects.find(p => `${p.projectId}` === `${data.id}`);

            if (existing) {
                const newDate = new Date().toISOString();
                await updateProjectDate(existing._id, newDate);
                alert("🔄 Project already existed, date updated.");
            } else {
                const newProject = {
                    projectId: data.id,
                    title: data.title,
                    author: data.author.username,
                    date: new Date().toISOString()
                };
                await saveProject(newProject);
                alert("✅ Project advertised successfully.");
            }

            const updatedProjects = await getProjects();
            renderProjects(updatedProjects);
            document.getElementById("projectId").value = "";

        } catch (e) {
            console.error("❌ Error adding project:", e);
            alert("⚠️ " + e.message);
        } finally {
            document.getElementById("submitBtn").disabled = false;
        }
    }

    function renderProjects(projects) {
        const list = document.getElementById("projectList");
        if (!projects || projects.length === 0) {
            list.innerHTML = "<em>❌ No projects advertised yet.</em>";
            return;
        }

        projects.sort((a, b) => new Date(b.date) - new Date(a.date));

        const html = projects.map(p => `
            <div class="project">
                <img src="https://uploads.scratch.mit.edu/projects/thumbnails/${p.projectId}.png" alt="Thumbnail">
                <div class="info">
                    <strong>${p.title}</strong><br>
                    👤 <em>${p.author}</em><br>
                    📅 ${new Date(p.date).toLocaleString()}<br>
                    🔗 <a href="https://scratch.mit.edu/projects/${p.projectId}/" target="_blank" rel="noopener noreferrer">View Project</a>
                </div>
            </div>
        `).join("");
        list.innerHTML = html;
    }

    document.getElementById("submitBtn").addEventListener("click", () => {
        const id = document.getElementById("projectId").value.trim();
        if (!id || isNaN(id)) {
            alert("Please enter a valid ID (numbers only).");
            return;
        }
        addProject(id);
    });

    const projects = await getProjects();
    renderProjects(projects);

})();
