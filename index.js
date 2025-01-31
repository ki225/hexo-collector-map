// A map plugin for Hexo, which supports rendering beautiful interactive maps on article pages.
// * Original Author: Guole
// * * Modified by: Kiki
// * Website: https://guole.fun/
// * License: Apache-2.0
// * License Link: https://guole.fun/posts/41887//blob/main/LICENSE
// {% map longitude, latitude, text, zoom level, width, height, layer %}
// Example (multiple landmarks): {% map 114.533983, 22.569441, Xichong Beach, 114.123, 22.456, Another Location, 14, 100%, 360px, 1 %}


'use strict';

const css_text = `<link rel="stylesheet" href="//unpkg.com/hexo-tag-map/lib/leaflet@1.7.1.css">`;
const js_text = `<script data-pjax src="//unpkg.com/hexo-tag-map/lib/leaflet@1.7.1.js"></script>`;
const ChineseTmsProviders = `<script data-pjax src="//unpkg.com/hexo-tag-map/lib/leaflet.ChineseTmsProviders@1.0.4.js"></script>`;
const proj4 = `<script data-pjax src="//unpkg.com/hexo-tag-map/lib/proj4@2.4.3.js"></script>`;
const proj4leaflet = `<script data-pjax src="//unpkg.com/hexo-tag-map/lib/proj4leaflet@1.0.1.min.js"></script>`;
let google_txt = "Google Maps";

function google(args) {
    args = args.join(' ').split(',').map(arg => arg.trim());
    
    // 初始化全局参数
    let zoom = 14;
    let mapWidth = '100%';
    let mapHeight = '360px';
    let tuceng = null;

    // 确定全局参数数量
    let g;
    for (g = 4; g >= 0; g--) {
        if (args.length >= g && (args.length - g) % 3 === 0) break;
    }
    if (g < 0) throw new Error('参数格式错误');

    // 提取全局参数
    const globalArgs = args.slice(-g);
    args = args.slice(0, -g);

    if (g >= 1) zoom = globalArgs[0];
    if (g >= 2) mapWidth = globalArgs[1];
    if (g >= 3) mapHeight = globalArgs[2];
    if (g >= 4) tuceng = globalArgs[3];

    // 解析地標
    const landmarks = [];
    for (let i = 0; i < args.length; i += 3) {
        landmarks.push({
            lon: args[i],
            lat: args[i + 1],
            text: args[i + 2] || ''
        });
    }

    // 参数验证
    landmarks.forEach(({ lon, lat }) => {
        if (!/^[-+]?\d+\.?\d*$/.test(lon) || !/^[-+]?\d+\.?\d*$/.test(lat) ||
            lon < -180 || lon > 180 || lat < -90 || lat > 90) {
            throw new Error('經緯度格式錯誤');
        }
    });
    if (!/^[1-9]\d*$/.test(zoom) || zoom < 1 || zoom > 20) {
        throw new Error('縮放級別是 1-20 的整數');
    }

    // 生成地图容器
    const mapid = `map-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    let result = css_text + js_text + ChineseTmsProviders + proj4 + proj4leaflet;
    result += `<div id="${mapid}" style="max-width:${mapWidth};height:${mapHeight};margin:0 auto;border-radius:5px;"></div>`;
    result += '<script>';

    // 初始化地图
    result += `
        var normalMap = L.tileLayer.chinaProvider('Google.Normal.Map',{attribution:'${google_txt}'}),
            satelliteMap = L.tileLayer.chinaProvider('Google.Satellite.Map',{attribution:'${google_txt}'}),
            routeMap = L.tileLayer.chinaProvider('Google.Satellite.Annotion',{attribution:'${google_txt}'});
        var baseLayers = {"一般地圖":normalMap,"衛星圖":satelliteMap,"衛星標註":routeMap};
        var mymap = L.map("${mapid}",{zoomControl:false, layers:[${tuceng === '2' ? 'satelliteMap' : tuceng === '3' ? 'routeMap' : 'normalMap'}]});
        L.control.layers(baseLayers).addTo(mymap);
        L.control.zoom({zoomInTitle:'放大',zoomOutTitle:'缩小'}).addTo(mymap);
    `;

    // 添加地標
    landmarks.forEach(({ lon, lat, text }) => {
        result += `
            L.marker([${lat},${lon}])
                .addTo(mymap)
                .bindPopup("${text.replace(/"/g, '\\"')}")
                .openPopup();
        `;
    });

    // 自动调整视野
    if (landmarks.length > 1) {
        result += 'var bounds = L.latLngBounds();';
        landmarks.forEach(({ lat, lon }) => {
            result += `bounds.extend([${lat},${lon}]);`;
        });
        result += 'mymap.fitBounds(bounds);';
    } else {
        result += `mymap.setView([${landmarks[0].lat},${landmarks[0].lon}],${zoom});`;
    }

    result += '</script>';
    return result;
}

// official document: https://hexo.io/api/tag
hexo.extend.tag.register('collectorMap', google);
hexo.extend.tag.register('CollectorMap', google);