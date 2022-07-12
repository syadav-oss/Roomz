function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const button = document.getElementById("mylink");
id = makeid(10);
base_url = "/meeting/";
button.href = base_url + id;

const form = document.querySelector(".join");
const code = document.querySelector("#code");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  window.location.assign(base_url + code.value);
});
