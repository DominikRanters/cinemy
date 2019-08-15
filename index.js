const countDownDate = new Date("08 15, 2019 0:00:00").getTime();
const loseText = 'Auslosung in';
const buttontext = 'ICH bin dabei!';
const telNumber = 'tel:1234';
const endTimer = 'vorbei!';
let $button_teilnahme, $button_finished, $button_quest1, $button_quest2, $button_route, $button_call;
let $timer_headline, $greeting;
let distance, now;


class Tapproject {


    constructor() {


        'use strict';
        this._intVar();
        this._EventListener();

        this._isQuizDone();
        this._mobile();
        this._displayTimer();
        this._timer();


        if (!window.location.origin) { //if you need the service worker in an iframe you have to change the origin
            window.location.origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        }
        window.addEventListener('load', function() { //this function loads automatically the newest version
            window.applicationCache.addEventListener('updateready', function() {
                if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
                    window.location.reload();
                }
            }, false);
        }, false);

        if ('serviceWorker' in navigator) { //checks if the service worker is possible in the browser
            navigator.serviceWorker.register('sw.js'); //register the sw.js (sw.js must be in the same file as index.js)
        }

    };

    /// INIT
    _intVar() {
        $button_teilnahme = document.querySelector(".button.teilnahme");
        $button_finished = document.querySelector('.button.finished');
        $button_quest1 = document.querySelector('.button.quest1');
        $button_quest2 = document.querySelector('.button.quest2');
        $button_route = document.querySelector('.button.route');
        $button_call = document.querySelector('.button.call')

        $timer_headline = document.querySelector('.timer.headline');
        $greeting = document.querySelector('#greeting');
    }

    _EventListener() {
        $button_teilnahme.addEventListener("click", this._start);
        $button_finished.addEventListener('click', this._finishdedQuiz)
        $button_quest1.addEventListener('click', () => this._nextSide('.content__card.page1', '.content__card.page2'));
        $button_quest2.addEventListener('click', () => this._nextSide('.content__card.page2', '.content__card.page3'));
        $button_route.addEventListener('click', this._route);
        $button_call.addEventListener('click', this._call)
    }

    async _start() {
        chayns.addAccessTokenChangeListener(() => {
            console.log('login successful');
            this._nextSide('.tapp.page1', '.tapp.page2')
            this._isQuizDone();
        });


        await chayns.login();


    }

    _greeting() {
        if (chayns.env.user.isAuthenticated) {
            $greeting.textContent = 'Hey, ' + chayns.env.user.firstName + '! ';
            $button_teilnahme.textContent = buttontext;
        }
    }

    _call() {
        if (chayns.env.isIOS) {
            window.open(telNumber, '_system');
        } else if (chayns.env.isAndroid) {
            window.location.href = telNumber;
        }
    };

    _mobile() {
        if (!chayns.env.isMobile) {
            document.querySelector('#mobileOnly').remove();
        }
    };

    _route() {
        chayns.getGeoLocation().then(function(result) {
            chayns.openUrlInBrowser('https://www.google.de/maps/dir/' + result.latitude + "," + result.longitude + '/Oldenkottpl.+1,+48683+Ahaus"');
        })

    };

    _nextSide(currentPage, nextPage) {
        document.querySelector(currentPage).style.opacity = '0';

        setTimeout(() => {
            document.querySelector(currentPage).style.display = 'none';
            document.querySelector(nextPage).style.display = 'block';
            setTimeout(() => {
                document.querySelector(nextPage).style.opacity = '1';
            }, 5);
        }, 500);
    }

    _timer() {

        let interval = setInterval(this._displayTimer, 1000);

        if (distance < 0) {
            clearInterval(interval);
            document.querySelector(".timer.counter").innerHTML = endTimer;
        }
    }

    _displayTimer() {

        now = new Date().getTime();
        distance = countDownDate - now;

        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.querySelector(".timer.counter").innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
    }

    _isQuizDone() {
        if (chayns.utils.ls.get('quizDone') && chayns.env.user.isAuthenticated)
            this._finished();
        else {
            this._greeting();
        }
    }

    _finishdedQuiz() {
        chayns.intercom.sendMessageToPage({
            text: chayns.env.user.name + '(' + chayns.env.user.personId + ') nimmt an der Verlosung teil.'
        }).then(function(data) {
            if (data.status == 200) {

            }

        });

        this._finished();

    }

    _finished() {
        this._nextSide('.tapp.page2', '.tapp.page1');

        $button_teilnahme.style.display = 'none';
        $timer_headline.textContent = loseText;
        $greeting.textContent = 'Hey, ' + chayns.env.user.firstName + '. Du bist im Lostopf!';

        chayns.utils.ls.set('quizDone', 'true');
    }




}


// radio button checked?
// console.log("rbgName:", document.querySelector('input[name=rbgName]:checked').value);

chayns.ready.then(() => {
    chayns.ui.initAll();
    new Tapproject();
}).catch((error) => console.log("No Chayns", error));