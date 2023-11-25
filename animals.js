document.addEventListener('DOMContentLoaded', function () {
    var apiKey = 'OEqraaP4K2Yy1cJb6Dwpaj8vH8JNA9J6vvr02z3pNLCTsvbzbX';
    var apiSecret = 'dyofNYacLhn7wIRljelf4HuSsiHwPUsWuCKxuM8o';

    function getAccessToken(apiKey, apiSecret) {
        var tokenUrl = 'https://api.petfinder.com/v2/oauth2/token';
        var tokenData = new URLSearchParams();
        tokenData.append('grant_type', 'client_credentials');
        tokenData.append('client_id', apiKey);
        tokenData.append('client_secret', apiSecret);

        fetch(tokenUrl, {
            method: 'POST',
            body: tokenData,
        })
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                throw Error('Token request failed with status: ' + response.status);
            }
        })
        .then(function (tokenData) {
            var accessToken = tokenData.access_token;
            searchWithAccessToken(accessToken);
        })
        .catch(function (error) {
            console.error('Error obtaining access token:', error);
        });
    }

    function searchWithAccessToken(accessToken) {
        function searchButtonClick(event) {
            event.preventDefault();

            var name = document.getElementById('name').value;
            var age = document.getElementById('age').value;
            var gender = document.getElementById('gender').value;
            var breed = document.getElementById('breed').value;
            var organization = document.getElementById('organization').value;

            if (!name && !age && !gender && !breed && !organization) {
                alert('Please fill in at least one field for your search.');
                return;
            }

            var apiUrl = 'https://api.petfinder.com/v2/animals?';
            var queryParameters = [];

            if (name) {
                queryParameters.push('name=' + name);
            }
            if (age) {
                queryParameters.push('age=' + age);
            }
            if (gender) {
                queryParameters.push('gender=' + gender);
            }
            if (breed) {
                queryParameters.push('breed=' + breed);
            }
            if (organization) {
                queryParameters.push('organization=' + organization);
            }

            apiUrl += queryParameters.join('&');

            var headers = new Headers({
                'Authorization': 'Bearer ' + accessToken
            });

            var request = new Request(apiUrl, {
                method: 'GET',
                headers: headers
            });

            fetch(request)
                .then(function (response) {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Request failed with status: ' + response.status);
                    }
                })
                .then(function (data) {
                    var animalsWithPhotos = data.animals.filter(function (animal) {
                        return animal.photos.length > 0;
                    });

                    shuffleArray(animalsWithPhotos);

                    for (var i = 0; i < 3; i++) {
                        if (i < animalsWithPhotos.length) {
                            var animalData = animalsWithPhotos[i];
                            updateAnimalImage('animal' + (i + 1) + 'Img', animalData.photos[0].small);
                            updateAnimalText('animal' + (i + 1), animalData);
                            updateAnimalCompatibility('animal' + (i + 1), animalData);
                        } else {
                            clearAnimalContent('animal' + (i + 1));
                        }
                    }
                })
                .catch(function (error) {
                    console.error('An error occurred:', error);
                });
        }

        function updateAnimalImage(elementId, imageUrl) {
            var element = document.getElementById(elementId);
            if (element) {
                element.src = imageUrl;
            }
        }

        function updateAnimalText(animalNumber, animalData) {
            updateElementHTML(animalNumber + 'Name', '<a href="' + animalData.url + '" target="_blank">' + animalData.name + '</a>');
            updateElementText(animalNumber + 'Age', animalData.age);
            updateElementText(animalNumber + 'Gender', animalData.gender);
            updateElementText(animalNumber + 'Breed', animalData.breeds.primary);
            updateElementText(animalNumber + 'Organization', animalData.organization_id);
        }

        function updateElementText(elementId, value) {
            var element = document.getElementById(elementId);
            if (element) {
                element.textContent = value;
            }
        }

        function updateElementHTML(elementId, value) {
            var element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = value;
            }
        }

        function updateAnimalCompatibility(animalNumber, animalData) {
            updateCompatibilityIcon(animalNumber + 'gwd', animalData.good_with_dogs);
            updateCompatibilityIcon(animalNumber + 'gwc', animalData.good_with_cats);
        }

        function updateCompatibilityIcon(animalData, isCompatible) {
            var element = document.getElementById(animalData);
            if (element) {
                element.textContent = isCompatible ? '✓' : '✗';
            }
        }

        function clearAnimalContent(animalNumber) {
            updateAnimalImage(animalNumber + 'Img', '');
            updateAnimalText(animalNumber, {
                name: '',
                age: '',
                gender: '',
                breeds: { primary: '' },
                organizations: { id: '', name: '' }
            });
        }

        function shuffleArray(array) {
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }

        var searchButton = document.getElementById('searchButton');

        if (searchButton) {
            searchButton.addEventListener('click', searchButtonClick);
        }
    }

    getAccessToken(apiKey, apiSecret);
});
