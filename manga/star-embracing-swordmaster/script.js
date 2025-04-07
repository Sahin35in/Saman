document.addEventListener("DOMContentLoaded", function () {
    let totalViewsElement = document.getElementById("totalViews");

    // 📌 Eğer localStorage'da değer yoksa, ilk değeri oluştur
    if (localStorage.getItem("starViews") === null) {
        localStorage.setItem("starViews", "0"); // 🌟 Başlangıç değeri olarak 0 koy
    }

    // 🌟 Kullanıcı sadece belirli URL'ye geldiğinde artır
    if (window.location.pathname.includes("/manga/star-embracing-swordmaster/star.html")) {
        let starViews = parseInt(localStorage.getItem("starViews")) || 0;
        starViews += 1; // 🌟 Her girişte artır

        localStorage.setItem("starViews", starViews);

        if (totalViewsElement) {
            totalViewsElement.innerHTML = `<strong>Görüntülenme:</strong> ${starViews}`;
        }
    }
});
document.addEventListener("DOMContentLoaded", function () {
    let lastChapterButton = document.querySelector(".son"); // "Son Bölümü Oku" butonu

    // 📌 En son eklenen bölüm yolunu al
    let storedChapters = JSON.parse(localStorage.getItem("chapters")) || [];

    if (storedChapters.length > 0) {
        let lastChapter = storedChapters[storedChapters.length - 1]; // 🌟 En son eklenen bölüm
        lastChapterButton.parentElement.setAttribute("href", lastChapter.path); // 🌟 href güncelleme
    }
});

document.addEventListener("DOMContentLoaded", function () {
    let lastUpdateElement = document.getElementById("lastUpdate");

    // 📌 LocalStorage'da saklanan en son güncelleme tarihini al
    let lastUpdateDate = localStorage.getItem("lastUpdateDate") || "Henüz bölüm eklenmedi!";
    
    // 📌 HTML’de göster
    if (lastUpdateElement) {
        lastUpdateElement.innerHTML = `<strong>Güncellenme Zamanı:</strong> ${lastUpdateDate}`;
    }

    // 📌 Yeni bir bölüm eklendiğinde tarihini kaydet
    document.getElementById("addChapterButton").addEventListener("click", function () {
        let today = new Date().toLocaleDateString(); // 🌟 Tarihi al (gg.aa.yyyy formatında)
        localStorage.setItem("lastUpdateDate", today); // 🌟 Tarihi sakla
        
        if (lastUpdateElement) {
            lastUpdateElement.innerHTML = `<strong>Güncellenme Zamanı:</strong> ${today}`;
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
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

    let currentPage = window.location.pathname; 
    let storedChapters = JSON.parse(localStorage.getItem(`chapters_${currentPage}`)) || [];
    storedChapters.forEach(chapter => addChapterToUI(chapter));

    // 📌 Bölüm ekleme fonksiyonu
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
        localStorage.setItem(`chapters_${currentPage}`, JSON.stringify(storedChapters));


        addChapterToUI(newChapter);
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
        localStorage.setItem("chapters", JSON.stringify(storedChapters));

        chapterList.removeChild(chapterList.lastChild); // 🌟 HTML’den de kaldır
    });

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
