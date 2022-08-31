const button = document.getElementById('create');
button.addEventListener('click', () => {
    var message = document.getElementById("message");
    var id = document.getElementById("id");
    var name = document.getElementById("name");
    if(message.value == "") {
         name.textContent = 'Message is empty';
         setTimeout(() => {
            name.textContent = "One Time Message"
         }, 3000);
    }else {
    fetch('/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            value: message.value
        })
    }).then(r=> r.json()).then((r) => {
        id.href = `/${r.id}`;
        id.childNodes[0].textContent = r.id;
        message.style.display = "none";
        button.style.display = "none";
    })
    }
})
