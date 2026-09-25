const loginForm = document.getElementById("login-form");
const formMessage = document.getElementById("form-message");

loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    formMessage.textContent = "";

    const formData = new FormData(loginForm);

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: formData.get("email"),
                password: formData.get("password")
            })
        });
        const result = await response.json();
        formMessage.textContent = result.message || "Unable to sign in.";
    } catch {
        formMessage.textContent = "Could not reach the server. Please try again.";
    }
});
