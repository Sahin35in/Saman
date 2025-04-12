document.addEventListener("DOMContentLoaded", async function () {
    let isAdmin = localStorage.getItem("admin") === "true";

    if (!isAdmin) {
        document.getElementById("adminPanel").style.display = "none";
        document.getElementById("logoutButton").style.display = "none";
    }

    let bolumlerNanoMachine = document.getElementById("bolumlerNanoMachine");
    let bolumlerStar = document.getElementById("bolumlerStar");

    let logoutButton = document.getElementById("logoutButton");
    logoutButton.style.display = isAdmin ? "inline-block" : "none";

    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("admin");
        window.location.reload();
    });

    // Bölümleri JSON'dan çek
    async function fetchChapters() {
        const response = await fetch("/bolumler.json");
        const jsonData = await response.json();
        const localData = JSON.parse(localStorage.getItem("tumMangalarinBolumleri")) || {};

        // JSON ve localStorage senkronizasyonu
        Object.keys(jsonData).forEach(mangaAdi => {
            if (!localData[mangaAdi]) localData[mangaAdi] = [];
            jsonData[mangaAdi].forEach(chapter => {
                if (!localData[mangaAdi].some(localChapter => localChapter.number === chapter.number)) {
                    localData[mangaAdi].push({
                        ...chapter,
                        views: chapter.views || 0 // Görüntülenme sayısı ekleniyor
                    });
                }
            });
        });

        localStorage.setItem("tumMangalarinBolumleri", JSON.stringify(localData));
        updateChaptersUI();
    }

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

                // Görüntülenme sayısını ve güncellenme zamanını göster
                li.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <a href="${bolum.path}" style="font-size: 0.9em;">${bolum.title}</a>
                        <span class="time-ago" style="font-size: 0.7em; color: gray; margin-left: 10px;"></span>
                        <br />
                        <span style="font-size: 0.7em; color: gray;">Görüntülenme: ${bolum.views}</span>
                    </div>
                    <button class="view-button" data-manga="${mangaAdi}" data-chapter="${bolum.number}" style="font-size: 0.7em; margin-left: 10px;">Görüntüle</button>
                </div>
                `;

                bolumListesi.appendChild(li);
            });
        });

        updateTimes();
        addViewListeners(); // Görüntüleme butonu için olay dinleyicileri ekle
    }

    function addViewListeners() {
        const buttons = document.querySelectorAll(".view-button");
        buttons.forEach(button => {
            button.addEventListener("click", function () {
                const mangaAdi = button.getAttribute("data-manga");
                const chapterNumber = parseInt(button.getAttribute("data-chapter"));

                const tumMangalarinBolumleri = JSON.parse(localStorage.getItem("tumMangalarinBolumleri")) || {};
                if (tumMangalarinBolumleri[mangaAdi]) {
                    const chapter = tumMangalarinBolumleri[mangaAdi].find(ch => ch.number === chapterNumber);
                    if (chapter) {
                        chapter.views = (chapter.views || 0) + 1; // Görüntülenme sayısını artır
                        localStorage.setItem("tumMangalarinBolumleri", JSON.stringify(tumMangalarinBolumleri));
                        updateChaptersUI();
                    }
                }
            });
        });
    }

    await fetchChapters();
    setInterval(updateTimes, 60000); // Her 60 saniyede zaman güncelle
});
