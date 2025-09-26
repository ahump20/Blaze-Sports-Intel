<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Blaze Intelligence — Monte Carlo 3D</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    html,body{height:100%;margin:0;background:#0a0b12;color:#eaeaea;font:14px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif}
    #hud{position:fixed;left:16px;top:16px;max-width:560px;background:#1118;backdrop-filter:blur(8px);padding:10px 12px;border-radius:10px;border:1px solid #ff6b35aa}
    #legend{position:fixed;right:16px;bottom:16px;background:#1118;backdrop-filter:blur(8px);padding:8px 10px;border-radius:10px;border:1px solid #4ecdc4aa}
    .sw{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px;vertical-align:middle}
    a{color:#ffb05e;text-decoration:none}
    #canvasWrap{position:fixed;inset:0}
  </style>
</head>
<body>
  <div id="hud">
    <div style="font-weight:700">Blaze Intelligence Monte Carlo — 3D</div>
    Interactive clusters:
    <b>Monthly $ (hist)</b>, <b>ROI % (hist)</b>, <b>Profit % (hist)</b>,
    <b>Mean Revenue</b>, <b>Sensitivity</b>.<br/>
    Drag = orbit • Wheel = zoom • Right-drag = pan • <kbd>L</kbd>=toggle labels • <kbd>G</kbd>=grid • <kbd>R</kbd>=reset
  </div>
  <div id="legend">
    <div><span class="sw" style="background:#ff6b35"></span>Monthly Value</div>
    <div><span class="sw" style="background:#4ecdc4"></span>ROI %</div>
    <div><span class="sw" style="background:#95e1d3"></span>Profit %</div>
    <div><span class="sw" style="background:#ffa45b"></span>Revenue (mean)</div>
    <div><span class="sw" style="background:#7c5cff"></span>Sensitivity</div>
  </div>
  <div id="canvasWrap"></div>

  <!-- Non-module, global THREE build + OrbitControls (avoids file:// module issues) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r150/three.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r150/examples/js/controls/OrbitControls.min.js"></script>

  <script>
  // ---------------------------
  // Embedded data (from your run)
  // ---------------------------
  const DATA = {
    // Monthly value histogram (from 10,000 sims)
    // Centers ($) & counts — pre-binned for 3D bars
    monthly: {
      centers: [21511.65,31602.95,41694.24,51785.54,61876.83,71968.13,82059.43,92150.72,102242.02,112333.31,122424.61,132515.91,142607.20,152698.50,162789.79,172881.09,182972.39,193063.68,203154.98,213246.27,223337.57,233428.87,243520.16,253611.46,263702.75,273794.05,283885.35,293976.64,304067.94],
      counts:  [39,247,653,1031,1238,1337,1214,1043,854,655,515,363,281,167,115,96,59,34,24,17,6,5,3,1,1,0,1,0,1]
    },
    // ROI histogram (percent)
    roi: {
      centers: [291.02,438.79,586.56,734.33,882.11,1029.88,1177.65,1325.42,1473.19,1620.97,1768.74,1916.51,2064.28,2212.05,2359.82,2507.59,2655.36,2803.14,2950.91,3098.68,3246.45,3394.22,3541.99,3689.77,3837.54,3985.31,4133.08,4280.85,4428.63],
      counts:  [13,80,228,419,600,714,793,855,836,744,622,528,436,318,261,212,166,118,87,69,47,43,30,16,12,6,3,1,1]
    },
    // Profit margin histogram (as percent points)
    profit: {
      centers: [68.97,69.99,71.00,72.01,73.02,74.03,75.04,76.05,77.06,78.07,79.08,80.09,81.10,82.11,83.12,84.13,85.14,86.15,87.16,88.17,89.18,90.19,91.20,92.21,93.22,94.23,95.24,96.25,97.26],
      counts:  [1,2,3,8,16,34,62,98,145,201,257,323,381,468,552,621,688,742,780,806,828,844,856,820,762,640,423,214,66]
    },
    // Mean revenue by stream (from report)
    revenueMean: {
      Subscription: 24234.19,
      API:          4274.05,
      Projects:     27200.17,
      Licensing:    12516.83
    },
    // Sensitivity ranking (Impact Score)
    sensitivity: [
      { factor: 'Project Revenue', impact: 0.387246 },
      { factor: 'Licensing Revenue', impact: 0.140944 },
      { factor: 'Subscription Revenue', impact: 0.066851 },
      { factor: 'API Revenue', impact: 0.043393 },
      { factor: 'Automation Savings', impact: 0.006598 },
      { factor: 'Total Costs', impact: 0.004035 }
    ],
    // For labels
    stats: {
      meanMonthly: 86096.14, medianMonthly: 80651.93,
      meanROI: 1187.62, meanProfitPct: 91.0
    }
  };

  // ---------------------------
  // Three.js scene scaffolding
  // ---------------------------
  const wrap = document.getElementById('canvasWrap');
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(wrap.clientWidth, wrap.clientHeight);
  wrap.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0b12);

  const camera = new THREE.PerspectiveCamera(55, wrap.clientWidth / wrap.clientHeight, 0.1, 2000);
  camera.position.set(0, 120, 240);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 30;
  controls.maxDistance = 800;

  // Lights
  scene.add(new THREE.HemisphereLight(0xffffff, 0x101018, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(120, 180, 120);
  key.castShadow = false;
  scene.add(key);

  // Grid & ground
  const grid = new THREE.GridHelper(1200, 60, 0x1f2937, 0x111827);
  grid.material.opacity = 0.25; grid.material.transparent = true;
  scene.add(grid);

  // Helpers
  const labels = new THREE.Group(); scene.add(labels);
  let showLabels = true, showGrid = true;

  function addLabel(text, x, y, z, color = '#eaeaea', size = 12) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const pad = 8; ctx.font = `700 ${size}px Inter, system-ui, sans-serif`;
    const w = Math.ceil(ctx.measureText(text).width) + pad*2, h = size + pad*2;
    canvas.width = w; canvas.height = h; ctx.font = `700 ${size}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(17,17,24,0.75)'; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = '#ff6b35aa'; ctx.strokeRect(0,0,w,h);
    ctx.fillStyle = color; ctx.textBaseline = 'middle'; ctx.fillText(text, pad, h/2);
    const tex = new THREE.CanvasTexture(canvas);
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    spr.scale.set(w/3, h/3, 1);
    spr.position.set(x, y, z);
    labels.add(spr);
    return spr;
  }

  // -------------
  // Bar builders
  // -------------
  const makeMat = (hex, emissive=0x000000) => new THREE.MeshStandardMaterial({
    color: hex, emissive, roughness: 0.5, metalness: 0.1
  });

  function buildBars({x0, z0, title, centers, counts, color, valueScale, barW=6, barD=6, gap=2}) {
    const group = new THREE.Group();
    const maxCount = Math.max(...counts);
    const scaleY = valueScale ?? (80 / maxCount);
    const barMat = makeMat(color, 0x111111);

    centers.forEach((_, i) => {
      const h = counts[i] * scaleY + 0.0001;
      const geo = new THREE.BoxGeometry(barW, h, barD);
      const mesh = new THREE.Mesh(geo, barMat);
      mesh.position.set(x0 + i*(barW+gap), h/2, z0);
      group.add(mesh);
    });

    // axes
    const ax = new THREE.AxesHelper(20); ax.position.set(x0-14, 0, z0-14); group.add(ax);

    // title label
    addLabel(title, x0 + (centers.length*(barW+gap))/2, 52, z0-18, '#ffd6bf');

    scene.add(group);
    return group;
  }

  function buildRevenueMeans({x0, z0}) {
    const entries = Object.entries(DATA.revenueMean);
    const vals = entries.map(e => e[1]);
    const max = Math.max(...vals);
    const scaleY = 80 / max;
    const barW=14, gap=8, barD=14;
    const mat = makeMat(0xFFA45B, 0x221100);
    const g = new THREE.Group();

    entries.forEach(([name, val], i) => {
      const h = val * scaleY;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(barW, h, barD), mat);
      mesh.position.set(x0 + i*(barW+gap), h/2, z0);
      g.add(mesh);
      addLabel(`${name}: $${val.toLocaleString()}`, mesh.position.x, h + 8, z0);
    });

    addLabel('Mean Revenue (Monthly)', x0 + (entries.length*(barW+gap))/2 - 6, 54, z0-18, '#ffe6c6');
    scene.add(g); return g;
  }

  function buildSensitivity({x0, z0}) {
    const vals = DATA.sensitivity.map(s => s.impact);
    const max = Math.max(...vals);
    const scaleX = 120 / max;
    const barH=6, gap=6, barD=14;
    const mat = makeMat(0x7C5CFF, 0x1b1550);
    const g = new THREE.Group();

    DATA.sensitivity.forEach((s, i) => {
      const w = Math.max(0.0001, s.impact * scaleX);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, barH, barD), mat);
      mesh.position.set(x0 + w/2, barH/2 + i*(barH+gap), z0);
      g.add(mesh);
      addLabel(`${s.factor}: ${s.impact.toFixed(3)}`, x0 + w + 8, mesh.position.y, z0, '#d8d7ff');
    });

    addLabel('Sensitivity (Impact Score, wider is stronger)', x0 + 60, DATA.sensitivity.length*(barH+gap)+8, z0-18, '#d8d7ff');
    scene.add(g); return g;
  }

  // -----------------------
  // Build all five clusters
  // -----------------------
  const CLUSTER_GAP = 120;

  const groupMonthly = buildBars({
    x0: -520, z0:  40, title: 'Monthly Value — Distribution (counts)',
    centers: DATA.monthly.centers, counts: DATA.monthly.counts, color: 0xff6b35
  });

  const groupROI = buildBars({
    x0: -520, z0: -120, title: 'ROI % — Distribution (counts)',
    centers: DATA.roi.centers, counts: DATA.roi.counts, color: 0x4ecdc4
  });

  const groupProfit = buildBars({
    x0: -520, z0: -280, title: 'Profit Margin % — Distribution (counts)',
    centers: DATA.profit.centers, counts: DATA.profit.counts, color: 0x95e1d3
  });

  const groupRevenue = buildRevenueMeans({ x0:  80, z0: -80 });
  const groupSens    = buildSensitivity({  x0:  80, z0: -260 });

  // Highlight key stats as floating labels
  addLabel(`Mean $/mo: $${DATA.stats.meanMonthly.toLocaleString()}`, -520, 92, 70, '#ffb790');
  addLabel(`Mean ROI: ${DATA.stats.meanROI.toFixed(1)}%`, -520, 92, -90, '#b7fff5');
  addLabel(`Mean Profit: ${DATA.stats.meanProfitPct.toFixed(1)}%`, -520, 92, -250, '#dbfff7');

  // -----------------
  // Resize & animate
  // -----------------
  window.addEventListener('resize', () => {
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    camera.aspect = wrap.clientWidth / wrap.clientHeight;
    camera.updateProjectionMatrix();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'l') { showLabels = !showLabels; labels.visible = showLabels; }
    if (e.key.toLowerCase() === 'g') { showGrid = !showGrid; grid.visible = showGrid; }
    if (e.key.toLowerCase() === 'r') { controls.reset(); camera.position.set(0,120,240); }
  });

  (function animate(){
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  })();
  </script>
</body>
</html>
