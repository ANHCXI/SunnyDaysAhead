document.addEventListener('DOMContentLoaded', function () {
    var apiKey = 'Put API Key here.';
    var apiSecret = 'Put Secret Key here.';

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
            var zip = document.getElementById('zip').value;
        
            var queryParameters = [];
        
            if (!name && !age && !gender && !breed && !zip) {
                alert('Please fill in at least one field for your search.');
                return;
            }
        
            var alphanumericRegex = /^[a-zA-Z0-9\s]+$/;
        
            if (name && !alphanumericRegex.test(name)) {
                alert('Please enter a valid name with only letters and numbers.');
                return;
            }
        
            if (zip && !/^\d{5}$/.test(zip)) {
                alert('Please enter a valid 5-digit zip code.');
                return;
            }
        
            var apiUrl = 'https://api.petfinder.com/v2/animals?';
        
            if (name) {
                queryParameters.push('name=' + encodeURIComponent(name));
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
        
            if (zip) {
                queryParameters.push('location=' + encodeURIComponent(zip));
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
                            updateAnimalDetails('animal' + (i + 1), animalData, accessToken);
                        } else {
                            clearAnimalContent('animal' + (i + 1));
                        }
                    }
                })
                .catch(function (error) {
                    console.error('An error occurred:', error);
                });
        }

        function updateAnimalDetails(animalNumber, animalData, accessToken) {
            getOrganizationName(animalData.organization_id, accessToken)
                .then(function (organizationName) {
                    animalData.organization_name = organizationName;
                    updateAnimalImage(animalNumber + 'Img', animalData.photos[0].small);
                    updateAnimalText(animalNumber, animalData);
                })
                .catch(function (error) {
                    console.error('Error getting organization name:', error);
                });
        }

        function getOrganizationName(organizationId, accessToken) {
            var organizationUrl = 'https://api.petfinder.com/v2/organizations/' + organizationId;

            var headers = new Headers({
                'Authorization': 'Bearer ' + accessToken
            });

            var request = new Request(organizationUrl, {
                method: 'GET',
                headers: headers
            });

            return fetch(request)
                .then(function (response) {
                    console.log('Organization API Response:', response);
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Request failed with status: ' + response.status);
                    }
                })
                .then(function (data) {
                    console.log('Organization Data:', data);
                    return data.organization ? data.organization.name : 'Unknown Organization';
                })
                .catch(function (error) {
                    console.error('Error getting organization name:', error);
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
            updateElementText(animalNumber + 'Organization', animalData.organization_name);
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