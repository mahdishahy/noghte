const slugify = require("slugify");

const generateSlug = function (next) {
    this.slug = slugify(this.title, { lower: true, replacement: "-" });
    next();
}

module.exports = {
    generateSlug
};