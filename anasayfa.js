document.addEventListener("DOMContentLoaded", async function () {
    let isAdmin = localStorage.getItem("admin") === "true";

    if (!isAdmin) {
        document.getElementById("adminPanel").style.display = "none";
        document.getElementById("logoutButton").style.display = "none";
    }

    let addChaptersButton = document.getElementById("addChaptersButton");
    let mangaNameInput = document.getElementById("mangaName");
    let chapterCountInput = document.getElementById("chapterCount");
    let bolumlerNanoMachine = document.getElementById("bolumlerNanoMachine");
    let bolumlerStar = document.getElementById("bolumlerStar");

    let logoutButton = document.getElementById("logoutButton");
    logoutButton.style.display = isAdmin ? "inline-block" : "none";

    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("admin");
        window.location.reload();
    });

    async function fetchChapters() {
        const response = await fetch("/bolumler.json");
        const data = await response.json();

        // Eğer `localStorage` boşsa, JSON verilerini kaydet
        if (!localStorage.getItem("tumMangalarinBolumleri")) {
            localStorage.setItem("tumMangalarinBolumleri", JSON.stringify(data));
        }

        updateChaptersUI();
    }

    addChaptersButton.addEventListener("click", function () {
        let userInput = mangaNameInput.value.trim();
        let chapterCount = parseInt(chapterCountInput.value);
        let commandParts = userInput.split(" ");
        let mangaAdi = commandParts[0].toLowerCase();
        let isDeleteCommand = commandParts.length > 1 && commandParts[1] === "sil";

        if (!["nanomachine", "star"].includes(mangaAdi)) {
            alert("Geçersiz manga ismi!");
            return;
        }

        let tumMangalarinBolumleri = JSON.parse(localStorage.getItem("tumMangalarinBolumleri")) || {};
        if (!tumMangalarinBolumleri[mangaAdi]) tumMangalarinBolumleri[mangaAdi] = [];

        if (isDeleteCommand) {
            let deleteCount = isNaN(chapterCount) ? 0 : chapterCount;
            tumMangalarinBolumleri[mangaAdi] = tumMangalarinBolumleri[mangaAdi].slice(0, -deleteCount);
            localStorage.setItem("tumMangalarinBolumleri", JSON.stringify(tumMangalarinBolumleri));
            alert(`"${mangaAdi}" için son ${deleteCount} bölüm silindi.`);
        } else {
            if (isNaN(chapterCount) || chapterCount <= 0) {
                alert("Geçerli bir bölüm sayısı girin!");
                return;
            }

            let startNumber = tumMangalarinBolumleri[mangaAdi].length + 1;
            let mangaPaths = {
                "nanomachine": "/manga/nanomachine/bolumler",
                "star": "/manga/BuyuKulesininSorunluCocugu/bolumler"
            };
            let basePath = mangaPaths[mangaAdi];

            for (let i = 0; i < chapterCount; i++) {
                let newNumber = startNumber + i;
                let newChapter = {
                    number: newNumber,
                    title: `Bölüm ${newNumber}`,
                    path: `${basePath}/${newNumber}.bolum/b${newNumber}.html`,
                    time: new Date().toISOString()
                };

                tumMangalarinBolumleri[mangaAdi].push(newChapter);
            }

            localStorage.setItem("tumMangalarinBolumleri", JSON.stringify(tumMangalarinBolumleri));
            alert(`"${mangaAdi}" için ${chapterCount} bölüm eklendi.`);
        }

        updateChaptersUI();
    });

    function timeAgo(isoDate) {
        const now = new Date();
        const then = new Date(isoDate);
        const diff = Math.floor((now - then) / 1000);

        const units = [
            { name: "gün", value: 86400 },
            { name: "saat", value: 3600 },
            { name: "dk", value: 60 },
            { name: "sn", value: 1 }
        ];

        for (let unit of units) {
            const amount = Math.floor(diff / unit.value);
            if (amount > 0) return `${amount} ${unit.name} önce`;
        }
        return "az önce";
    }

    function updateTimes() {
        document.querySelectorAll("li[data-time]").forEach(li => {
            const time = li.getAttribute("data-time");
            const span = li.querySelector("span.time-ago");
            if (span) {
                span.textContent = timeAgo(time);
            }
        });
    }

    function updateChaptersUI() {
        const tumMangalarinBolumleri = JSON.parse(localStorage.getItem("tumMangalarinBolumleri")) || {};

        const mangaIds = {
            "nanomachine": bolumlerNanoMachine,
            "star": bolumlerStar
        };

        Object.keys(mangaIds).forEach(mangaAdi => {
            const bolumListesi = mangaIds[mangaAdi];
            bolumListesi.innerHTML = "";

            const bolumler = (tumMangalarinBolumleri[mangaAdi] || [])
                .sort((a, b) => b.number - a.number)
                .slice(0, 4);

            bolumler.forEach(bolum => {
                const li = document.createElement("li");
                li.setAttribute("data-time", bolum.time);
                li.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <a href="${bolum.path}" style="font-size: 0.9em; margin-right: 140px;">${bolum.title}</a>
                    <span class="time-ago" style="font-size: 0.7em; color: gray; margin-left: 10px;"></span>
                </div>
            `;
                bolumListesi.appendChild(li);
            });
        });

        updateTimes();
    }

    await fetchChapters();
    setInterval(updateTimes, 60000); // Her 60 saniyede zaman güncelle
});
