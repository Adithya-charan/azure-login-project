function login(req, res) {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    return res.status(501).json({
        message: "Authentication is not configured yet. Connect a user store and password verifier."
    });
}

module.exports = { login };
