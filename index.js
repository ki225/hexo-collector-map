// // A map plugin for Hexo, which supports rendering beautiful interactive maps on article pages.
// // * Original Author: Guole
// // * * Modified by: Kiki
// // * Website: https://guole.fun/
// // * License: Apache-2.0
// // * License Link: https://guole.fun/posts/41887//blob/main/LICENSE
// // {% map longitude, latitude, text, zoom level, width, height, layer %}
// // Example (multiple landmarks): {% map 114.533983, 22.569441, Xichong Beach, 114.123, 22.456, Another Location, 14, 100%, 360px, 1 %}


// 'use strict';

const css_text = `<link rel="stylesheet" href="//unpkg.com/hexo-tag-map/lib/leaflet@1.7.1.css">`;
const js_text = `<script data-pjax src="//unpkg.com/hexo-tag-map/lib/leaflet@1.7.1.js"></script>`;
const ChineseTmsProviders = `<script data-pjax src="//unpkg.com/hexo-tag-map/lib/leaflet.ChineseTmsProviders@1.0.4.js"></script>`;
const proj4 = `<script data-pjax src="//unpkg.com/hexo-tag-map/lib/proj4@2.4.3.js"></script>`;
const proj4leaflet = `<script data-pjax src="//unpkg.com/hexo-tag-map/lib/proj4leaflet@1.0.1.min.js"></script>`;
let google_txt = "Google Maps";


'use strict';

const fs = require("fs");
const path = require("path");

/**
 * 遍歷 Hexo 部落格的 `_posts` 目錄，列出所有文章
 * @param {string} hexoRoot - Hexo 專案的根目錄
 * @returns {Array} - 回傳所有文章檔案的列表
 */
function listAllPosts(hexoRoot = process.cwd()) {
  try {
    const postsDir = path.join(hexoRoot, "source", "_posts");

    // 確保 _posts 目錄存在
    if (!fs.existsSync(postsDir)) {
      throw new Error(`Hexo posts directory not found: ${postsDir}`);
    }

    // 讀取 _posts 目錄下的所有檔案
    const files = fs.readdirSync(postsDir);

    // 過濾出 Markdown 檔案並取得完整路徑
    const postFiles = files
      .filter(file => file.endsWith(".md"))
      .map(file => ({
        title: path.basename(file, ".md"), // 檔名作為標題
        path: path.join(postsDir, file), // 完整路徑
      }));

    console.log("postFiles:", postFiles);
    return postFiles;
  } catch (error) {
    console.error("Error listing posts:", error);
    return [];
  }
}

function list_posts_tags(args) {
    let result = '';
  
    const posts = listAllPosts();  // 確保先拿到所有文章
    for (let post of posts) {
      try {
        const data = fs.readFileSync(post.path, 'utf8');
        const tagRegex = /tags:\s*\[([^\]]*)\]/;
        const match = data.match(tagRegex);
  
        if (match) {
          const tags = match[1].split(',').map(tag => tag.trim().replace(/['"]/g, ''));
          if (tags.includes('coffeeSeeker')) {
            result += `<li><a>${post.title}</a></li>`;
          }
        } else {
          result += `<li>${post.title}</li>`;
        }
      } catch (err) {
        console.error(`Error reading file: ${post.path}`, err);
      }
    }
    return result;
}

function getLatitudeFromPost(postContent) {
    const latitudeRegex = /latitude:\s*(-?\d+\.\d+)/;  // 假設經度是以 latitude: 40.748817 形式存在
    const match = postContent.match(latitudeRegex);
    return match ? parseFloat(match[1]) : null;
}
  
function getLongitudeFromPost(postContent) {
    const longitudeRegex = /longitude:\s*(-?\d+\.\d+)/;  // 假設經度是以 longitude: -73.985428 形式存在
    const match = postContent.match(longitudeRegex);
    return match ? parseFloat(match[1]) : null;
}

function coffeespot(args) {
  const posts = listAllPosts();  // 獲取所有的文章資料
  let markers = [];

  // 設定地圖的寬度和高度
  const mapWidth = '100%';  
  const mapHeight = '400px'; 
  const tuceng = '1';
  const zoom = 12;

  // 遍歷所有貼文
  for (let post of posts) {
    try {
      const data = fs.readFileSync(post.path, 'utf8');  // 讀取文章內容
      const tagRegex = /tags:\s*\[([^\]]*)\]/;
      const match = data.match(tagRegex);

      if (match) {
        const tags = match[1].split(',').map(tag => tag.trim().replace(/['"]/g, ''));
        if (tags.includes('coffeeSeeker')) {
          // 確保文章內有經緯度資料
          const latitude = getLatitudeFromPost(data); // 假設你有一個方法來從文章中獲取經度
          const longitude = getLongitudeFromPost(data); // 假設你有一個方法來從文章中獲取緯度

          if (latitude && longitude) {
            markers.push({
              title: post.title,
              latitude: latitude,
              longitude: longitude
            });
          }
        }
      }
    } catch (err) {
      console.error(`Error reading file: ${post.path}`, err);
    }
  }

  // 若找不到符合條件的標註，顯示提示訊息
  if (markers.length === 0) {
    return '<p>No posts found with the tag "coffeeSeeker" that contain location data.</p>';
  }

  // 生成地圖容器的 ID
  const mapid = `map-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  let result = css_text + js_text + ChineseTmsProviders + proj4 + proj4leaflet;
  result += `<div id="${mapid}" style="max-width:${mapWidth};height:${mapHeight};margin:0 auto;border-radius:5px;"></div>`;
  result += '<script>';

  // 初始化地圖設置
  result += `
      var normalMap = L.tileLayer.chinaProvider('Google.Normal.Map',{attribution:'${google_txt}'}),
          satelliteMap = L.tileLayer.chinaProvider('Google.Satellite.Map',{attribution:'${google_txt}'}),
          routeMap = L.tileLayer.chinaProvider('Google.Satellite.Annotion',{attribution:'${google_txt}'});
      var baseLayers = {"一般地圖":normalMap,"衛星圖":satelliteMap,"衛星標註":routeMap};
      var mymap = L.map("${mapid}",{zoomControl:false, layers:[${tuceng === '2' ? 'satelliteMap' : tuceng === '3' ? 'routeMap' : 'normalMap'}]});
      L.control.layers(baseLayers).addTo(mymap);
      L.control.zoom({zoomInTitle:'放大',zoomOutTitle:'縮小'}).addTo(mymap);
  `;

  // 添加標註至地圖
  markers.forEach(function(marker) {
    result += `
        L.marker([${marker.latitude},${marker.longitude}])
            .addTo(mymap)
            .bindPopup("<b>${marker.title}</b>")
            .openPopup();
    `;
  });

  // 如果有多個標註，調整視野範圍
  if (markers.length > 1) {
    result += 'var bounds = L.latLngBounds();';
    markers.forEach(function(marker) {
      result += `bounds.extend([${marker.latitude},${marker.longitude}]);`;
    });
    result += 'mymap.fitBounds(bounds);';
  } else {
    result += `mymap.setView([${markers[0].latitude},${markers[0].longitude}], ${zoom});`;
  }

  result += '</script>';
  return result;
}

hexo.extend.tag.register('collectorMap', coffeespot);

