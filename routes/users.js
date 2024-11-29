import express from "express";
const router = express.Router();

router.post("/signup", async function (req, res) {
  try {
    const data = req.body;
    console.log("data recieved is: ");
    console.log(data);
    const { username, email, password } = data;

    if (!username || !email || !password) {
      res.json({
        msg: "all the fields are must",
      });
      return;
    }
    const validateUser = signUpSchema.safeParse(data);

    if (!validateUser.success) {
      res.status(400).json({
        msg: "Invalid input feilds",
        error: validateUser.error.message,
      });
      return;
    }

    const userExistCheck = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (userExistCheck) {
      res.json({
        msg: "user alreday exist! login instead",
      });
    }

    const hashPassword = await bycrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: username,
        email: email,
        password: hashPassword,
      },
    });
    console.log(user);
    const token = jwt.sign({ username }, jwtPassword);

    res.status(200).json({
      msg: "user registered success...",
      status: user,
      token,
    });
  } catch (e) {
    console.log(e.message);
  }
});

router.post("/signin", async function (req, res) {
  try {
    const { email, password } = req.body;
    console.log("email is");
    console.log(email);

    const userExist = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (userExist) {
    }
    const verifyPassword = await bycrypt.compare(password, userExist.password);
    if (!verifyPassword) {
      res.json({
        msg: "please input the correct password",
      });
    }

    if (!userExist) {
      return res.status(411).json({
        msg: "user do not exits",
      });
    }

    const token = jwt.sign({ email }, jwtPassword);
    res.json({
      msg: "user exits",
      token: token,
    });
  } catch (e) {
    console.log(e.message);
  }
});
