const Hero = require("../models/heroModel");

exports.getHero = async (req, res) => {
  try {
    const hero = await Hero.findOne({ isActive: true });
    res.json(hero);
  } catch (error) {
    res.status(500).json({ message: "Hero içeriği alınamadı", error });
  }
};

exports.updateHero = async (req, res) => {
  try {
    const { title, subtitle, buttonText, buttonLink, image } = req.body;

    let hero = await Hero.findOne({ isActive: true });

    if (hero) {
      hero.title = title;
      hero.subtitle = subtitle;
      hero.buttonText = buttonText;
      hero.buttonLink = buttonLink;
      hero.image = image;
    } else {
      hero = new Hero({
        title,
        subtitle,
        buttonText,
        buttonLink,
        image,
      });
    }

    await hero.save();
    res.json(hero);
  } catch (error) {
    res.status(500).json({ message: "Hero içeriği güncellenemedi", error });
  }
};
