import './detail.css';
import './pages.css';
import './style.css';

const titleInput = document.getElementById('title');
const searchButton = document.getElementById('search');
const moviesContainer = document.getElementById('allMovies');
const pagesContainer = document.getElementById('pages');
const prevButton = document.getElementById("prev");
const backgroundElement = document.getElementById("background");
const API_KEY = process.env.API_KEY;

let history = [];
let currentPage = 1;
let totalPages = 0;
let currentTitle = "all";

function addHistory(type, title, page, id) {
    history.push({ type, title, page, id });
}

function goBackInHistory() {
    if (history.length < 2) return;
    history.pop();
    const last = history[history.length - 1];
    if (!last) return;

    if (last.type === 'detail') {
        getMovieByID(last.id);
    } else {
        moviesContainer.innerHTML = "";
        currentPage = last.page;
        searchMovies(last.title, (currentPage - 1) * 2 + 1);
        searchMovies(last.title, (currentPage - 1) * 2 + 2);
    }
}

function renderPageNumber(number) {
    pagesContainer.innerHTML += `
        <div class="number ${number === 0 ? "dot" : ""} ${number === currentPage ? "actual" : ""}" id="${number}">
            ${number !== 0 ? number : "..."}
        </div>
    `;
}

function renderPagination(allPages, currentPage) {
    pagesContainer.innerHTML = '';
    if (currentPage > 5) {
        renderPageNumber(1);
        renderPageNumber(0);
    }
    for (let i = currentPage - 4; i <= currentPage + 4; i++) {
        if (i > 0 && i <= allPages) {
            renderPageNumber(i);
        }
    }
    if (currentPage < allPages - 5) {
        renderPageNumber(0);
        renderPageNumber(allPages);
    }
}

function addPaginationListeners(paginationNumbers) {
    Array.from(paginationNumbers).forEach(paginationNumber => {
        if (!paginationNumber.classList.contains('dot')) {
            paginationNumber.addEventListener("click", () => {
                moviesContainer.innerHTML = "";
                currentPage = parseInt(paginationNumber.innerText);
                searchMovies(currentTitle, (currentPage - 1) * 2 + 1);
                searchMovies(currentTitle, (currentPage - 1) * 2 + 2);
                addHistory("all", currentTitle, currentPage, NaN);
            });
        }
    });
}

async function getMovies(query) {
    const response = await fetch(query);
    return await response.json();
}

async function getMovieByTitle(title, page) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';
    const query = `https://www.omdbapi.com/?s=${title}&page=${page}&apikey=${API_KEY}`;
    const movies = await getMovies(query);

    prevButton.className = history.length < 2 ? 'hide' : '';
    loadingIndicator.style.display = 'none';

    if (movies.Response === "True") {
        totalPages = Math.floor(Math.ceil(parseInt(movies.totalResults) / 10) / 2);
        movies.Search.forEach(showMovie);
        renderPagination(totalPages, currentPage);
        currentTitle = title;
        addPaginationListeners(document.getElementsByClassName("number"));
    } else {
        moviesContainer.innerHTML = `<div class='notFound'> "${title}" Movie not found!</div>`;
    }
}

async function getMovieByID(id) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';
    const query = `https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}&plot=full`;
    const movieDetails = await getMovies(query);

    prevButton.className = history.length < 2 ? 'hide' : '';
    loadingIndicator.style.display = 'none';
    showMovieDetails(movieDetails);
}

function showMovieDetails(details) {
    if (details.Poster) {
        backgroundElement.style.backgroundImage = `url('${details.Poster}')`;
    }
    pagesContainer.classList.add("bottom");
    if (details.Response === "True") {
        moviesContainer.innerHTML = `
            <div class="detail" id="${details.imdbID}">
                <div class="imageDetail">
                    <div class="rating">
                        ${details.imdbRating} <span class="material-symbols-sharp">star</span>
                    </div>
                    <img src="${details.Poster}" alt="${details.Title}">
                    <div class="overlap"></div>
                </div>
                <div class="infosDetail">
                    <div class="line"></div>
                    <div class="movieTitleDetail">
                        ${details.Title !== "N/A" ? details.Title : "Aucun(e)"}
                        <span class="genre">(${details.Genre})</span>
                    </div>
                    <div class="line"></div>
                    <div class="year bold">
                        Year: ${details.Year.length === 4 || details.Year.length === 9 ? details.Year : details.Year.slice(0, -1)}
                    </div>
                    <div class="line"></div>
                    <div class="actor bold">Actors: ${details.Actors}</div>
                    <div class="line"></div>
                    <div class="synopsisDetail" id="synopsis">
                        ${details.Plot !== "N/A" ? details.Plot : "Aucun(e)"}
                    </div>
                </div>
            </div>
        `;
    } else {
        moviesContainer.innerHTML = "No info found";
    }
}

function showMovie(movie) {
    pagesContainer.classList.remove("bottom");
    moviesContainer.innerHTML += `
        <div class="element">
            <div class="date">${movie.Type === "movie" ? "Movie" : "Series"}</div>
            <div class="error">Image not found</div>
            <div class="image">
                <div class="front" id="${movie.imdbID}"></div>
                <img src="${movie.Poster}" alt="">
            </div>
            <div class="infos">
                <div class="stars"></div>
                <div class="movieTitle">${movie.Title}</div>
            </div>
        </div>
    `;
}

async function searchMovies(title, page) {
    await getMovieByTitle(title, page);
    Array.from(document.getElementsByClassName("front")).forEach(element => {
        element.addEventListener("click", (e) => {
            addHistory("detail", title, page, e.currentTarget.id);
            getMovieByID(e.currentTarget.id);
        });
    });
}

searchButton.addEventListener("click", () => {
    moviesContainer.innerHTML = "";
    currentPage = 1;
    searchMovies(titleInput.value, (currentPage - 1) * 2 + 1);
    searchMovies(titleInput.value, (currentPage - 1) * 2 + 2);
    addHistory("all", titleInput.value, currentPage, NaN);
});

titleInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        moviesContainer.innerHTML = "";
        currentPage = 1;
        searchMovies(titleInput.value, (currentPage - 1) * 2 + 1);
        searchMovies(titleInput.value, (currentPage - 1) * 2 + 2);
        addHistory("all", titleInput.value, currentPage, NaN);
    }
});

prevButton.addEventListener("click", goBackInHistory);

// Initial load
addHistory("all", "all", 1, NaN);
searchMovies("all", 1);
searchMovies("all", 2);
