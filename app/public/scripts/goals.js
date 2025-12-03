function buildGoalPage (page) {
    let jsonPath = ""
    if (page == 1){
        jsonPath = "json/goal1.json"
    }
    else if (page == 2){
        jsonPath = "json/goal2.json"
    }
    else if (page == 3){
        jsonPath = "json/goal3.json"
    }

    let heading = document.getElementById("heading");
    let issue = document.getElementById("issue");
    let goal = document.getElementById("goal");

    fetch (jsonPath)
        .then(response => response.json())
        .then(responeData =>{

            //const DATA = JSON.parse(responeData);

            heading.textContent = responeData.title;

            issue.firstElementChild.src = responeData.issue.img;
            issue.firstElementChild.alt = "issue";
            issue.firstElementChild.width = 500;
            issue.firstElementChild.height = 300;


            issue.firstElementChild.nextElementSibling.textContent = responeData.issue.para;

            goal.firstElementChild.textContent = responeData.goal.para;

            goal.firstElementChild.nextElementSibling.src = responeData.goal.img;
            goal.firstElementChild.nextElementSibling.alt = "goal";
            goal.firstElementChild.nextElementSibling.width = 500;
            goal.firstElementChild.nextElementSibling.height = 300;



        })
}

if (document.querySelector('#goal1')){
    buildGoalPage(1)
}
else if (document.querySelector('#goal2')){
    buildGoalPage(2)
}
else if (document.querySelector('#goal3')){
    buildGoalPage(3)
}