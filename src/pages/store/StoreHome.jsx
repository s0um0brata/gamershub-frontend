import StoreNavbar from "../store/StoreNavbar.jsx";
import StoreHero from "../store/StoreHero.jsx";
import FeaturedGames from "../store/FeaturedGames.jsx"
import StoreFooter from "../store/StoreFooter.jsx";

import "../../styles/storeHome.css";
import GameCatalogue from "./GameCatalogue.jsx";

function StoreHome() {
  return (
    <main className="store-home">
      <StoreNavbar />
      <StoreHero />
      <FeaturedGames />
      <GameCatalogue />
      <StoreFooter />
    </main>
  );
}

export default StoreHome;
