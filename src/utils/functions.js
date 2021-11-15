const { default: slugify } = require("slugify");

module.exports = {
  slug(value) {
    return slugify(value, {
      lower: true,
      replacement: "_",
      strict: true,
    });
  },
};
