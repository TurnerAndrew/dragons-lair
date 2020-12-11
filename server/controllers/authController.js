const bcrypt = require("bcryptjs");

module.exports = {
  register: async (req, res) => {
    const db = req.app.get("db");

    const { username, password, isAdmin } = req.body;

    const [existingUser] = await db.get_user([username]);

    if (existingUser) {
      return res.status(409).send("Username taken");
    }

    const salt = bcrypt.genSaltSync(10);

    const hash = bcrypt.hashSync(password, salt);

    const [registeredUser] = await db.register_user([isAdmin, username, hash]);

    req.session.user = registeredUser;

    res.status(201).send(registeredUser);
  },

  login: async (req, res) => {
    const db = req.app.get("db");

    const { username, password } = req.body;

    const [foundUser] = await db.get_user([username]);

    if (!foundUser) {
      return res
        .status(401)
        .send(
          "User not found.  Please register as a new user before logging in."
        );
    }

    const isAuthenticated = bcrypt.compareSync(password, foundUser.hash);

    if (!isAuthenticated) {
      return res.status(403).send("Incorrect password");
    }

    req.session.user = foundUser;

    res.status(200).send(foundUser);
  },

  logout: (req, res) => {
      req.session.destroy()
      res.sendStatus(200)
  }





};
