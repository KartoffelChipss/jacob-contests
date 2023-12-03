const cropNames = {
    "0": "Cactus",
    "1": "Carrots",
    "2": "Cocoa beans",
    "3": "Melons",
    "4": "Mushrooms",
    "5": "Nether warts",
    "6": "Potatoes",
    "7": "Pumpkins",
    "8": "Sugar cane",
    "9": "Wheat"
};

/*--- loader ---*/
window.addEventListener("load", () => {
    const loader = document.querySelector(".loader");

    loader.classList.add("loader--hidden");

    loader.addEventListener("transitionend", () => {
        document.body.removeChild(loader);
    });
});

/*--- modals ---*/
var closeBTN = document.getElementsByClassName("close")[0];

function toggleModal(modal_id) {
    const modal = document.getElementById(modal_id);
    if (modal.classList.contains("_shown")) modal.classList.remove("_shown");
    else modal.classList.add("_shown");
}

function CopyToClipboard(id) {
    navigator.clipboard.writeText("Kartoffelchips#0445")
        .then(() => {
        console.log("Text copied to clipboard")
        })
        .catch(err => {
        console.log('Something went wrong', err);
        })
    alert('Discord Tag in die Zwichenablage Kopiert');
}

/*--- main functions ---*/
const typesBox = document.getElementById("typesBox");
const contestsBox = document.getElementById("contestsBox");
let allowedCrops = [];

function selectCrop(clickedEle, contests) {

    if (clickedEle.dataset.selected === "false") {// add a Filter
        clickedEle.dataset.selected = "true";
        clickedEle.classList.add("active");

        typesBox.querySelectorAll("button").forEach(button => {
            if (button.classList.contains("active")) return;

            button.classList.add("inactive");
        });

        if (clickedEle.classList.contains("inactive")) {
            clickedEle.classList.remove("inactive");
        }

        allowedCrops.push(clickedEle.dataset.cropid);
        
        contestsBox.querySelectorAll(".contest").forEach(contest => {
            if (!allowedCrops.includes(contest.dataset.cropone) && !allowedCrops.includes(contest.dataset.croptwo) && !allowedCrops.includes(contest.dataset.cropthree)) {
                contest.style.display = "none";
            } else {
                contest.style.display = "flex";
            }
        })
    } else {// remove a Filter
        clickedEle.dataset.selected = "false";
        clickedEle.classList.remove("active");

        if (typesBox.querySelectorAll(".active").length <= 0) {// if there is no active Flter
            typesBox.querySelectorAll("button").forEach(button => {
                if (button.classList.contains("inactive")) {
                    button.classList.remove("inactive");
                }
            });

            contestsBox.querySelectorAll(".contest").forEach(contest => {
                contest.style.display = "flex";
            });

            allowedCrops = [];
        } else {
            clickedEle.classList.add("inactive");

            allowedCrops = allowedCrops.filter(e => e !== clickedEle.dataset.cropid);
            
            contestsBox.querySelectorAll(".contest").forEach(contest => {
                if (!allowedCrops.includes(contest.dataset.cropone) && !allowedCrops.includes(contest.dataset.croptwo) && !allowedCrops.includes(contest.dataset.cropthree)) {
                    contest.style.display = "none";
                } else {
                    contest.style.display = "flex";
                }
            })
        }
    }
}

