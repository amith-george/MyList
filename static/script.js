document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const viewListsBtn = document.getElementById('view-lists');
    const createListBtn = document.getElementById('create-list');
    const searchBtn = document.getElementById('search-btn');
    const loginBtn = document.getElementById('login');
    const registerBtn = document.getElementById('register');

    const listsSection = document.getElementById('lists-section');
    const createListSection = document.getElementById('create-list-section');
    const movieSearchSection = document.getElementById('movie-search-section');
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');

    // Debugging: Log elements to see if they are null
    console.log('viewListsBtn:', viewListsBtn);
    console.log('createListBtn:', createListBtn);
    console.log('searchBtn:', searchBtn);
    console.log('loginBtn:', loginBtn);
    console.log('registerBtn:', registerBtn);
    console.log('listsSection:', listsSection);
    console.log('createListSection:', createListSection);
    console.log('movieSearchSection:', movieSearchSection);
    console.log('loginSection:', loginSection);
    console.log('registerSection:', registerSection);

    // Toggle sections
    function showSection(sectionToShow) {
        const allSections = document.querySelectorAll('.content-section');
        allSections.forEach(section => section.classList.add('hidden'));
        sectionToShow.classList.remove('hidden');
    }

    // Ensure buttons exist before adding event listeners
    if (viewListsBtn) {
        viewListsBtn.addEventListener('click', () => showSection(listsSection));
    }

    if (createListBtn) {
        createListBtn.addEventListener('click', () => showSection(createListSection));
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', () => showSection(loginSection));
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', () => showSection(registerSection));
    }

    // TMDb Movie Search
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const movieSearchInput = document.getElementById('movie-search').value;
            fetchMovies(movieSearchInput);
        });
    }

    function fetchMovies(query) {
        const apiKey = 'cc2c06d92a4ccae8762ae4a5a4f38ac5'; // Replace with your TMDb API key
        fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => displayMovies(data.results))
            .catch(error => {
                console.error('Error fetching movies:', error);
                const resultsDiv = document.getElementById('movie-results');
                resultsDiv.innerHTML = '<p>Error fetching movies. Please try again later.</p>';
            });
    }

    function displayMovies(results) {
        const resultsDiv = document.getElementById('movie-results');
        resultsDiv.innerHTML = '';
        if (results && results.length > 0) {
            results.forEach(item => {
                const title = item.media_type === 'movie' ? item.title : item.name;
                const year = item.media_type === 'movie' ? item.release_date : item.first_air_date;
                const posterPath = item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : 'https://via.placeholder.com/150';

                const movieDiv = document.createElement('div');
                movieDiv.innerHTML = `
                    <h3>${title} (${year ? year.slice(0, 4) : 'N/A'})</h3>
                    <img src="${posterPath}" alt="${title}">
                    <button onclick="addToList('${title}')">Add to List</button>
                `;
                resultsDiv.appendChild(movieDiv);
            });
        } else {
            resultsDiv.innerHTML = '<p>No movies or shows found.</p>';
        }
    }

    // Create List event
    const createListForm = document.getElementById('create-list-form');
    if (createListForm) {
        createListForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const listName = document.getElementById('list-name').value;
            const listDescription = document.getElementById('list-description').value;

            // Check for duplicate names before adding
            const existingLists = document.querySelectorAll('#lists-container h3');
            const isDuplicate = Array.from(existingLists).some(existingList => existingList.textContent === listName);

            if (isDuplicate) {
                alert('A list with this name already exists.');
            } else {
                addList(listName, listDescription);
            }
        });
    }

    function addList(name, description) {
        const listsContainer = document.getElementById('lists-container');
        const listDiv = document.createElement('div');
        listDiv.innerHTML = `
            <h3>${name}</h3>
            <p>${description}</p>
            <button>View List</button>
        `;
        listsContainer.appendChild(listDiv);

        // Add functionality to save the list to your backend here
    }


    
});



