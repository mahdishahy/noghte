const slugify = require("slugify");
const generateManualSlug = function (title) {
    return slugify(title, { lower: true, replacement: "-" });
}
module.exports = {
    generateManualSlug
}