# hexo-collector-map

A Hexo plugin that allows you to embed interactive maps with multiple landmarks in your articles.

## Features
- Supports multiple landmarks with custom labels.
- Adjustable zoom level, map size, and map layers.
- Uses Leaflet.js and Google Maps tiles for rendering.
- Simple tag-based syntax for easy integration.

## Installation
```sh
npm install hexo-tag-map --save
```

## Usage
Insert the following tag into your Hexo posts:
```md
{% map lon1, lat1, label1, lon2, lat2, label2, zoom, width, height, layer %}
```
Example with multiple landmarks:
```md
{% map 114.533983,22.569441,Beach,114.123,22.456,Mountain,14,100%,360px,1 %}
```

## Parameters
- `lon` / `lat`: Longitude and latitude of the landmark.
- `label`: Optional text label for the marker.
- `zoom`: Zoom level (1-20, default: 14).
- `width` / `height`: Map dimensions (default: 100%, 360px).
- `layer`: Map layer (1 = Normal, 2 = Satellite, 3 = Satellite with labels).

## License
Apache-2.0

For more details, visit [official documentation](https://guole.fun/posts/41887/).

