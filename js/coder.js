const body = document.body;
const darkModeToggle = document.getElementById('dark-mode-toggle');
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

// Check if user preference is set, if not check value of body class for light or dark else it means that colorscheme = auto
if (localStorage.getItem("colorscheme")) {
    setTheme(localStorage.getItem("colorscheme"));
} else if (body.classList.contains('colorscheme-light') || body.classList.contains('colorscheme-dark')) {
    setTheme(body.classList.contains("colorscheme-dark") ? "dark" : "light");
} else {
    setTheme(darkModeMediaQuery.matches ? "dark" : "light");
}

if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        const theme = body.classList.contains("colorscheme-dark") ? "light" : "dark";
        const inverse = theme === 'dark' ? 'light' : 'dark';
        setTheme(theme);
        switchTweetTheme(inverse, theme);
        rememberTheme(theme);
    });
}

darkModeMediaQuery.addListener((event) => {
    setTheme(event.matches ? "dark" : "light");
});

document.addEventListener("DOMContentLoaded", function () {
    let node = document.querySelector('.preload-transitions');
    node.classList.remove('preload-transitions');
});

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}


function setTheme(theme) {
    body.classList.remove('colorscheme-auto');
    let inverse = theme === 'dark' ? 'light' : 'dark';
    body.classList.remove('colorscheme-' + inverse);
    body.classList.add('colorscheme-' + theme);
    document.documentElement.style['color-scheme'] = theme;

    if (theme === 'dark') {
        const message = {
            type: 'set-theme',
            theme: 'github-dark'
        };
        waitForElm('.utterances-frame').then((iframe) => {
            iframe.contentWindow.postMessage(message, 'https://utteranc.es');
        })

    }
    else {
        const message = {
            type: 'set-theme',
            theme: 'github-light'
        };
        waitForElm('.utterances-frame').then((iframe) => {
            iframe.contentWindow.postMessage(message, 'https://utteranc.es');
        })

    }

}

waitForElm('[data-tweet-id]').then(() => {
    const theme = localStorage.getItem("colorscheme") | "dark";
    const inverse = theme === 'dark' ? 'light' : 'dark';
    switchTweetTheme(inverse, theme);
});

function switchTweetTheme(currentTheme, targetTheme) {
    var tweets = document.querySelectorAll('[data-tweet-id]');

    tweets.forEach(function(tweet) {
        var src = tweet.getAttribute("src");
        tweet.setAttribute("src", src.replace("theme=" + currentTheme, "theme=" + targetTheme));
    });
}

function rememberTheme(theme) {
    localStorage.setItem('colorscheme', theme);
}
