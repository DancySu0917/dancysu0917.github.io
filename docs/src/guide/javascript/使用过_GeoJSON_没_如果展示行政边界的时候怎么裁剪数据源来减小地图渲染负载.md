# 使用过 GeoJSON 没，如果展示行政边界的时候怎么裁剪数据源来减小地图渲染负载？（了解）

**题目**: 使用过 GeoJSON 没，如果展示行政边界的时候怎么裁剪数据源来减小地图渲染负载？（了解）

**答案**:

## GeoJSON 简介

GeoJSON 是一种用于表示地理空间数据的开放标准格式，基于 JSON。它支持点、线、多边形等几何类型，以及包含这些几何体的特征（Feature）和特征集合（FeatureCollection）。

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [120.712, 31.234]
      },
      "properties": {
        "name": "上海"
      }
    }
  ]
}
```

## 地图渲染负载优化策略

### 1. 空间范围裁剪（Spatial Clipping）

只加载当前视口范围内的数据：

```javascript
// 计算当前视口的边界框
function getViewportBounds(map) {
  const bounds = map.getBounds();
  return {
    minX: bounds.getWest(),
    minY: bounds.getSouth(),
    maxX: bounds.getEast(),
    maxY: bounds.getNorth()
  };
}

// 空间裁剪函数
function clipFeaturesByBounds(features, bounds) {
  return features.filter(feature => {
    const geometry = feature.geometry;
    const coordinates = getCoordinates(geometry);
    
    // 检查几何体是否与视口相交
    return isGeometryInBounds(coordinates, bounds);
  });
}

// 简化的边界检查函数
function isGeometryInBounds(coordinates, bounds) {
  // 遍历坐标点，检查是否在边界内
  for (let coord of coordinates) {
    if (Array.isArray(coord[0])) {
      // 处理多维坐标（如多边形）
      return isGeometryInBounds(coord, bounds);
    }
    
    const [lng, lat] = coord;
    if (lng >= bounds.minX && lng <= bounds.maxX && 
        lat >= bounds.minY && lat <= bounds.maxY) {
      return true;
    }
  }
  return false;
}
```

### 2. 数据简化（Simplification）

使用 Douglas-Peucker 算法或其他简化算法减少坐标点：

```javascript
// Douglas-Peucker 算法实现
function douglasPeucker(points, epsilon) {
  if (points.length <= 2) return points;
  
  // 找到距离起点和终点连线最远的点
  let maxDistance = 0;
  let maxIndex = 0;
  
  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }
  
  if (maxDistance > epsilon) {
    // 递归处理两段
    const leftPart = douglasPeucker(points.slice(0, maxIndex + 1), epsilon);
    const rightPart = douglasPeucker(points.slice(maxIndex), epsilon);
    return leftPart.slice(0, -1).concat(rightPart);
  } else {
    // 返回起点和终点
    return [points[0], points[points.length - 1]];
  }
}

// 计算点到直线的垂直距离
function perpendicularDistance(point, lineStart, lineEnd) {
  const A = point[0] - lineStart[0];
  const B = point[1] - lineStart[1];
  const C = lineEnd[0] - lineStart[0];
  const D = lineEnd[1] - lineStart[1];
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) param = dot / lenSq;
  
  let xx, yy;
  
  if (param < 0) {
    xx = lineStart[0];
    yy = lineStart[1];
  } else if (param > 1) {
    xx = lineEnd[0];
    yy = lineEnd[1];
  } else {
    xx = lineStart[0] + param * C;
    yy = lineStart[1] + param * D;
  }
  
  const dx = point[0] - xx;
  const dy = point[1] - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
}

// 对 GeoJSON 简化
function simplifyGeoJSON(geojson, tolerance) {
  if (geojson.type === 'FeatureCollection') {
    return {
      ...geojson,
      features: geojson.features.map(feature => simplifyFeature(feature, tolerance))
    };
  }
  return simplifyFeature(geojson, tolerance);
}

function simplifyFeature(feature, tolerance) {
  const simplifiedGeometry = simplifyGeometry(feature.geometry, tolerance);
  return {
    ...feature,
    geometry: simplifiedGeometry
  };
}

function simplifyGeometry(geometry, tolerance) {
  switch (geometry.type) {
    case 'Point':
    case 'MultiPoint':
      return geometry;
    case 'LineString':
      return {
        ...geometry,
        coordinates: douglasPeucker(geometry.coordinates, tolerance)
      };
    case 'Polygon':
      return {
        ...geometry,
        coordinates: geometry.coordinates.map(ring => 
          douglasPeucker(ring, tolerance)
        )
      };
    case 'MultiPolygon':
      return {
        ...geometry,
        coordinates: geometry.coordinates.map(polygon => 
          polygon.map(ring => douglasPeucker(ring, tolerance))
        )
      };
    default:
      return geometry;
  }
}
```

### 3. 分层加载（Progressive Loading）

根据缩放级别加载不同精度的数据：

```javascript
class ProgressiveGeoLoader {
  constructor(map) {
    this.map = map;
    this.cache = new Map(); // 缓存不同精度的数据
  }
  
