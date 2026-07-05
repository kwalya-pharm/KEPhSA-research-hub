document.addEventListener("DOMContentLoaded", () => {
    const yearEl = document.getElementById("calendarYear");
    const gridEl = document.getElementById("calendarGrid");

    if (!yearEl || !gridEl) {
        return;
    }

    const year = new Date().getFullYear();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const events = [
        { date: `${year}-09-25`, title: "World Pharmacy Day" },
        { date: `${year}-07-18`, title: "Research Symposium" },
        { date: `${year}-11-12`, title: "Annual Scientific Conference" },
        { date: `${year}-12-05`, title: "Alumni Homecoming" }
    ];

    yearEl.textContent = year;

    months.forEach((month, index) => {
        const card = document.createElement("div");
        card.className = "month-card";
        card.innerHTML = `
            <div class="month-title">${month}</div>
            <div class="weekdays">${weekdays.map((day) => `<div>${day}</div>`).join("")}</div>
            <div class="days"></div>
        `;

        const daysContainer = card.querySelector(".days");
        const firstDay = new Date(year, index, 1).getDay();
        const totalDays = new Date(year, index + 1, 0).getDate();
        const today = new Date();

        for (let i = 0; i < firstDay; i += 1) {
            const empty = document.createElement("div");
            empty.className = "day empty";
            daysContainer.appendChild(empty);
        }

        for (let day = 1; day <= totalDays; day += 1) {
            const cell = document.createElement("div");
            cell.className = "day";
            cell.textContent = day;

            const date = `${year}-${String(index + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            if (today.getFullYear() === year && today.getMonth() === index && today.getDate() === day) {
                cell.classList.add("today");
            }

            const event = events.find((entry) => entry.date === date);
            if (event) {
                cell.classList.add("event");
                cell.dataset.title = event.title;
            }

            daysContainer.appendChild(cell);
        }

        gridEl.appendChild(card);
    });
});
