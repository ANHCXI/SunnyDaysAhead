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
                throw new Error('Token request failed with status: ' + response.status);
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
        function searchButtonClick() {
            var name = document.getElementById('name').value;
            var age = document.getElementById('age').value;
            var gender = document.getElementById('gender').value;
            var breed = document.getElementById('breed').value;

            if (!name && !age && !gender && !breed) {
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

                    console.log(data);
                })
                .catch(function (error) {
                    console.error('An error occurred:', error);
                });
        }

        var searchButton = document.getElementById('searchButton');

        if (searchButton) {
            searchButton.addEventListener('click', searchButtonClick);
        }
    }

    getAccessToken(apiKey, apiSecret);
});
