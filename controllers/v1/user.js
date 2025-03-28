const userModel = require("./../../models/user");
const isValidId = require("./../../utils/isValidID");
const passwordUtils = require("./../../utils/password");

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        // id validation
        if (!isValidId(id)) {
            return res.status(409).json({ message: "شناسه کاربر نامعتبر است" });
        }

        // get main user with id
        const user = await userModel.findOne({ _id: id });
        if (!user) {
            return res.status(404).json({ message: "کاربر مورد نظر یافت نشد" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: "خطا در سرور" });
    }
};

exports.getAll = async (req, res) => {
    try {
        const users = await userModel
            .find({})
            .select("-password -__v")
            .sort({ createdAt: -1 })
            .lean();
        return res.status(200).json({ users });
    } catch (error) {
        return res.status(500).json({ message: "خطا در سرور" });
    }
};

exports.remove = async (req, res) => {
    try {
        const { id } = req.params;

        // id validation
        if (!isValidId(id)) {
            return res.status(409).json({ message: "شناسه کاربر نامعتبر است" });
        }

        // remove user with id
        const user = await userModel.findOneAndDelete({ _id: id });
        if (!user) {
            return res.status(404).json({ message: "کاربر مورد نظر یافت نشد" });
        }

        return res.status(200).json({ message: "کاربر با موفقیت حذف شد" });
    } catch (error) {
        return res.status(500).json({ message: "خطا در سرور" });
    }
};

exports.changeRole = async (req, res) => {
    try {
        const { id } = req.params;
        let { role } = req.body;

        // id validation
        if (!isValidId(id)) {
            return res.status(409).json({ message: "شناسه کاربر نامعتبر است" });
        }

        role = role.toUpperCase();
        // role validation
        if (role !== "ADMIN" || role !== "USER") {
            return res.status(409).json({ message: "نقش کاربر نامعتبر است" });
        }

        // change user role with id
        const user = await userModel.findOneAndUpdate(
            { _id: id },
            { role },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: "کاربر مورد نظر یافت نشد" });
        }
        const userObject = passwordUtils.removeOnePropertyInObject(
            user,
            "password"
        );

        return res
            .status(200)
            .json({ message: "نقش کاربر با موفقیت تغییر کرد", user: userObject });
    } catch (error) {
        return res.status(500).json({ message: "خطا در سرور" });
    }
};

exports.update = async (req, res) => {
    try {

        const { id } = req.params;
        let { full_name, username, email, phone_number, image_url } = req.body;

        // id validation
        if (!isValidId(id)) {
            return res.status(409).json({ message: "شناسه کاربر نامعتبر است" });
        }

        // update user with id
        const user = await userModel
            .findOneAndUpdate(
                { _id: id },
                {
                    full_name,
                    username,
                    email,
                    phone_number,
                    image_url,
                },
                { new: true }
            );

        if (!user) {
            return res.status(404).json({ message: "کاربر مورد نظر یافت نشد" });
        }

        // remove password property
        const userObject = passwordUtils.removeOnePropertyInObject(
            user,
            "password"
        );

        return res
            .status(200)
            .json({ message: "کاربر با موفقیت ویرایش شد", user: userObject });
    } catch (error) {
        return res.status(500).json({ message: "خطا در سرور" });
    }
};
