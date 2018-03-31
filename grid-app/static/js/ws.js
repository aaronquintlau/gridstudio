(function(){
    
    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }
     
    function WSManager(app){
        var _this = this;
        
        this.app = app;

        this.init = function(){
            
            console.log("WSManager initialized.");

            var hostname = window.location.hostname;
            
            var wsPort = 4430;
            this.ws = new WebSocket("ws:"+hostname+":" + wsPort + "/ws");
            
            this.ws.onopen = function (event) {
                // _this.ws.send("Send smth!"); 
            };
            
            this.ws.onmessage = function (event) {
                
                var lines = event.data;
    
                lines = lines.split("\n");
    
                for(var i = 0; i < lines.length; i++){                
    
                    var json = JSON.parse(lines[i])
                    
                    if (json[0] == 'SET'){
        
                        for(var x = 1; x < json.length; x += 3){
                            var rowText = json[x].replace(/^\D+/g, '');
                            var rowNumber = parseInt(rowText)-1;
            
                            var columnText = json[x].replace(rowText, '');
                            var columnNumber = _this.app.lettersToIndex(columnText)-1;
            
                            var position = [rowNumber, columnNumber];
                            _this.app.set(position,json[x+1]);
                            
                            // make sure to not trigger a re-send
                            // filter empty response
                            _this.app.set_formula(position, json[x+2], false);
                        }
                    }
                    if(json[0] == "INTERPRETER"){
                        var consoleText = json[1];
                        consoleText = escapeHtml(consoleText);
                        consoleText = consoleText.replaceAll("\n", "<br>");
                        _this.app.console.append("<div class='message'>" + consoleText + "</div>");
                        _this.app.console[0].scrollTop = _this.app.console[0].scrollHeight;

                        _this.app.termManager.showTab("console");
                    }
                }
                
                // re-render on receive data
                _this.app.drawSheet();
                
                // re-render plots
                _this.app.update_plots();
    
            };
        }

        this.send = function(value){
            // console.log("sent:" + value);
            this.ws.send(value);
        }

    }

    window.WSManager = WSManager;
})()