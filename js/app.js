var app = angular.module('app', []);

app.filter('myFilter', function () {
    return function(inputs, search) {
        var output = [];
        if(Object.keys(search) != 0){
            angular.forEach(inputs, function (input) {
                var key = Object.keys(input)[0];
                var cl = new RegExp('.' + search.className +"\\b","i");
                var id = new RegExp('#' + search.id +"\\b","i");
                var tg = new RegExp("\\b"+search.tagName +"\\b", 'i');
                if (cl.test(key) || id.test(key) || tg.test(key))
                    output.push(input);
            });
        }
        return output;
    };
});

app.controller('dataCtrl', function ($scope, $http) {
    
    $scope.loadAll = function (name, template, css) {
        loadTemplate(template, activeIFrameDoc);
        
    };

    $scope.cssRule = [];

    var activeIFrame = document.getElementById('active');
    var activeIFrameDoc = document.getElementById('active').contentWindow.document;

    var init = function () {
        $http.get("templates/package.json").then(function (response) {
            $scope.templates = response.data;
        });

        var request = $http.get("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css").then(function (response) {
            $scope.data = response.data;
            return response.data;
        });

        request.then(function (data) {$scope.cssRule = cssToArrObjs(data)});

        var styleSheet = document.createElement('style');
        styleSheet.setAttribute('id', 'import');
        activeIFrameDoc.head.appendChild(styleSheet);

    };

    init();

    // var string = "body {background-color: red}";

    // $scope.cssRule = cssToArrObjs($scope.test);

    function cssToArrObjs(cssText){
        var styles = cssText.replace(/((["'])(?:\\[\s\S]|.)*?\2|\/(?![*\/])(?:\\.|\[(?:\\.|.)\]|.)*?\/)|\/\/.*?$|\/\*[\s\S]*?\*\//gm,'').split('}');
        styles.pop();
        var cssObjs = [];
        styles.forEach(function(element, index, array){
            cssObjs.push(cssToObj(element.trim()))
        });
        return cssObjs
    }

    function cssToObj(cssText){
        var openBrace = cssText.indexOf('{');
        var css = cssText.slice(openBrace).replace(/({|})/g,'');
        var selector = cssText.slice(0, openBrace).trim();
        var rules = css.split(';');
        if(css.substr(-1) == ';'){rules.pop()}
        var properties = [];
        var values = [];
        rules.forEach(function(element){
            var rule = element.split(':');
            rule.forEach(function(element, index){
                if(index % 2 == 0){properties.push(element.trim())
                } else {values.push(element.trim())}
            })
        });
        var objCss = {};
        var objRule = {};
        for (var i = 0; i < properties.length; i++){
            objCss[properties[i]] = values[i]
        }
        objRule[selector] = objCss;
        return objRule
    }

    function objToCss(obj){
        delete obj['$$hashKey'];
        var selector = Object.keys(obj);
        var css = obj[selector];
        var string= '';
        Object.keys(css).forEach(function(key){
            string += key + ': ' + css[key] + ';'
        });
        string = selector + ' {' + string + '}';

        return string
    }

    function objArrayToCss(arr){
        var str = '';

        arr.forEach(function(element){
            str += objToCss(element)
        });

        return str
    }

    $scope.updateStyle = function (){
        activeIFrameDoc.querySelector('#import').innerHTML = objArrayToCss($scope.cssRule);
        document.querySelectorAll('input').forEach(function (element) {
            autosizeInput(element, { minWidth: true });
        })
    };

    $scope.updateStyle();

    ////////////

    // load functions

    function loadTemplate(src, doc) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                doc.body.insertAdjacentHTML('beforeend', this.response);
                addClickEvent();
            }
        };
        xhttp.open("GET", src, true);
        xhttp.send();
    }

    function loadScript(src, doc) {

        var script = doc.createElement("script");
        script.type = "text/javascript";
        script.src = src;
        doc.contentWindow.document.body.appendChild(script);
    }

    function loadStyle(name, src, doc) {
        var head = doc.getElementsByTagName('head')[0];
        var link = document.createElement('link');

        if(!doc.getElementById(name)){
            link.id = name;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = src;
            link.media = 'all';
            head.appendChild(link);
        }
    }

    function loadTemplateCss(css){
        var b = document.querySelector('#test').innerHTML;
        console.log(b);
        // console.log(getTemplateCss(css))
    }

    // add event to select elements in iframe
    function addClickEvent() {
        var elements = activeIFrameDoc.body.querySelectorAll('*');
        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener("click", selectElement);
        }
    }

    // do something on element selection

    function selectElement(event) {

        event.stopPropagation();

        //var css = GetAppliedCssRules($(event.target), activeIFrameDoc);

        //createUserCss(css);
        document.querySelector('#css').value = '';
        document.querySelector('#css').value = css;
    }

    // rgba to hex color converter

    function rgb2hex(rgb){
        rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
        return (rgb && rgb.length === 4) ? "#" +
        ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
    }

    // convert css to obj

});
