document.body.onload = () => {
var id = document.getElementById("id").textContent;
var code = document.getElementById("code").textContent;
var message;
var messages =  document.getElementById("messages");
fetch(`/read/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code
        })
}).then(r=> r.json()).then(async r=> {
    message = r.value;
    for(var i = 0; i < r.random; i++) {
     message = atob(`${message}`);
    }
   messages.textContent = message;
    setTimeout(() => {
       messages.textContent = "";
       window.location = "/";
    }, 2000);
})

}
