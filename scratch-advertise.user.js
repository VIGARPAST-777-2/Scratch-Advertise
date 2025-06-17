// ==UserScript==
// @name         Scratch Advertise Full Handler (EN + Credits)
// @namespace    https://scratch.mit.edu/
// @version      2.4
// @description  Advertise projects/studios on separate pages with credit to VIGARPAST_777
// @match        https://scratch.mit.edu/advertise
// @match        https://scratch.mit.edu/advertise-projects
// @match        https://scratch.mit.edu/advertise-studios
// @grant        GM_xmlhttpRequest
// @connect      scratchadvertise-f787.restdb.io
// ==/UserScript==

(async function() {
    'use strict';
      const encryptedKey = [
    99,100,54,51,97,97,101,55,102,48,56,53,53,55,98,52,
    100,102,98,48,50,51,53,52,99,97,51,48,48,101,57,97,
    99,102,102,48,100
  ];
  const API_KEY = encryptedKey.map(c => String.fromCharCode(c)).join('');
    const API_PROJECTS_URL = "https://scratchadvertise-f787.restdb.io/rest/projects";
    const API_STUDIOS_URL = "https://scratchadvertise-f787.restdb.io/rest/studios";

    const HEADERS = {
        "x-apikey": API_KEY,
        "Content-Type": "application/json"
    };

    const addCredits = () => {
        const topBar = document.createElement("div");
        topBar.innerHTML = `
            <div style="text-align:center; font-weight:bold; padding:10px 0; font-size:18px;">
                Developed by <a href="https://scratch.mit.edu/users/VIGARPAST_777/" target="_blank" style="color:#007bff;">VIGARPAST_777</a>
            </div>
        `;
        document.body.prepend(topBar);

        const bottom = document.createElement("div");
        bottom.innerHTML = `
            <div style="text-align:center; padding:20px 0;">
                <img src="https://uploads.scratch.mit.edu/users/avatars/69475709.png" style="width:100px;height:100px;border-radius:50%;box-shadow:0 0 8px rgba(0,0,0,0.2);" alt="Profile picture">
                <div style="margin-top:10px;font-size:16px;">Don’t forget to follow me!</div>
            </div>
        `;
        document.body.appendChild(bottom);
    };

    const path = window.location.pathname;
    if (path === "/advertise") {
        document.body.innerHTML = `
            <style>
                body { font-family: sans-serif; background:#f5f5f5; height:100vh; margin:0;
                       display:flex; justify-content:center; align-items:center; flex-direction:column; }
                #box { background:white; padding:30px; border-radius:8px; text-align:center;
                       box-shadow:0 4px 8px rgba(0,0,0,0.1); }
                select, button { font-size:18px; padding:10px; margin: 10px 0; }
                a.button { text-decoration: none; background: #ccc; padding: 10px 20px; border-radius: 6px; display: inline-block; }
            </style>
            <div id="box">
                <h2>What do you want to advertise?</h2>
                <select id="sel">
                    <option disabled selected>Select...</option>
                    <option value="projects">🚀 Projects</option>
                    <option value="studios">🎬 Studios</option>
                </select><br>
                <a href="https://scratch.mit.edu" class="button">← Back to Scratch</a>
            </div>
        `;
        document.getElementById("sel").addEventListener("change", e => {
            window.location.href = e.target.value === "projects"
                ? "/advertise-projects"
                : "/advertise-studios";
        });
        addCredits();
        return;
    }

    const isProjects = path === "/advertise-projects";
    const apiURL = isProjects ? API_PROJECTS_URL : API_STUDIOS_URL;
    const label = isProjects ? "Project" : "Studio";

    document.body.innerHTML = `
        <style>
            body { font-family: sans-serif; background:#f0f0f0; margin:20px; }
            .box { background:white; padding:20px; border-radius:8px; max-width:900px;
                   margin:auto; box-shadow:0 3px 6px rgba(0,0,0,0.1); }
            input, button {
                width:100%; padding:12px; margin-top:10px;
                font-size:16px; border-radius:6px; border:1px solid #ccc;
            }
            button { background:#007bff; color:white; border:none; cursor:pointer; }
            button:disabled { background:#aaa; cursor:default }
            .item {
                display:flex; gap:12px; margin-top:15px;
                padding:10px; background:#fafafa; border-radius:6px;
                align-items: flex-start;
                word-wrap: break-word;
            }
            .item img {
                width:100px; height:75px; object-fit:cover; border-radius:4px;
                flex-shrink: 0;
            }
            .item .info {
                flex: 1;
                overflow-wrap: break-word;
                word-break: break-word;
                font-size: 14px;
                line-height: 1.4;
            }
            .top-links {
                display: flex; justify-content: space-between; margin-bottom: 10px;
            }
            .top-links a {
                background: #ddd; padding: 8px 16px;
                text-decoration: none; border-radius: 5px;
                font-size: 14px;
            }
        </style>
        <div class="box">
            <div class="top-links">
                <a href="/advertise">← Change type</a>
                <a href="https://scratch.mit.edu">← Back to Scratch</a>
            </div>
            <h2>Submit a ${label}</h2>
            <input type="text" id="inpId" placeholder="Enter ${label} ID">
            <button id="btn">Submit</button>
            <div id="list"><em>Loading ${label.toLowerCase()}s...</em></div>
        </div>
    `;

    function req(method, url, data) {
        return new Promise((res, rej) => {
            GM_xmlhttpRequest({
                method, url, headers: HEADERS,
                data: data ? JSON.stringify(data) : null,
                onload: r => r.status >= 200 && r.status < 300 ? res(r.responseText) : rej(r),
                onerror: rej
            });
        });
    }

    async function loadList() {
        const txt = await req("GET", apiURL);
        const arr = JSON.parse(txt).sort((a,b)=> new Date(b.date)-new Date(a.date));
        const html = arr.map(o => {
            const id = isProjects ? o.projectId : o.studioId;
            const usr = isProjects ? o.author : (o.curator || "unknown");
            const image = isProjects
                ? `https://uploads.scratch.mit.edu/projects/thumbnails/${id}.png`
                : `https://cdn2.scratch.mit.edu/get_image/gallery/${id}_170x100.png`;
            return `
                <div class="item">
                    <img src="${image}" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg'">
                    <div class="info">
                        <strong>${o.title}</strong><br>
                        👤 ${usr}<br>
                        📅 ${new Date(o.date).toLocaleString()}<br>
                        <a href="https://scratch.mit.edu/${isProjects ? 'projects' : 'studios'}/${id}" target="_blank">View on Scratch</a>
                    </div>
                </div>`;
        }).join("");
        document.getElementById("list").innerHTML = html || `<em>No ${label.toLowerCase()}s yet.</em>`;
    }

    document.getElementById("btn").addEventListener("click", async ()=>{
        const val = document.getElementById("inpId").value.trim();
        if (!/^\d+$/.test(val)) { alert("Invalid ID."); return; }
        document.getElementById("btn").disabled = true;
        try {
            const apiEnt = isProjects ? `projects/${val}` : `studios/${val}`;
            const resp = await fetch(`https://api.scratch.mit.edu/${apiEnt}`);
            if (!resp.ok) throw "Invalid ID";
            const dat = await resp.json();

            const existTxt = await req("GET", apiURL);
            const existArr = JSON.parse(existTxt);
            const exists = existArr.find(e =>
                isProjects ? e.projectId == val : e.studioId == val
            );
            if (exists) {
                await req("PATCH", `${apiURL}/${exists._id}`, {date: new Date().toISOString()});
                alert("Date updated.");
            } else {
                const payload = isProjects
                    ? { projectId: dat.id, title: dat.title, author: dat.author.username, date: new Date().toISOString() }
                    : { studioId: dat.id, title: dat.title, curator: dat.curator?.username || "unknown", date: new Date().toISOString() };
                await req("POST", apiURL, payload);
                alert("Saved.");
            }
            document.getElementById("inpId").value = "";
            loadList();
        } catch(e) {
            alert(e);
        } finally {
            document.getElementById("btn").disabled = false;
        }
    });

    loadList();
    addCredits();
})();
