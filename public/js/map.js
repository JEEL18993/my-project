maptilersdk.config.apiKey = mapToken;

const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.STREETS,
    center: listing.geometry.coordinates, // [lng, lat]
    zoom: 9
});

new maptilersdk.Marker({ color: "red" })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(new maptilersdk.Popup({ offset: 25 })
        .setHTML(`<h4>${listing.title}</h4><p>Exact location provided after booking</p>`))
    .addTo(map);