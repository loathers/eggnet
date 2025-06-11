var extras = {};

const IMAGES_SERVER = "https://d2uyhvukfffg5a.cloudfront.net";
const WIKI_WEBPAGE = "https://kol.coldfront.net/thekolwiki/index.php";

extras.loading_animation = setInterval(function() {
    const FULL_CIRCLE_INTERVAL = 3000;

    let time_period = (Date.now() % FULL_CIRCLE_INTERVAL) / FULL_CIRCLE_INTERVAL;
    let first_pointer = Math.pow(time_period, 1.5);
    let second_pointer = 1 - Math.pow(1 - time_period, 1.5);

    for (let elem of document.getElementsByClassName("outer-loading-circle")) {
        elem.style.setProperty("--first-pointer", first_pointer);
        elem.style.setProperty("--second-pointer", second_pointer);
    }

    if (result.finished) {
        document.body.classList.add("loaded");
        clearInterval(extras.loading_animation);
    }
}, 30);

// Cookies

function setCookie(name,value,days) {
    var expires = "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name, def=null) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return def;
}

function eraseCookie(name) {
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// Sorting

function cmp(x, y) { 
    return x > y ? 1 : x < y ? -1 : 0; 
}
