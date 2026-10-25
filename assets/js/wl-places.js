/* Places visited, shared by the Wanderlust globe and the command palette.
   id = ISO 3166-1 numeric code used by world-atlas. To add a place, add a city (name, lat, lng) or a country entry. */
window.WL_PLACES = [
    { continent: "Asia", country: "China", flag: "🇨🇳", id: "156", cities: [
      ["Beijing", 39.9042, 116.4074], ["Changsha", 28.2282, 112.9388], ["Chengdu", 30.5728, 104.0668], ["Chongqing", 29.5630, 106.5516],
      ["Dalian", 38.9140, 121.6147], ["Ganzhou", 25.8311, 114.9336], ["Guangzhou", 23.1291, 113.2644], ["Guilin", 25.2736, 110.2900],
      ["Hangzhou", 30.2741, 120.1551], ["Jinan", 36.6512, 117.1201], ["Nanchang", 28.6820, 115.8579], ["Nanjing", 32.0603, 118.7969],
      ["Qingdao", 36.0671, 120.3826], ["Shanghai", 31.2304, 121.4737], ["Shenzhen", 22.5431, 114.0579], ["Suzhou", 31.2990, 120.5853],
      ["Wuhan", 30.5928, 114.3055], ["Xiamen", 24.4798, 118.0894]] },
    { continent: "Asia", country: "Hong Kong", flag: "🇭🇰", id: "344", cities: [["Hong Kong", 22.3193, 114.1694]] },
    { continent: "Asia", country: "Malaysia", flag: "🇲🇾", id: "458", cities: [["Kuala Lumpur", 3.1390, 101.6869]] },
    { continent: "Asia", country: "Singapore", flag: "🇸🇬", id: "702", cities: [["Singapore", 1.3521, 103.8198]] },
    { continent: "Asia", country: "United Arab Emirates", flag: "🇦🇪", id: "784", cities: [["Abu Dhabi", 24.4539, 54.3773], ["Dubai", 25.2048, 55.2708]] },
    { continent: "Europe", country: "France", flag: "🇫🇷", id: "250", cities: [["Nice", 43.7102, 7.2620], ["Paris", 48.8566, 2.3522]] },
    { continent: "Europe", country: "Germany", flag: "🇩🇪", id: "276", cities: [
      ["Frankfurt", 50.1109, 8.6821], ["Konstanz", 47.6603, 9.1758], ["Munich", 48.1351, 11.5820], ["Stuttgart", 48.7758, 9.1829]] },
    { continent: "Europe", country: "Iceland", flag: "🇮🇸", id: "352", cities: [
      ["Bláskógabyggð", 64.1690, -20.4900], ["Fjaðrárgljúfur", 63.7713, -18.1717], ["Grundarfjörður", 64.9243, -23.2531], ["Hellissandur", 64.9143, -23.8740],
      ["Jökulsárlón", 64.0784, -16.2306], ["Reykjavík", 64.1466, -21.9426], ["Seljalandsfoss", 63.6156, -19.9886], ["Vík", 63.4186, -19.0060],
      ["Þingvellir", 64.2559, -21.1299]] },
    { continent: "Europe", country: "Italy", flag: "🇮🇹", id: "380", cities: [["Turin", 45.0703, 7.6869]] },
    { continent: "Europe", country: "Monaco", flag: "🇲🇨", id: "492", cities: [["Monaco", 43.7384, 7.4246]] },
    { continent: "Europe", country: "Spain", flag: "🇪🇸", id: "724", cities: [["Madrid", 40.4168, -3.7038]] },
    { continent: "Europe", country: "Switzerland", flag: "🇨🇭", id: "756", cities: [
      ["Bern", 46.9480, 7.4474], ["Geneva", 46.2044, 6.1432], ["Grindelwald", 46.6242, 8.0414], ["Interlaken", 46.6863, 7.8632],
      ["Lucerne", 47.0502, 8.3093], ["Spiez", 46.6860, 7.6800], ["Thun", 46.7580, 7.6280], ["Zermatt", 46.0207, 7.7491],
      ["Zurich", 47.3769, 8.5417]] },
    { continent: "Europe", country: "Türkiye", flag: "🇹🇷", id: "792", cities: [["Istanbul", 41.0082, 28.9784]] },
    { continent: "Europe", country: "United Kingdom", flag: "🇬🇧", id: "826", cities: [
      ["Brighton", 50.8225, -0.1372], ["Cambridge", 52.2053, 0.1218], ["Edinburgh", 55.9533, -3.1883], ["London", 51.5074, -0.1278],
      ["Manchester", 53.4808, -2.2426], ["Oxford", 51.7520, -1.2577]] },
    { continent: "North America", country: "Bahamas", flag: "🇧🇸", id: "044", cities: [["Bimini", 25.7280, -79.2966]] },
    { continent: "North America", country: "Turks and Caicos", flag: "🇹🇨", id: "796", cities: [["Grand Turk", 21.4675, -71.1389]] },
    { continent: "North America", country: "United States", flag: "🇺🇸", id: "840", cities: [
      ["Boston", 42.3601, -71.0589], ["Detroit", 42.3314, -83.0458], ["Ithaca", 42.4440, -76.5019], ["Las Vegas", 36.1699, -115.1398],
      ["Los Angeles", 34.0522, -118.2437], ["Miami", 25.7617, -80.1918], ["Monterey", 36.6002, -121.8947], ["New York", 40.7128, -74.0060],
      ["Philadelphia", 39.9526, -75.1652], ["San Francisco", 37.7749, -122.4194], ["Santa Barbara", 34.4208, -119.6982], ["Washington, D.C.", 38.9072, -77.0369]] }
  ];