contestsBox.querySelectorAll(".contest").forEach(contest => {
    let dateEle = contest.querySelectorAll(".date")[0];
    let timestamp = Number(dateEle.innerHTML);
    let date = new Date(Number(dateEle.innerHTML));

    if (timestamp + (20 * 60000) < new Date().getTime()) {
        contest.remove();
        return;
    };

    const options = {
        //weekday: "short",
        year: "numeric",
        month: "2-digit",
        day: "numeric",
    };

    const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
    }

    let minutes = date.getMinutes();
    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    let dateString = `${date.toLocaleDateString(navigator.language, options)} ${date.toLocaleTimeString(navigator.language, timeOptions)}`;
    dateEle.innerHTML = dateString;

    let countdownEle = contest.querySelectorAll(".countDown")[0];

    if (timestamp < new Date().getTime()) {
        countdownEle.innerHTML = "Happening now!"
    } else {
        let x = setInterval(function() {

            let now = new Date().getTime();
          
            let distance = (timestamp + (20 * 60000)) - now;
            let showDistance = timestamp - now;
          
            let days = Math.floor(showDistance / (1000 * 60 * 60 * 24));
            let hours = Math.floor((showDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((showDistance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((showDistance % (1000 * 60)) / 1000);
          
            countdownEle.innerHTML = days + "d " + hours + "h "
            + minutes + "m " + seconds + "s ";
          
            if (distance < (20 * 60000)) {// if the contest started
                countdownEle.innerHTML = "Happening now!"
            }

            if (distance < 0) {
              clearInterval(x);
              contest.remove();
            }
        }, 1000);
    }
});

if (contestsBox.querySelectorAll(".contest").length <= 0) {
    document.getElementById("noContests").style.display = "flex";
    document.getElementById("announcementBanner").style.display = "block";
}


/*--- ALarm System ---*/
let alarms = [];

function alarmClick(timestamp) {
    if (!("Notification" in window)) {
        alert("Your browser does not support notifications!")
        return;
    }

    if (Notification.permission === "granted") {
        createAlarm(timestamp);
        return;
    } else {
        Notification.requestPermission().then(perm => {
            if (perm === "granted") {
                createAlarm(timestamp);
            } else {
                alert("You have to enable notifications for this website!");
            }
        })
    }
}

function createAlarm(timestamp) {
    let alarmbtn = document.getElementById(`alertcontest_${timestamp}`);
    
    if (alarms.includes(timestamp)) {
        alarms.splice(alarms.indexOf(timestamp), 1);
        alarmbtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#fefefe"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 5.5C14.7614 5.5 17 7.73858 17 10.5V12.7396C17 13.2294 17.1798 13.7022 17.5052 14.0683L18.7808 15.5035C19.6407 16.4708 18.954 18 17.6597 18H6.34025C5.04598 18 4.35927 16.4708 5.21913 15.5035L6.4948 14.0683C6.82022 13.7022 6.99998 13.2294 6.99998 12.7396L7 10.5C7 7.73858 9.23858 5.5 12 5.5ZM12 5.5V3M10.9999 21H12.9999" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;
        //alarmbtn.innerHTML = "NoNotify1"
        return;
    }

    let timeBetween = timestamp - Date.now();
    if (timeBetween <= 0) {
        alarmbtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#fefefe"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 5.5C14.7614 5.5 17 7.73858 17 10.5V12.7396C17 13.2294 17.1798 13.7022 17.5052 14.0683L18.7808 15.5035C19.6407 16.4708 18.954 18 17.6597 18H6.34025C5.04598 18 4.35927 16.4708 5.21913 15.5035L6.4948 14.0683C6.82022 13.7022 6.99998 13.2294 6.99998 12.7396L7 10.5C7 7.73858 9.23858 5.5 12 5.5ZM12 5.5V3M10.9999 21H12.9999" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;
        //alarmbtn.innerHTML = "NoNotify2"
        return;
    };

    alarms.push(timestamp);
    alarmbtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#fefefe"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12.0001 5.5C14.7615 5.5 17.0001 7.73858 17.0001 10.5V12.7396C17.0001 13.2294 17.1798 13.7022 17.5052 14.0683L18.7809 15.5035C19.6408 16.4708 18.9541 18 17.6598 18H6.34031C5.04604 18 4.35933 16.4708 5.2192 15.5035L6.49486 14.0683C6.82028 13.7022 7.00004 13.2294 7.00004 12.7396L7.00006 10.5C7.00006 7.73858 9.23864 5.5 12.0001 5.5ZM12.0001 5.5V3M3 11.0001C3 7.87966 4.58803 5.13015 7 3.51562M21 11.0001C21 7.87966 19.412 5.13015 17 3.51562M11 21H13" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;
    //alarmbtn.innerHTML = "Notify!!!"
    setTimeout(() => {
        if (!alarms.includes(timestamp)) return;

        let contest = document.getElementById(`contest_${timestamp}`);
        let notification = new Notification("Jacobs Contest is starting now!", {
            body: `${cropNames[contest.dataset.cropone]}, ${cropNames[contest.dataset.croptwo]} and ${cropNames[contest.dataset.cropthree]}`,
            icon: "./crops/9.png"
        });
        //alarmbtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#fefefe"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 5.5C14.7614 5.5 17 7.73858 17 10.5V12.7396C17 13.2294 17.1798 13.7022 17.5052 14.0683L18.7808 15.5035C19.6407 16.4708 18.954 18 17.6597 18H6.34025C5.04598 18 4.35927 16.4708 5.21913 15.5035L6.4948 14.0683C6.82022 13.7022 6.99998 13.2294 6.99998 12.7396L7 10.5C7 7.73858 9.23858 5.5 12 5.5ZM12 5.5V3M10.9999 21H12.9999" stroke="#fefefe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;
        alarmbtn.innerHTML = "NoNotify3"
    }, timeBetween)
}