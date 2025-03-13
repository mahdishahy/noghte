const userModel = require("./../../models/user");
const registerValidator = require("./../../validators/register");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    // Data validation
    const validationResult = registerValidator(req.body);
    if (validationResult !== true) {
      return res
        .status(422)
        .json({ message: "خطای اعتبارسنجی", error: validationResult });
    }

    // receive data from request body
    const { full_name, username, email, phone_number, password } = req.body;

    // checking if the user is registered
    const isUserExist = await userModel.findOne({
      $or: [{ username }, { email }, { phone_number }],
    });
    if (isUserExist) {
      return res.status(409).json({
        message:
          "کاربری با این ایمیل، شماره تلفن یا نام کاربری از قبل وجود داره",
      });
    }

    // checking count of user
    const countOfUser = await userModel.countDocuments();

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // new user
    const user = await userModel.create({
      full_name,
      username,
      email,
      phone_number,
      password: hashedPassword,
      role: countOfUser > 0 ? "USER" : "ADMIN",
    });

    // convert user into object
    const userObject = user.toObject();
    // delete password field
    Reflect.deleteProperty(userObject, "password");

    // generate access token
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30day",
    });

    return res.status(201).json({ user: userObject, accessToken });
  } catch (error) {
    return res.status(500).json({ message: "خطای سرور", error });
  }
};

exports.login = async (req, res) => {
  try {
    // receive data from request body
    const { username, password } = req.body;

    // find user by username
    const user = await userModel.findOne({ username });

    // check user
    if (!user) {
      return res
        .status(404)
        .json({ message: "کاربری با این نام کاربری یا پسورد یافت نشد" });
    }

    // check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(403)
        .json({ message: "کاربری با این نام کاربری یا پسورد یافت نشد" });
    }

    // convert user into object
    const userObject = user.toObject();
    // delete password field
    Reflect.deleteProperty(userObject, "password");

    // generate access token
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30day",
    });

    return res.status(201).json({ user: userObject, accessToken });
  } catch (error) {
    return res.status(500).json({ message: "خطای سرور", error });
  }
};

exports.getMe = async (req, res) => {};
