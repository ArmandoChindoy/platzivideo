// console.log('hola mundo!');
// const noCambia = "Leonidas";

// let cambia = "@LeonidasEsteban"

// function cambiarNombre(nuevoNombre) {
//     cambia = nuevoNombre
// }


// const getUserAll = new Promise(function(sucess, fail) {
//     //llamar a un api
//     setTimeout(() => {
//         sucess('se acabo el tiempo all');
//     }, 5000);

// })
// const getUser = new Promise(function(sucess, fail) {
//     //llamar a un api
//     setTimeout(() => {
//         sucess('se acabo el tiempo');
//     }, 3000);

// })

// getUser.then(function() {
//     console.log('Todo esta bien');
// }).catch(() => {
//     console.log('Todo mal');
// })


// Promise.all([
//     getUserAll,
//     getUser
// ]).then((result) => {
//     console.log(result)
// }).catch((err) => {
//     console.log(err)
// });


// $.ajax('https://randomuser.me/api/', {
//     method: 'GET',
//     success: (data) => {
//         console.log(data);
//     },
//     error: (error) => {
//         console.log(error)
//     }
// });


// fetch('https://randomuser.me/api/')
//     .then((response) => {
//         // console.log(response);
//         return response.json();
//     })
//     .then((user) => {
//         console.log('User: ', user.results[0].name.first);
//     }).catch(() => {
//         console.log('Algo fallo');
//     });


// const getMovies = new Promise((succes, fail) => { fetch('https://yts.mx/api/v2/list_movies.json?genre=action') }).then((data) => console.log(data)).catch()

// console.log(getMovies);

