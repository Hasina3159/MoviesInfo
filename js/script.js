const title = document.getElementById('title');
const search = document.getElementById('search');
const allMovies = document.getElementById('allMovies');
const pagesDOM = document.getElementById('pages');
const API_KEY = "aca58a81";
const prev = document.getElementById("prev");
const background = document.getElementById("background");
let history = [];
let elements = document.getElementsByClassName("front");
let all = {};
let page = 1;
let pages = 0;
let actualTitle = "all";

function addHistory(type, title, pageValue, id){
	history.push(
		{
			type: type,
			title: title,
			page: pageValue,
			id: id
		}
	)
}

function previousHistory(history){
	if (history.length == 1){
		return ;
	}
	history.pop();
	let last = history[history.length - 1];
	if (last == undefined){
		return ;
	}
	if (last.type == 'detail'){
		getMovieByID(last.id);
	}
	else{
		allMovies.innerHTML = ""
		page = last.page;
		searchMovies(last.title, (page - 1) * 2 + 1);
		searchMovies(last.title, (page - 1) * 2 + 2);
	}
}

function pageNumber(number){
	pagesDOM.innerHTML = pagesDOM.innerHTML + "\n" + `
	<div class="number ${number != 0 ? "" : "dot"} ${number == page ? "actual" : ""}" id="${number}">
		${number != 0 ? number : "..."}
	</div>    `
}

function createAllPageNumber(allPages, actualPage){
	pagesDOM.innerHTML = '';
	if (actualPage > 5){
		pageNumber(1);
		pageNumber(0);

	}
	for(let i = actualPage - 4; i <= parseInt(actualPage) + 4; i++){
		if (i > 0 && i <= allPages){
			pageNumber(i);
		}
	}
	if (actualPage < allPages - 5)
	{
		pageNumber(0);
		pageNumber(allPages);

	}
}

function listenPagesNumber(allPagesNumber){
	for(let i = 0; i < allPagesNumber.length; i++) {
		if (!allPagesNumber[i].classList.contains('dot'))
			allPagesNumber[i].addEventListener("click", (e) =>{
				allMovies.innerHTML = "";
				page = parseInt(allPagesNumber[i].innerText);
				searchMovies(actualTitle, (page - 1) * 2 + 1);
				searchMovies(actualTitle, (page - 1) * 2 + 2);
				addHistory("all", actualTitle, page, NaN);
			});
	};
}

async function getMovieByTitle(title, actualPage){
	const loadingIndicator = document.getElementById('loadingIndicator');
	loadingIndicator.style.display = 'block';
	const query = `https://www.omdbapi.com/?s=${title}&page=${actualPage}&apikey=${API_KEY}`
	const response = await fetch(query);
	const movies = await response.json();

	if (history.length < 2)
		prev.className = 'hide';
	else
		prev.className = '';
	console.log(history);
	loadingIndicator.style.display = 'none';
	if(movies.Response == "True"){
		pages = Math.floor(Math.ceil(parseInt(movies.totalResults) / 10) / 2);
		movies.Search.forEach(infos => {
			showMovie(infos);
		});
		let actual = page;
		createAllPageNumber(pages, actual);
		actualTitle = title;
		let allPagesNumber = document.getElementsByClassName("number");
		listenPagesNumber(allPagesNumber);

	}else{
		allMovies.innerHTML = `<div class='notFound'> "${title}" Movie not found!</div>`;
	}
};

/*async function getMovie(title, page){
	
}*/

async function getMovieByID(ID){
	const loadingIndicator = document.getElementById('loadingIndicator');
	loadingIndicator.style.display = 'block';
	const query = `https://www.omdbapi.com/?i=${ID}&apikey=${API_KEY}&plot=full`;
	const response = await fetch(query);
	const movies = await response.json();

	if (history.length < 2)
		prev.className = 'hide';
	else
		prev.className = '';
	loadingIndicator.style.display = 'none';
	showMovieDetails(movies);
};

function showMovieDetails(infos){
	if (infos.Poster){
		background.style.backgroundImage = "url('" + infos.Poster + "')";
	}
	pagesDOM.classList.add("bottom");
	if(infos.Response == "True"){
		allMovies.innerHTML = `
		<div class="detail" id="${infos.imdbID}" id="mamamody">
			<div class="imageDetail">
				<div class="rating">
					${infos.imdbRating} <span class="material-symbols-sharp">
					star
					</span>
				</div>
				<img src="${infos.Poster}" alt="${infos.Title}">
				<div class="overlap"></div>

			</div>

			<div class="infosDetail">
				<div class="line"></div>
				<div class="movieTitleDetail">
					${infos.Title != "N/A" ? infos.Title : "Aucun(e)"}
					<span class="genre">
						(${infos.Genre})
					</span>
				</div>
				<div class="line"></div>
				
				<div class="year bold">
					Year : ${infos.Year.length == 4 || infos.Year.length == 9 ? infos.Year : infos.Year.slice(0, -1)}
				</div>
				<div class="line"></div>
				<div class="actor bold">
					Actors : ${infos.Actors}
				</div>
				<div class="line"></div>

				<div class="synopsisDetail" id="synopsis">
					${infos.Plot != "N/A" ? infos.Plot : "Aucun(e)"}
				</div>
			</div>
		</div>
	`;
	}else{
		allMovies.innerHTML = "No infos found";
	}
	console.log(history);
}

function showMovie(infos){
	pagesDOM.classList.remove("bottom");
	allMovies.innerHTML = allMovies.innerHTML + `
		<div class="element">
			<div class="date">
				${infos.Type == "movie" ? "Movie" : "Series"}
			</div>
			<div class="error">
				Image not found
			</div>
			
			<div class="image">
				<div class="front" id="${infos.imdbID}"></div>
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

async function searchMovies(movieTitle, actualPage){
	getMovieByTitle(movieTitle, actualPage).then(() => {
		elements = document.getElementsByClassName("front");
		for(let i = 0; i < elements.length; i++) {
			elements[i].addEventListener("click", (e) =>{
				addHistory("detail", movieTitle, actualPage, e.currentTarget.id);
				getMovieByID(e.currentTarget.id);
			});
		};
	});
}

search.addEventListener("click", (e) => {
	allMovies.innerHTML = "";
	page = 1;
	searchMovies(title.value, (page - 1) * 2 + 1);
	searchMovies(title.value, (page - 1) * 2 + 2);
	addHistory("all", title.value, page, NaN);
});

title.addEventListener("keypress", (e) => {
	if(e.key == "Enter"){
		allMovies.innerHTML = "";
		page = 1;
		searchMovies(title.value, (page - 1) * 2 + 1);
		searchMovies(title.value, (page - 1) * 2 + 2);
		addHistory("all", title.value, page, NaN);
	}
});

prev.addEventListener("click", (e) => {
	previousHistory(history);
});

addHistory("all", "all", 1, NaN);
searchMovies("all", 1);
searchMovies("all", 2);
