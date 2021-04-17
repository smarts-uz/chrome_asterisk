function init() {
    chrome.storage.sync.get(["arienable", "ariurl", "ariip", "ariext", "ariusername", "arisecret"], function (a) {
        1 == a.arienable && (ari.ip = a.ariip, ari.url = a.ariurl, ari.ext = a.ariext, ari.user = a.ariusername, ari.secret = a.arisecret, ari.app = a.ariext, doLogin())
    })
}

function httpSend(a, b) {
    var c = new XMLHttpRequest, d = "http://" + ari.ip + "/ari/" + b + "&api_key=" + ari.user + ":" + ari.secret;
    console.log("requesting: " + a + " " + d), c.open(a, d, !0, ari.user, ari.secret), c.addEventListener("load", function () {
        console.log("http " + a + " " + d)
    }), c.addEventListener("error", function () {
        console.log("http " + a + " error")
    }), c.send(null)
}

function saveHistory() {
    chrome.storage.local.get(["history"], function (a) {
        var b = a.history;
        "undefined" == typeof b ? b = [call] : b.length < 100 ? b.push(call) : (b.shift(), console.log(b), b.push(call)), chrome.storage.local.set({history: b}), call = {}
    })
}

function parseEvent(a) {
    var b = JSON.parse(a);
    if ("undefined" != typeof b.type && b.application === ari.app) switch (b.type) {
        case"ChannelStateChange":
            if (b.channel.caller.number === ari.ext) switch (b.channel.state) {
                case"Ringing":
                    console.log(b.channel), call.time = Date.now(), call.ext = b.channel.caller.number, call.id = b.channel.id, call.from = b.channel.connected.name + " <" + b.channel.connected.number + ">", call.state = "Ringing";
                    var c = "Incoming call from " + b.channel.connected.name + " <" + b.channel.connected.number + ">";
                    showPopup(c, b);
                    break;
                case"Up":
                    console.log(b.channel), call.answered = Date.now(), call.state = "Answered";
                    var c = "Answered to " + b.channel.connected.name + " <" + b.channel.connected.number + ">";
                    updatePopup(c)
            }
            break;
        case"ChannelHangupRequest":
            console.log(b.channel), call.ext === ari.ext && "ended" !== call.state && (call.ended = Date.now(), call.state = "ended", console.log(call), saveHistory()), hidePopup()
    }
}

function doLogin() {
    var a = new WebSocket("ws://" + ari.ip + "/ari/events?api_key=" + ari.user + ":" + ari.secret + "&app=" + ari.app + "&subscribeAll=true");
    ari.socket = a, a.onmessage = function (a) {
        parseEvent(a.data)
    }, a.onopen = function () {
        console.log("Connected"), httpSend("POST", "applications/" + ari.app + "/subscription?eventSource=channel:,endpoint:,bridge:,deviceState:")
    }, a.onclose = function () {
        console.log("Closed"), chrome.storage.sync.get(["arienable"], function (a) {
            1 == a.arienable && doLogin()
        })
    }, a.onerror = function () {
        console.log("Connection error")
    }
}

function showPopup(a, b) {

    // b.channel.connected.number   {connected.number}
    // b.channel.connected.name     {connected.name}
    // b.channel.caller.number      {caller.number}
    // b.channel.id                 {id}
    // b.channel.state              {state}
    
    // http://callapp.teampro.uz/tbl-call/index.aspx?number={connected.number}&caller={caller.number}&id={id}&name={connected.name}&state={state}

    // var ur = ari.url.replace("{caller.number}", b.channel.caller.number);
        // ur = ur.replace("{id}", b.channel.id);
        // ur = ur.replace("{connected.name}", b.channel.connected.name);
        // ur = ur.replace("{connected.number}", b.channel.connected.number);
    // window.open(ur)
   window.open(ari.url)

    var c = {type: "basic", title: "TeamPRO Chrome", message: a, iconUrl: "phone48.png"};
    chrome.notifications.create(ari.app, c, function (a) {
    }), chrome.notifications.onButtonClicked.addListener(function () {
        var a = ari.url.replace("{connected.number}", b.channel.connected.number);
        a = a.replace("{connected.name}", b.channel.connected.name);
        a = a.replace("{caller.number}", b.channel.caller.number);
        window.open(a);
    }), ga("send", "event", "Ringing", "event");
}

function updatePopup(a) {
    var b = {message: a};
    chrome.notifications.update(ari.app, b, function (a) {
    })
}

function hidePopup() {
    chrome.notifications.clear(ari.app)
}

!function (a, b, c, d, e, f, g) {
    a.GoogleAnalyticsObject = e, a[e] = a[e] || function () {
        (a[e].q = a[e].q || []).push(arguments)
    }, a[e].l = 1 * new Date, f = b.createElement(c), g = b.getElementsByTagName(c)[0], f.async = 1, f.src = d, g.parentNode.insertBefore(f, g)
}(window, document, "script", "https://www.google-analytics.com/analytics.js", "ga"), ga("create", "UA-7120789-4", "auto"), ga("send", "pageview");
var ari = new Object, call = new Object;
init(), chrome.runtime.onMessage.addListener(function (a, b, c) {
    "undefined" != typeof a.dologin && "dologin" === a.dologin && init()
}), chrome.runtime.onInstalled.addListener(function (a) {
});