(async function loadMovies() {

    async function getData(URL) {
        const response = await fetch(URL);
        const data = await response.json();
        if (data.data.movie_count > 0) {
            return data;
        }
        throw new Error('No se encontro ningun resultado');
    }
    async function getDataUser(URL) {
        const response = await fetch(URL);
        const data = await response.json();
        if (data.results.length > 0) {
            return data.results;
        }
        throw new Error('No se encontro ningun resultado');
    }
    const $home = document.getElementById('home');
    const $form = document.getElementById('form');
    const $featuringContainer = document.getElementById('featuring');

    function setAttributes($element, attributes) {
        for (const attribute in attributes) {
            $element.setAttribute(attribute, attributes[attribute]);
        }
    }

    const BASE_APi = 'https://yts.mx/api/v2/'

    function featuringTemplate(movie) {
        return (`<div class="featuring">
        <div class="featuring-image">
            <img src="${movie.medium_cover_image}" height="100" alt="">
        </div>
        <div class="featuring-content">
            <p class="featuring-title">Pelicula encontrada</p>
            <p class="featuring-album">${movie.title}</p>
        </div>
    </div>`)
    }

    $form.addEventListener('submit', async(event) => {
        event.preventDefault();
        $home.classList.add('search-active');
        const $loader = document.createElement('img');
        setAttributes($loader, {
            src: 'src/images/loader.gif',
            height: 50,
            width: 50
        })
        $featuringContainer.append($loader);
        const data = new FormData($form);
        try {
            const {
                data: {
                    movies: movies
                }
            } = await getData(`${BASE_APi}list_movies.json?limit=1&query_term=${data.get('name')}`)
            const HTMLString = featuringTemplate(movies[0]);

            $featuringContainer.innerHTML = HTMLString;
        } catch (error) {
            $loader.remove();
            $home.classList.remove('search-active')
            swal({
                title: 'Error',
                text: error.message,
                icon: 'error'

            });

        }
    })



    const $actionContainer = document.querySelector('#action');
    const $dramaContainer = document.querySelector('#drama');
    const $animationContainer = document.querySelector('#animation');

    const $modal = document.getElementById('modal');
    const $overlay = document.getElementById('overlay');
    const $hideModal = document.getElementById('hide-modal');

    const $modalTitle = $modal.querySelector('h1');
    const $modalImage = $modal.querySelector('img');
    const $modalDescription = $modal.querySelector('p');

    function findById(id, list) {
        return list.find(movie => movie.id === parseInt(id, 10));
    }

    function findMovie(id, category) {
        switch (category) {
            case 'action':
                return findById(id, actionMovies);
                break;
            case 'drama':
                return findById(id, dramaMovies);
                break;
            default:
                return findById(id, animationMovies);
                break;
        }
    }

    function showModal(element) {
        $overlay.classList.add('active');
        $modal.style.animation = 'modalIn .8s forwards';
        const id = element.dataset.id;
        const category = element.dataset.category;
        const data = findMovie(id, category);
        $modalTitle.textContent = data.title;
        $modalImage.setAttribute('src', data.medium_cover_image);
        $modalDescription.textContent = data.description_full;

    }

    function hideModal() {
        $overlay.classList.remove('active');
        $modal.style.animation = 'modalOut .8s forwards';
    }

    $hideModal.addEventListener('click', hideModal);



    function createTemplate(HTMLString) {
        const html = document.implementation.createHTMLDocument();
        html.body.innerHTML = HTMLString;
        return html.body.children[0];
    }

    function videoTemplate(movie, category) {
        return (`<div class="primaryPlaylistItem" data-id="${movie.id}" data-category="${category}">
      <div class="primaryPlaylistItem-image">
        <img src="${movie.medium_cover_image}">
      </div>
      <h4 class="primaryPlaylistItem-title">
        ${movie.title}
      </h4>
    </div>`)
    }

    function addEventClick(element) {
        element.addEventListener('click', () => {
            showModal(element);
        });
    }

    function renderMovieList(moviesList, container, category) {
        container.children[0].remove();
        moviesList.forEach(movie => {
            const HTMLString = videoTemplate(movie, category);
            const movieElement = createTemplate(HTMLString);
            const image = movieElement.querySelector('img')
            image.addEventListener('load', (event) => {
                event.srcElement.classList.add('fadeIn');
            })
            addEventClick(movieElement);
            container.append(movieElement);
        });
    }

    async function cacheExistMovies(category) {
        const listNAme = `${category}List`;
        const cacheList = this.localStorage.getItem(listNAme);
        if (cacheList) {
            return JSON.parse(cacheList);
        }
        const { data: { movies: data } } = await getData(`${BASE_APi}list_movies.json?genre=${category}`);
        this.localStorage.setItem(listNAme, JSON.stringify(data));

        return data;
    }

    const actionMovies = await cacheExistMovies('action');
    renderMovieList(actionMovies, $actionContainer, 'action');
    const dramaMovies = await cacheExistMovies('drama');
    renderMovieList(dramaMovies, $dramaContainer, 'drama');
    const animationMovies = await cacheExistMovies('animation');
    renderMovieList(animationMovies, $animationContainer, 'animation');




    const BASE_API_RANDOM_USER = 'https://randomuser.me/api/?results=8';

    const $friendListContainer = document.getElementById('playlistFriends');

    function friendListItemTemplate(friend) {
        return `
        <li class="playlistFriends-item" id="playlistFriends-item">
                            <a href="#">
                                <img src="${friend.picture.thumbnail}" alt="echame la culpa" />
                                <span>${friend.name.first} ${friend.name.last}</span>
                            </a>
                        </li>
                        `
    }

    function renderFriendList(friendList, container) {
        friendList.forEach(element => {
            const friendHTMLString = friendListItemTemplate(element);
            const friendTemplate = createTemplate(friendHTMLString);
            const friendImage = document.querySelector('img');
            container.append(friendTemplate)
            friendImage.addEventListener('load', () => friendImage.classList.add('fadeIn'));
        });
    }

    const friendList = await getDataUser(`${BASE_API_RANDOM_USER}`);
    renderFriendList(friendList, $friendListContainer);
})()