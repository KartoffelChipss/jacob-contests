window.addEventListener("load", () => {
    const loader = document.querySelector(".loader");

    loader.classList.add("loader--hidden");

    loader.addEventListener("transitionend", () => {
        document.body.removeChild(loader);
    });
});

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
    console.log(Date.now())
    let date = new Date(Number(dateEle.innerHTML));

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
});