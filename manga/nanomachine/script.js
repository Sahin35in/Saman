document.addEventListener("DOMContentLoaded", async function () {
    let chapterList = document.getElementById("chapterListAlt");
    let addButton = document.getElementById("addChapterButton");
    let deleteButton = document.getElementById("deleteLastChapterButton");
    let isAdmin = localStorage.getItem("admin") === "true";

    // 📌 Eğer admin değilse, butonları gizle
    if (!isAdmin) {
        addButton.style.display = "none";
        deleteButton.style.display = "none";
    } else {
        addButton.style.display = "block";
        deleteButton.style.display = "block";
    }

    // 📌 Görüntülenme ve son güncelleme alanlarını getir
    let totalViewsElement = document.getElementById("totalViews");
    let lastUpdateElement = document.getElementById("lastUpdate");

    try {
        // 📌 Görüntülenme sayısını API'den çek (GET isteği)
        const response = await fetch("/api/views", { method: "GET" });
        if (!response.ok) {
            throw new Error("Görüntülenme sayısını alırken bir hata oluştu.");
        }
        const data = await response.json();
        const currentViews = data.views;

        // 📌 Görüntülenme sayısını artırmak için API'ye POST isteği gönder
        const updateResponse = await fetch("/api/views", { method: "POST" });
        if (!updateResponse.ok) {
            throw new Error("Görüntülenme sayısını artırırken bir hata oluştu.");
        }
        const updatedData = await updateResponse.json();
        const updatedViews = updatedData.views;

        // 📌 Görüntülenme sayısını güncelle ve HTML'de göster
        totalViewsElement.textContent = `Görüntülenme: ${updatedViews}`;

        // 📌 Son güncelleme zamanını ayarla ve HTML'e yazdır
        let currentTime = new Date();
        lastUpdateElement.textContent = `Son Güncelleme: ${formatDate(currentTime)}`;
    } catch (error) {
        console.error(error);
        totalViewsElement.textContent = "Görüntülenme: Yüklenemedi";
        lastUpdateElement.textContent = "Son Güncelleme: Yüklenemedi";
    }

    // 📌 Bölümleri LocalStorage'dan getir
    let storedChapters = JSON.parse(localStorage.getItem("nanoMachineChapters")) || [];
    storedChapters.forEach(chapter => addChapterToUI(chapter));

    // 📌 Bölüm ekleme fonksiyonu (Sadece Admin)
    addButton.addEventListener("click", function () {
        if (!isAdmin) {
            alert("Sadece admin kullanıcılar bölüm ekleyebilir!");
            return;
        }

        let newNumber = storedChapters.length + 1;
        let newTitle = `Bölüm ${newNumber}`;
        let newPath = `bolumler/${newNumber}.bolum/b${newNumber}.html`;
        let newTime = new Date().toISOString();
        let newChapter = { number: newNumber, title: newTitle, path: newPath, time: newTime };

        storedChapters.push(newChapter);
        localStorage.setItem("nanoMachineChapters", JSON.stringify(storedChapters));
        addChapterToUI(newChapter);

        // 📌 Ana sayfa için de ekle
        let tumMangalarinBolumleri = JSON.parse(localStorage.getItem("tumMangalarinBolumleri")) || {};
        if (!tumMangalarinBolumleri["Nano Machine"]) tumMangalarinBolumleri["Nano Machine"] = [];
        tumMangalarinBolumleri["Nano Machine"].push(newChapter);
        localStorage.setItem("tumMangalarinBolumleri", JSON.stringify(tumMangalarinBolumleri));

        alert("Yeni bölüm başarıyla eklendi!");
    });

    // 📌 Son eklenen bölümü silme fonksiyonu
    deleteButton.addEventListener("click", function () {
        if (!isAdmin) {
            alert("Sadece admin kullanıcılar bölüm silebilir!");
            return;
        }

        if (storedChapters.length === 0) {
            alert("Hiç bölüm eklenmemiş!");
            return;
        }

        storedChapters.pop(); // 🌟 Son eklenen bölümü kaldır
        localStorage.setItem("nanoMachineChapters", JSON.stringify(storedChapters));

        chapterList.removeChild(chapterList.lastChild); // 🌟 HTML’den de kaldır
    });

    // 📌 Bölüm listesine bir bölüm ekler
    function addChapterToUI(chapter) {
        let chapterItem = document.createElement("div");
        chapterItem.classList.add("chapter-item-alt");
        chapterItem.dataset.time = chapter.time;

        chapterItem.innerHTML = `
            <span class="chapter-title">${chapter.title} - <span class="time-label"></span></span>
            <button class="btn-view-alt" onclick="window.location.href='${chapter.path}'">İncele</button>
        `;

        chapterList.appendChild(chapterItem);
        updateTime(chapterItem);
    }

    // 📌 Zamanı günceller
    function updateTime(chapterItem) {
        let timeLabel = chapterItem.querySelector(".time-label");
        let chapterTime = new Date(chapterItem.dataset.time);
        let currentDate = new Date();

        let diffInMilliseconds = currentDate - chapterTime;
        let diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
        let diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
        let diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
        let diffInWeeks = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24 * 7));
        let diffInMonths = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24 * 30));

        let timeMessage;

        if (diffInMonths > 0) {
            timeMessage = `${diffInMonths} ay önce eklendi`;
        } else if (diffInWeeks > 0) {
            timeMessage = `${diffInWeeks} hafta önce eklendi`;
        } else if (diffInDays > 0) {
            timeMessage = `${diffInDays} gün önce eklendi`;
        } else if (diffInHours > 0) {
            timeMessage = `${diffInHours} saat önce eklendi`;
        } else {
            timeMessage = `${diffInMinutes} dakika önce eklendi`;
        }

        timeLabel.textContent = timeMessage;
    }

    setInterval(function () {
        document.querySelectorAll(".chapter-item-alt").forEach(updateTime);
    }, 60000);
});
