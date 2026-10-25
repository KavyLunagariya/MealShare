import "../carousel.css";

import warmMeals from "../../../assets/images/carousel_warm_meals.jpg";
import kitchenRescue from "../../../assets/images/carousel_kitchen_rescue.jpg";
import freshProduce from "../../../assets/images/carousel_fresh_produce.jpg";
import communityPacking from "../../../assets/images/carousel_community_packing.jpg";
import freshBaked from "../../../assets/images/carousel_fresh_baked.jpg";
import shareHope from "../../../assets/images/carousel_share_hope.jpg";
import chefPrepared from "../../../assets/images/carousel_chef_prepared.jpg";
import nourishingBowls from "../../../assets/images/carousel_nourishing_bowls.jpg";

const rowOne = [
  { image: warmMeals, title: "Warm meals" },
  { image: kitchenRescue, title: "Kitchen rescue" },
  { image: freshProduce, title: "Fresh produce" },
  { image: communityPacking, title: "Community packing" },
];

const rowTwo = [
  { image: freshBaked, title: "Fresh baked" },
  { image: shareHope, title: "Share hope" },
  { image: chefPrepared, title: "Chef prepared" },
  { image: nourishingBowls, title: "Nourishing bowls" },
];

function CarouselRow({ items, reverse = false }) {
  const repeatedItems = [...items, ...items];

  return (
    <div className="carousel-row">
      <div className={`carousel-track ${reverse ? "reverse" : ""}`}>
        {repeatedItems.map((item, index) => (
          <div className="carousel-item" key={index}>
            <img src={item.image} alt={item.title} />
            <div className="carousel-overlay"></div>
            <span>{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Carousel() {
  return (
    <section className="carousel-section">
      <CarouselRow items={rowOne} />
      <CarouselRow items={rowTwo} reverse />
    </section>
  );
}

export default Carousel;