(function() {
    var delimiter = "\t";
    var extension = ".tsv";
    var data_directory = "data"

    var words = [];
    var words_index = 0;
    var words_mode = "word";

    function setWord() {
        var record = words[words_index];
        var field = document.getElementById("field");
        if (words_mode == "word") {
            field.innerText = record["word"];
        } else {
            field.innerText = record["meaning"];
        }
    }

    function switchMode(mode) {
        var menu = document.getElementById("menu");
        var field = document.getElementById("field");
        if (mode == "menu") {
            menu.style.display = "block";
            field.style.display = "none";
        } else {
            field.style.display = "block";
            menu.style.display = "none";
        }
    }

    function fisheryates(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var r = Math.floor(Math.random() * (i + 1));
            var tmp = array[i];
            array[i] = array[r];
            array[r] = tmp;
        }
    }

    function parseFileText(text) {
        var lines = text.replace(/^\s+|\s+$/g, '').split(/\r?\n/g);
        var columns = lines[0].split(delimiter);
        var column_number = columns.length;
        var records = [];

        for (var i = 1; i < lines.length; i++) {
            var items = lines[i].split(delimiter);
            var record = {};
            for (var j = 0; j < column_number; j++) {
                record[columns[j]] = items[j];
            }
            records.push(record);
        }
        return records;
    }

    function loadWords(name) {
        var filename = name + extension;

        var req = new XMLHttpRequest();

        req.onreadystatechange = function() {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var text = req.responseText;
                    var records = parseFileText(text);
                    fisheryates(records);
                    words = records;
                    words_index = 0;
                    words_mode = "word";
                    setWord();
                    switchMode("field");
                }
            }
        };

        req.open("GET", filename, true);
        req.send(null);
    }

    function loadMenu(text) {
        var menu = document.getElementById("menu");

        var records = parseFileText(text);

        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var div = document.createElement("div");
            div.appendChild(document.createTextNode(record["label"]));
            div.classList.add("option");
            (function() {
                var item = record["name"];
                div.onclick = function() {
                    loadWords(data_directory + "/" + item);
                };
            })();
            menu.appendChild(div);
        }
    }

    function initializeMenu() {
        var req = new XMLHttpRequest();

        req.onreadystatechange = function() {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var text = req.responseText;
                    loadMenu(text);
                }
            }
        };

        req.open("GET", data_directory + "/index" + extension, true);
        req.send(null);
    }

    window.onload = function() {
        initializeMenu();

        document.onkeydown = function(event) {
            key = event.keyCode;

            if (key == 39 || key == 76) {
                if (words_index < words.length - 1) {
                    words_index += 1;
                }
            } else if (key == 37 || key == 72) {
                if (words_index > 0) {
                    words_index -= 1;
                }
            } else {
                words_mode = "meaning";
                var debug = document.getElementById("debug");
                debug.innerText = String(key);
            }

            setWord();

            if (key == 8) {
                return false;
            }
        };

        document.onkeyup = function() {
            words_mode = "word";
            setWord();
        }
    };
})();
