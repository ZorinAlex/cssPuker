var activeFrame = document.querySelector('#active');
var activeFrameDocument = activeFrame.contentWindow.document;
////
var constructor = {
    createStyleSheet: function (id, doc) {
        if (!doc.querySelector(id))
        {
            var styleSheet = document.createElement('style');
            styleSheet.setAttribute('id', id);
            doc.head.appendChild(styleSheet);
        }
    },
    addClickEvent: function() {
        var self = this;
        activeFrameDocument.body.onclick = function (event) {
            self.findSelector(event.target)
        }
    },
    findSelector: function (element) {
        var selectors = [];
        var stylesheetsArr=[];
        var self = this;
        for(var stylesheet in styleSetup.cssObj){
            styleSetup.cssObj[stylesheet].forEach(function (cssRule) {
                 if(element.matches(Object.keys(cssRule)[0])){
                     selectors.push(Object.keys(cssRule)[0]);
                     if((stylesheetsArr.indexOf(stylesheet+'.css'))){
                         stylesheetsArr.push(stylesheet+'.css');
                     }
                 }
            });
        }
        if(styleSetup.selectedItem){
            styleSetup.selectedItem.classList.remove('selected-item');
        }
        element.classList.toggle('selected-item');
        styleSetup.selectedItem = element;
        styleSetup.selected = selectors;
        styleSetup.activeStylesheet = stylesheetsArr.join(';');
    }
};
////
var styleSetup = new Vue({
    el: '#styleSetup',
    data:{
        cssObj:{},
        selected:[],
        search: {
            className: '',
            id: '',
            tagName: ''
        },
        activeStylesheet: '',
        selectedItem:'',
        staticExternalStylesheets:[]
    },
    updated: function(){
        this.updateStyle();
        this.updateInput();
    },
    methods:{
        cssTextToObj: function (cssText) {
            var openBrace = cssText.indexOf('{');
            var css = cssText.slice(openBrace).replace(/({|})/g,'');
            var selector = cssText.slice(0, openBrace).trim();
            var rules = css.split(';');
            if(css.substr(-1) == ';'){rules.pop()}
            var properties = [];
            var values = [];
            rules.forEach(function(element){
                var rule = element.split(':');
                properties.push(rule[0].trim());
                values.push(rule[1].trim());
            });
            var objCss = {};
            var objRule = {};
            for (var i = 0; i < properties.length; i++){
                objCss[properties[i]] = values[i]
            }
            objRule[selector] = objCss;
            return objRule
        },
        cssTextToObjsArr: function (cssText) {
            var self = this;
            var styles = cssText.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '').split('}');
            styles.pop();
            var objsArr = [];
            styles.forEach(function(element){
                if(element.length){objsArr.push(self.cssTextToObj(element.trim()))}
            });
            return objsArr
        },
        cssToObjsRepresent: function(stylesheet, cssText){
            var self = this;
            var newObj={};
            newObj[stylesheet] = self.cssTextToObjsArr(cssText);
            self.cssObj = Object.assign({}, self.cssObj, newObj);
            self.objsRepresentToCss();

        },
        objsRepresentToCss: function(){
            var self = this;
            var simpleCssObj = {};
            for(var key in self.cssObj){
                simpleCssObj[key]= self.objsArrToCssText(self.cssObj[key]);
            }
            return simpleCssObj;
        },
        objToCssText: function (obj) {
            var selector = Object.keys(obj);
            var css = obj[selector];
            var string= '';
            Object.keys(css).forEach(function(key){
                string += key + ': ' + css[key] + ';'
            });
            string = selector + ' {' + string + '}';
            return string
        },
        objsArrToCssText: function (arr) {
            var self = this;
            var string = '';

            arr.forEach(function(element){
                string += self.objToCssText(element)
            });
            return string
        },
        loadStyle: function (url, name) {
            var self = this;
            this.$http.get(url)
                .then(function (response){
                    if(!(name in self.cssObj)){
                        self.cssToObjsRepresent(name, response.body);
                        self.updateStyle();
                    }

                });
        },
        loadAdditionalStyle: function (src, name) {
            var head = activeFrameDocument.getElementsByTagName('head')[0];
            var link = document.createElement('link');

            if(!activeFrameDocument.getElementById(name)){
                //link.title = name;
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = src;
                link.media = 'all';
                this.staticExternalStylesheets.push(name);
                head.insertBefore(link,head.firstChild);
            }
        },
        updateStyle: function (){
            var self = this;
            var cssObj = self.objsRepresentToCss();
            var cssStyles = '';
            for(key in cssObj){
                cssStyles+=cssObj[key];
            }
            activeFrameDocument.querySelector('#import').innerHTML = cssStyles;
        },
        updateInput: function () {
            document.querySelectorAll('#styleSetup > .list input').forEach(function (elem) {
                autosizeInput(elem)
            })
        },
        filterSelector: function (inputs) {
            var self = this;
            if(!self.selected[0]){return inputs}
            return inputs.filter(function (input) {
                for(var i=0;i<self.selected.length;i++){
                    if(Object.keys(input)[0] ==  self.selected[i]){
                        return 1;
                    }
                }
            });
        }
    }
});

var templateSetup = new Vue({
    el: '#templateSetup',
    data:{
        templates: [],
        temp: '8'
    },
    created:function () {
        this.loadTemplates();
    },
    methods: {
        loadTemplates: function () {
            this.$http.get('templates/package.json')
                .then(function (response){
                    this.templates = response.body;
                });
        },
        loadTemplate: function (html, css, name) {
            var self = this;
            this.$http.get(html)
                .then(function (response){
                    self.addTemplate(response)
                });
            styleSetup.loadStyle(css, name);
        },
        addTemplate: function (xhttp) {
            this.temp = xhttp.body;
            activeFrameDocument.body.insertAdjacentHTML('beforeEnd', this.temp);
            styleSetup.updateStyle();

        }
    }
});
//// init
constructor.createStyleSheet('import', activeFrameDocument);
// styleSetup.loadStyle('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css');
styleSetup.loadAdditionalStyle('css/helper.css','helper.css');
styleSetup.loadAdditionalStyle('css/reset.css','reset.css');
styleSetup.updateStyle();
constructor.addClickEvent();