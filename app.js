(function () {

    angular.module('App', [])
        .controller('Controller', Controller)
        .service('Service', Service)
        .constant('URL', 'https://www.euro.com.pl/karty-graficzne.bhtml');

    Controller.$inject = ['Service', '$interval', 'URL'];

    function Controller(Service, $interval, URL) {

        let controller = this;
        let milliseconds = 1000 * 60;
        controller.number = '';
        controller.loading = false;
        controller.settings = false;
        controller.register = false;
        controller.refreshTime = 5;
        controller.automate = true;
        controller.timer = controller.refreshTime * 60;


        function notify(oldValue, newValue) {
            let grewMessage = 'Lista zwiększyła się z ';
            let gotSmallerMessage = 'Lista zmniejszyła się z ';
            const notification = new Notification("Lista zmieniła długość", {
                body: (oldValue < newValue ? grewMessage : gotSmallerMessage) + oldValue + ' do ' + newValue
            });
            notification.onclick = function (event) {
                event.preventDefault();
                window.open(URL, '_blank');
            }
        }

        function registerNotification() {
            const notification = new Notification('Zarajestruj na serwerze', {
                body: '403'
            });
            notification.onclick = function (event) {
                event.preventDefault();
                window.open('https://cors-anywhere.herokuapp.com/corsdemo', '_blank');
            }
        }

        let startIntervals = () => {
            automaticRefresh = $interval(controller.refresh, controller.refreshTime * milliseconds);
            controller.timer = controller.refreshTime * 60;
            timer = $interval(decreaseTimer, 1000);
        }

        let stopIntervals = () => {
            $interval.cancel(automaticRefresh);
            $interval.cancel(timer);
        }


        let decreaseTimer = () => {

            if (controller.timer == 1)
                controller.timer = controller.refreshTime;
            else
                controller.timer--;

        }


        controller.refresh = function () {

            controller.loading = true;
            let oldValue = controller.number;
            controller.number = '';
            Service.getPage().then(response => {
                controller.loading = false;
                if (response.status === 403) {
                    controller.register = true;
                    registerNotification();
                } else {
                    controller.register = false;
                    controller.number = Service.extractNumber(response);
                    if (controller.number !== oldValue && oldValue !== '')
                        notify(oldValue, controller.number);
                }
            });
        }

        controller.toggleSettings = () => {
            controller.settings = !controller.settings;
        }

        controller.changeRefreshTime = () => {
            if (controller.automate){
                stopIntervals();
                startIntervals();
            }
        }

        controller.toggleAutomaticRefresh = () => {

            if (controller.automate) {
                startIntervals();
            } else {
                stopIntervals();
            }


        }

        controller.refresh();
        let automaticRefresh = $interval(controller.refresh, controller.refreshTime * milliseconds);
        let timer = $interval(decreaseTimer, 1000);

        if (Notification.permission !== 'granted')
            Notification.requestPermission().then();


    }

    Service.$inject = ['$http', 'URL'];

    function Service($http, URL) {

        let service = this;

        service.getPage = () => {
            return $http.get('https://cors-anywhere.herokuapp.com/' + URL);
        }

        service.extractNumber = response => {

            return new DOMParser()
                .parseFromString(response.data, 'text/html')
                .getElementsByClassName('count')[0]
                .innerHTML
                .trim()
                .substring(1, 3);

        }

    }


})();