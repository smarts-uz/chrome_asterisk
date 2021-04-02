function showFlash(a, b) {
    $("#state").html(a), $("#state").removeClass("alert-success alert-danger").addClass(b), $("#state").show(), setTimeout(function () {
        $("#state").fadeOut("fast")
    }, 3e3)
}

function save_options() {
    var a = document.getElementById("url").value, b = document.getElementById("ip").value,
        c = document.getElementById("exten").value, d = document.getElementById("username").value,
        e = document.getElementById("secret").value, f = document.getElementById("arienable").checked;
    chrome.storage.sync.set({arienable: f, ariip: b, ariurl: a, ariext: c, ariusername: d, arisecret: e});
    var g = document.getElementById("save");
    g.innerHTML = "Saved", setTimeout(function () {
        g.innerHTML = "Save"
    }, 1e3);
    var h = new WebSocket("ws://" + b + "/ari/events?api_key=" + d + ":" + e + "&app=" + c);
    h.onopen = function () {
        showFlash("Connected succesfully!", "alert-success"), h.close, chrome.runtime.sendMessage({dologin: "dologin"})
    }, h.onerror = function (a) {
        showFlash("Couldn't connect to ARI, check browser's console for details.", "alert-danger")
    }
}

function restore_options() {
    chrome.storage.sync.get(["arienable", "ariip", "ariurl", "ariext", "ariusername", "arisecret"], function (a) {
        "undefined" != typeof a.ariurl && (document.getElementById("url").value = a.ariurl), "undefined" != typeof a.ariip && (document.getElementById("ip").value = a.ariip), "undefined" != typeof a.arienable ? 1 == a.arienable ? document.getElementById("arienable").checked = "on" : document.getElementById("arienable").removeAttribute("checked") : document.getElementById("arienable").checked = "on", "undefined" != typeof a.ariext && (document.getElementById("exten").value = a.ariext), "undefined" != typeof a.ariusername && (document.getElementById("username").value = a.ariusername), "undefined" != typeof a.arisecret && (document.getElementById("secret").value = a.arisecret)
    })
}

document.addEventListener("DOMContentLoaded", function () {
    restore_options()
}), document.querySelector("#save").addEventListener("click", save_options);
