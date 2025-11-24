let activeLang = document.getElementById("en");

const listItems = document.querySelectorAll(".language li");

listItems.forEach((element) => {
    element.addEventListener("click", () => {

        activeLang.removeAttribute('class');
        element.setAttribute('class', 'active');
        activeLang = element;

    });
});