  async loadGeoData(zoomLevel) {
    // 根据缩放级别选择合适精度的数据
    const precision = this.getRequiredPrecision(zoomLevel);
    const cacheKey = `${precision}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // 从服务器加载对应精度的数据
    const data = await this.fetchDataByPrecision(precision);
    this.cache.set(cacheKey, data);
    
    return data;
  }
  
  getRequiredPrecision(zoomLevel) {
    // 根据缩放级别返回需要的精度
    if (zoomLevel < 5) return 'low';
    if (zoomLevel < 10) return 'medium';
    return 'high';
  }
  
  async fetchDataByPrecision(precision) {
    const response = await fetch(`/geo-data/${precision}`);
    return response.json();
  }
  
  // 监听地图缩放事件
  setupZoomListener() {
    this.map.on('zoomend', async () => {
      const zoom = this.map.getZoom();
      const data = await this.loadGeoData(zoom);
      
      // 更新地图显示
      this.updateMapDisplay(data);
    });
  }
}
```

### 4. 瓦片化处理（Tiling）

将大数据集分割成小瓦片：

```javascript
// GeoJSON 瓦片化函数
function tileGeoJSON(geojsonData, tileBounds) {
  const tiles = {};
  
  // 遍历地理数据，按瓦片边界分割
  for (const feature of geojsonData.features) {
    const tileIds = getFeatureTileIds(feature, tileBounds);
    
    for (const tileId of tileIds) {
      if (!tiles[tileId]) {
        tiles[tileId] = [];
      }
      
      // 裁剪要素以适应瓦片边界
      const clippedFeature = clipFeatureToBounds(feature, tileBounds[tileId]);
      if (clippedFeature) {
        tiles[tileId].push(clippedFeature);
      }
    }
  }
  
  return tiles;
}

// 获取要素所属的瓦片ID
function getFeatureTileIds(feature, tileBounds) {
  const bounds = getFeatureBounds(feature);
  const tileIds = [];
  
  for (const [tileId, tileBound] of Object.entries(tileBounds)) {
    if (isBoundsIntersect(bounds, tileBound)) {
      tileIds.push(tileId);
    }
  }
  
  return tileIds;
}
```

### 5. 使用专业的地图库优化

使用 Mapbox GL、Leaflet 等库的内置优化功能：

```javascript
// 使用 Mapbox GL 的数据驱动样式和过滤
map.on('load', () => {
  map.addSource('admin-boundaries', {
    'type': 'geojson',
    'data': '/path/to/admin-boundaries.geojson',
    'maxzoom': 14, // 设置最大缩放级别
    'buffer': 0,   // 减少缓冲区
    'tolerance': 0.375 // 简化容差
  });
  
  map.addLayer({
    'id': 'admin-boundaries',
    'type': 'line',
    'source': 'admin-boundaries',
    'filter': ['==', 'admin_level', 2], // 过滤特定行政级别
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': {
      'line-color': '#000000',
      'line-width': 1
    }
  });
});

// 动态过滤数据
function updateBoundaryFilter(adminLevel) {
  map.setFilter('admin-boundaries', ['==', 'admin_level', adminLevel]);
}
```

### 6. 数据预处理

在服务端进行数据预处理：

```javascript
// 服务端数据预处理示例（Node.js）
const turf = require('@turf/turf');

// 简化几何体
function preprocessGeoJSON(geojsonData, tolerance = 0.01) {
  const simplifiedFeatures = geojsonData.features.map(feature => {
    const simplifiedGeometry = turf.simplify(
      feature, 
      { tolerance: tolerance, highQuality: false }
    );
    return simplifiedGeometry;
  });
  
  return {
    type: 'FeatureCollection',
    features: simplifiedFeatures
  };
}

// 裁剪到特定区域
function clipToRegion(geojsonData, bbox) {
  const bboxPolygon = turf.bboxPolygon(bbox);
  const clippedFeatures = geojsonData.features
    .map(feature => turf.intersect(feature, bboxPolygon))
    .filter(Boolean); // 过滤掉 null 值
  
  return {
    type: 'FeatureCollection',
    features: clippedFeatures
  };
}
```

## 总结

优化 GeoJSON 数据渲染负载的关键策略包括：

1. **空间裁剪**：只加载视口内的数据
2. **数据简化**：减少坐标点数量
3. **分层加载**：根据缩放级别加载不同精度
4. **瓦片化**：将大数据分割成小块
5. **使用专业库**：利用地图库的内置优化
6. **服务端预处理**：提前处理数据

这些技术可以显著减少渲染负载，提升地图应用的性能和用户体验。
