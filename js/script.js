const title = document.getElementById('title');
const search = document.getElementById('search');
const allMovies = document.getElementById('allMovies');
const pagesDOM = document.getElementById('pages');
let allPagesNumber;
let elements = document.getElementsByClassName("element");
let all = {};
let page = 6;
let pages = 0;

function pageNumber(number){
    pagesDOM.innerHTML = pagesDOM.innerHTML + "\n" + `
    <div class="number${number != 0 ? "" : " dot"}" id="${number}">
        ${number != 0 ? number : "..."}
    </div>    `
}

function createAllPageNumber(allPages, actualPage){
    if (actualPage > 5)
        pageNumber(0);
    for(let i = actualPage - 4; i < actualPage; i++){
        if (i > 0)
            pageNumber(i);
    }
    for(let i = actualPage; i <= actualPage + 4 && i <= allPages; i++){
        pageNumber(i);
    }
    if (actualPage < allPages - 5)
        pageNumber(0);
}

async function getMovieByTitle(title, actualPage){
    const query = "http://www.omdbapi.com/?s=" + title + "&page=" + actualPage + "&apikey=aca58a81"
    const response = await fetch(query);
    const movies = await response.json();
    if(movies.Response == "True"){
        allMovies.innerHTML = "";
        pages = Math.ceil(parseInt(movies.totalResults) / 10);
        alert("Movies : " + movies.totalResults + "; Pages : " + pages);
        movies.Search.forEach(infos => {
            showMovie(infos);
        });
        createAllPageNumber(pages, actualPage);
        allPagesNumber = document.getElementsByClassName("number");
    }else{
        allMovies.innerHTML = "<div class='notFound'> Movie not found!</div>";
    }
};

async function getMovieByID(ID){
    const query = "http://www.omdbapi.com/?i=" + ID + "&apikey=aca58a81"
    const response = await fetch(query);
    const movies = await response.json();
    showMovieDetails(movies);
};

function showMovieDetails(infos){
    if(infos.Response == "True"){
        allMovies.innerHTML = `
        <div class="detail" id="${infos.imdbID}">
            <div class="image">
                <img src="${infos.Poster}" alt="">
            </div>
            <div class="infos">
                <div class="stars">

                </div>
                <div class="movieTitle">
                    <b> Titre : </b> ${infos.Title != "N/A" ? infos.Title : "Aucun(e)"}
                </div>
                <div class="synopsis" id="synopsis">
                    <b> Synopsis : </b> ${infos.Plot != "N/A" ? infos.Plot : "Aucun(e)"}
                </div>
            </div>
        </div>
    `;
    }else{
        allMovies.innerHTML = "No infos found";
    }
}

function showMovie(infos){
    allMovies.innerHTML = allMovies.innerHTML + `
        <div class="element" id="${infos.imdbID}">
            <div class="image">
                <img src="${infos.Poster}" alt="">
            </div>
            <div class="infos">
                <div class="stars">

                </div>
                <div class="movieTitle">
                    ${infos.Title}
                </div>
            </div>
        </div>
    `
}

async function searchMovies(movieTitle){
    getMovieByTitle(movieTitle, page).then(() => {
        elements = document.getElementsByClassName("element");
        for(let i = 0; i < elements.length; i++) {
            elements[i].addEventListener("click", (e) =>{
                console.log(e.currentTarget.id);
                getMovieByID(e.currentTarget.id);
            });
        };
    });
}

search.addEventListener("click", (e) => {
    searchMovies(title.value);
});

title.addEventListener("keypress", (e) => {
    if(e.key == "Enter")
        searchMovies(title.value);
});
searchMovies("all");
