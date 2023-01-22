/*--- loader ---*/
window.addEventListener("load", () => {
    const loader = document.querySelector(".loader");

    loader.classList.add("loader--hidden");

    loader.addEventListener("transitionend", () => {
        document.body.removeChild(loader);
    });
});

/*--- theme changer ---*/
function changeTheme(clickedEle) {
    let r = document.querySelector(':root');

    if (clickedEle.dataset.status === "dark") {
        clickedEle.getElementsByTagName("img")[0].style.filter = "invert(0%)";
        r.style.setProperty("--background-color", "#f5f5f5");
        r.style.setProperty("--font-color-wbg", "#111");
        clickedEle.dataset.status = "light";
    } else {
        clickedEle.getElementsByTagName("img")[0].style.filter = "invert(100%)";
        r.style.setProperty("--background-color", "#36393f");
        r.style.setProperty("--font-color-wbg", "#e0e0e0");
        clickedEle.dataset.status = "dark";
    }
}

/*--- modals ---*/
var closeBTN = document.getElementsByClassName("close")[0];

function toggleModal(modal_id) {
    const modal = document.getElementById(modal_id);
    if (modal.style.display === "none") {
        modal.style.display = "block";
    } else {
        modal.style.display = "none";
    }
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

if (contestsBox.querySelectorAll(".contest").length <= 0) {
    document.getElementById("noContests").style.display = "flex";
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