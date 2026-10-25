import {
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "../findYourFit.css";

import {
  getListings,
} from "../../../data/listings";


function LocateUser({
  onLocated,
}) {
  const map = useMap();


  const locateUser = () => {

    if (!navigator.geolocation) {

      alert(
        "Location is not supported by your browser."
      );

      return;
    }


    navigator.geolocation.getCurrentPosition(

      (position) => {

        const userPosition = [
          position.coords.latitude,
          position.coords.longitude,
        ];


        map.flyTo(
          userPosition,
          15,
          {
            duration: 1.5,
          }
        );


        onLocated(
          userPosition
        );
      },


      () => {

        alert(
          "We couldn't access your location. Please allow location access in your browser."
        );

      },


      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }

    );
  };


  return (
    <button
      type="button"
      className="map-location-button"
      onClick={locateUser}
    >
      Explore Nearby Meals
      <span>
        ⌖
      </span>
    </button>
  );
}


function FindYourFit() {
  const navigate = useNavigate();

  const [meals, setMeals] =
    useState(() =>
      getListings()
    );


  const [userLocation, setUserLocation] =
    useState(null);


  useEffect(() => {

    const loadListings = () => {
      setMeals(
        getListings()
      );
    };


    loadListings();


    window.addEventListener(
      "storage",
      loadListings
    );


    window.addEventListener(
      "mealshare:listings-updated",
      loadListings
    );


    const interval =
      window.setInterval(
        loadListings,
        1000
      );


    return () => {

      window.removeEventListener(
        "storage",
        loadListings
      );

      window.removeEventListener(
        "mealshare:listings-updated",
        loadListings
      );

      window.clearInterval(
        interval
      );

    };

  }, []);


  const totalMeals =
    meals.reduce(
      (total, meal) =>
        total +
        Number(
          meal.mealsLeft || 0
        ),
      0
    );


  return (
    <section className="find-your-fit">

      <div className="find-your-fit-container">


        {/* =====================================================
            HEADING
        ===================================================== */}

        <div className="find-your-fit-heading">

          <span>
            Find Your Fit
          </span>

          <h2>
            Healthy Meals
            <br />
            That Fit Your Life
          </h2>

          <p>
            Discover nutritious, delicious
            meals from trusted local partners
            near you in{" "}
            <strong>
              Vadodara.
            </strong>
          </p>

        </div>


        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div className="find-your-fit-content">


          {/* ===================================================
              MAP
          =================================================== */}

          <div className="vadodara-map">

            <MapContainer
              center={[
                22.3072,
                73.1812,
              ]}
              zoom={13}
              zoomControl={false}
              scrollWheelZoom={true}
              className="live-map"
            >

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />


              <ZoomControl
                position="topright"
              />


              {/* ===============================================
                  LIVE LISTINGS
              =============================================== */}

              {meals.map((meal) => (

                meal.position && (

                  <CircleMarker
                    key={meal.id}
                    center={
                      meal.position
                    }
                    radius={9}
                    pathOptions={{
                      color: "#f7f1e8",
                      weight: 3,
                      fillColor:
                        "#7d1f2a",
                      fillOpacity: 1,
                    }}
                  >

                    <Popup>

                      <div className="meal-popup">

                        <strong>
                          {meal.name}
                        </strong>

                        <span>
                          {meal.mealsLeft}{" "}
                          {Number(
                            meal.mealsLeft
                          ) === 1
                            ? "Meal Left"
                            : "Meals Left"}
                        </span>

                      </div>

                    </Popup>

                  </CircleMarker>

                )

              ))}


              {/* USER LOCATION */}

              {userLocation && (

                <CircleMarker
                  center={
                    userLocation
                  }
                  radius={11}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 4,
                    fillColor:
                      "#ef5361",
                    fillOpacity: 1,
                  }}
                >

                  <Popup>

                    <div className="meal-popup">

                      <strong>
                        You are here
                      </strong>

                      <span>
                        Showing meals near your location
                      </span>

                    </div>

                  </Popup>

                </CircleMarker>

              )}


              <LocateUser
                onLocated={
                  setUserLocation
                }
              />

            </MapContainer>


            {/* =================================================
                MAP OVERLAY
            ================================================= */}

            <div className="map-overlay">

              <span className="map-label">

                <span className="map-pin-dot" />

                Meals Near You

              </span>


              <h3>
                <span>Vadodara</span>
                <em>City</em>
              </h3>


              <p>
                Fresh meals. Local partners.
                <br />
                Rescued with care.
              </p>


              <div className="map-availability">

                <strong>
                  {totalMeals}
                  {" "}
                  Meals Available
                </strong>

                <span>
                  Near You Right Now
                </span>

              </div>

            </div>

          </div>


          {/* ===================================================
              MEAL PLAN CARD
          =================================================== */}

          <aside className="meal-plan-card">

            <div className="meal-plan-decoration">

              <span />
              <span />
              <span />

            </div>


            <div className="meal-plan-icon">
              ♧
            </div>


            <h3>
              Choose a meal plan
              <br />
              that fits your lifestyle
              <br />
              and goals.
            </h3>


            <button
              type="button"
              id="meal-plan-order-now-btn"
              onClick={() => {
                window.scrollTo(0, 0);
                navigate("/meals");
              }}
            >
              Order Now
              <span>
                →
              </span>
            </button>


            <div className="meal-plan-divider" />


            <p>

              <span className="meal-plan-heart">
                ♡
              </span>

              Join{" "}
              MealSharers in Vadodara

            </p>

          </aside>

        </div>

      </div>

    </section>
  );
}


export default FindYourFit;