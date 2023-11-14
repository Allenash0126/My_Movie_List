const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
let filteredMovies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const tableMode = document.querySelector('#tableMode')
const changeToListMode = document.querySelector('#changeToListMode')
const changeToPictureMode = document.querySelector('#changeToPictureMode')

const MOVIES_PER_PAGE = 12

// 渲染為Picture模式
function renderPictureMode(data) {
  let rawHTML = ``
  data.forEach((item) => {
    rawHTML += `
  <div class="col-sm-2">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-Modal" data-id="${item.id
      }">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
  `
  })
  dataPanel.innerHTML = rawHTML
}

// 渲染為Table模式
function renderTableMode(data) {
  let rawHTML = `
      <thead>
      <tr>
        <th scope="col"></th>
        <th scope="col"></th>
      </tr>
    </thead>
    <tbody>
  `
  data.forEach(item => {
    rawHTML += `
      <tr>
        <th scope="row">${item.title}
        </th>
        <td>
         <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"data-bs-target="#movie-Modal" data-id="${item.id}">More</button>
        </td>
        <td>
         <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </td>
      </tr>
    `
  })
  rawHTML += `
  </tbody>
  `
  tableMode.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ``
  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#Movie-Modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster"
      class="imag-fluid">`
    modalDate.innerHTML = 'release date: ' + data.release_date
    modalDescription.innerText = data.description
  })
}

function showTableModal(id) {
  const modalTitle = document.querySelector('#Movie-Modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster"
      class="imag-fluid">`
    modalDate.innerHTML = 'release date: ' + data.release_date
    modalDescription.innerText = data.description
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  if (list.some(movie => movie.id === id)) {
    return alert('此電影已在收藏清單中！')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 檢查現在LocalStorage是什麼狀態，是否為Table mode
function checkIfTableMode() {
  if (localStorage.getItem('mode') === 'table') {
    return true
  }
  else {
    return false
  }
}

// 點擊在（Picture）Mode上的more,來呈現Modal
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
    showTableModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 點擊在（Table）Mode上的more,來呈現Modal
tableMode.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showTableModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  if (checkIfTableMode()) {
    renderTableMode(getMoviesByPage(page))
    localStorage.setItem('pageInStorage', page)
  }
  else {
    renderPictureMode(getMoviesByPage(page))
    localStorage.setItem('pageInStorage', page)
  }
})


searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  const keyword = searchInput.value.trim().toLowerCase()
  event.preventDefault()

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keywords: ' + keyword)
  }

  renderPaginator(filteredMovies.length)

  if (checkIfTableMode()) {
    renderTableMode(getMoviesByPage(1))
  }
  else {
    renderPictureMode(getMoviesByPage(1))
  }
})

// 模式監聽-List
changeToListMode.addEventListener('click', function onListModeClicked() {
  if (checkIfTableMode()) {
    return
  }
  else {
    localStorage.setItem('mode', 'table')
    let rawHTML = []
    renderPictureMode(rawHTML)
    renderTableMode(getMoviesByPage(localStorage.getItem('pageInStorage')))
  }
})

// 模式監聽-Picture
changeToPictureMode.addEventListener('click', function onPictureModeClicked() {
  if (checkIfTableMode()) {
    localStorage.setItem('mode', 'picture')
    let rawHTML = []
    renderPictureMode(getMoviesByPage(localStorage.getItem('pageInStorage')))
    renderTableMode(rawHTML)
  }
  else {
    return
  }
})

// 渲染整個電影清單
axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderPictureMode(getMoviesByPage(1))
  localStorage.setItem('mode', 'picture')
  localStorage.setItem('pageInStorage', '1')
})
