// Shared variables
let scene1, camera1, renderer1, controls1, mesh1;
let scene2, camera2, renderer2, controls2, mesh2;
let scene3, camera3, renderer3, controls3, mesh3;
let customScene, customCamera, customRenderer, customControls, customMesh;

const scenes = [];
const cameras = [];
const controlsArr = [];
const meshes = [];

// Material with metallic look
const metalMaterial = new THREE.MeshStandardMaterial({
  color: 0x8899aa,
  metalness: 0.7,
  roughness: 0.3,
  flatShading: false
});

const blueMaterial = new THREE.MeshStandardMaterial({
  color: 0x4a9eff,
  metalness: 0.5,
  roughness: 0.4,
  flatShading: false
});

function initViewer(containerId, geometry, material) {
  const container = document.getElementById(containerId);
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0d12);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(3, 3, 3);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const backLight = new THREE.DirectionalLight(0x4a9eff, 0.3);
  backLight.position.set(-5, -5, -5);
  scene.add(backLight);

  const gridHelper = new THREE.GridHelper(10, 20, 0x2a3040, 0x1a2030);
  scene.add(gridHelper);

  const mesh = new THREE.Mesh(geometry, material.clone());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  geometry.computeBoundingBox();
  const center = new THREE.Vector3();
  geometry.boundingBox.getCenter(center);
  mesh.position.sub(center);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1;

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });

  return { scene, camera, renderer, controls, mesh };
}

function createGearGeometry() {
  const shape = new THREE.Shape();
  const teeth = 12;
  const innerRadius = 0.6;
  const outerRadius = 1;

  for (let i = 0; i < teeth; i++) {
    const angle1 = (i / teeth) * Math.PI * 2;
    const angle2 = ((i + 0.3) / teeth) * Math.PI * 2;
    const angle3 = ((i + 0.5) / teeth) * Math.PI * 2;
    const angle4 = ((i + 0.8) / teeth) * Math.PI * 2;

    if (i === 0) {
      shape.moveTo(Math.cos(angle1) * innerRadius, Math.sin(angle1) * innerRadius);
    }
    shape.lineTo(Math.cos(angle2) * innerRadius, Math.sin(angle2) * innerRadius);
    shape.lineTo(Math.cos(angle2) * outerRadius, Math.sin(angle2) * outerRadius);
    shape.lineTo(Math.cos(angle3) * outerRadius, Math.sin(angle3) * outerRadius);
    shape.lineTo(Math.cos(angle4) * innerRadius, Math.sin(angle4) * innerRadius);
  }

  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.25, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const extrudeSettings = { depth: 0.3, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05 };
  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

function createBracketGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(1.5, 0);
  shape.lineTo(1.5, 0.3);
  shape.lineTo(0.3, 0.3);
  shape.lineTo(0.3, 1.2);
  shape.lineTo(0, 1.2);
  shape.lineTo(0, 0);

  const extrudeSettings = { depth: 0.8, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03 };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

function createConnectorGeometry() {
  const bodyGeom = new THREE.CylinderGeometry(0.4, 0.4, 1, 32);
  const connectorGeom = new THREE.CylinderGeometry(0.25, 0.3, 0.4, 32);
  const flangeGeom = new THREE.CylinderGeometry(0.55, 0.55, 0.1, 32);

  connectorGeom.translate(0, 0.7, 0);
  flangeGeom.translate(0, -0.2, 0);

  return THREE.BufferGeometryUtils ?
    THREE.BufferGeometryUtils.mergeBufferGeometries([bodyGeom, connectorGeom, flangeGeom]) :
    bodyGeom;
}

function resetCamera(camera, controls) {
  camera.position.set(3, 3, 3);
  controls.reset();
}

function toggleWireframe(mesh) {
  mesh.material.wireframe = !mesh.material.wireframe;
}

function toggleAutoRotate(controls) {
  controls.autoRotate = !controls.autoRotate;
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function launchARWithFile(glbPath) {
  const arViewerContainer = document.getElementById('ar-viewer-container');
  const modelViewer = document.getElementById('ar-model-viewer');
  const iosFallback = document.getElementById('ios-ar-fallback');
  const iosDownloadLink = document.getElementById('ios-download-link');

  arViewerContainer.style.display = 'block';
  document.getElementById('ar-section').style.display = 'block';

  modelViewer.src = glbPath;
  iosDownloadLink.href = glbPath;

  arViewerContainer.scrollIntoView({ behavior: 'smooth' });

  document.getElementById('ar-instructions').innerHTML = '⏳ Loading 3D model...';
  document.getElementById('ar-instructions').style.color = 'var(--text-muted)';

  modelViewer.addEventListener('load', () => {
    setTimeout(() => {
      if (modelViewer.canActivateAR) {
        document.getElementById('ar-instructions').innerHTML =
          '✅ AR Ready! Tap the button above to view in your space.';
        document.getElementById('ar-instructions').style.color = '#10b981';
        iosFallback.style.display = 'none';
      } else if (isIOS()) {
        document.getElementById('ar-instructions').innerHTML =
          '📱 Tap \"View in Your Space\" to open in AR Quick Look';
        document.getElementById('ar-instructions').style.color = '#f59e0b';
        iosFallback.style.display = 'block';
      } else {
        document.getElementById('ar-instructions').innerHTML =
          '📱 Open on mobile for AR. Rotate the 3D model here with your mouse.';
        document.getElementById('ar-instructions').style.color = 'var(--text-muted)';
      }
    }, 500);
  }, { once: true });

  modelViewer.addEventListener('error', (e) => {
    console.error('Error loading model:', e);
    document.getElementById('ar-instructions').innerHTML =
      '⚠️ Error loading model. Try refreshing.';
    document.getElementById('ar-instructions').style.color = '#ef4444';
  }, { once: true });
}

function exportToGLBForAR(scene, mesh) {
  const exporter = new THREE.GLTFExporter();
  const exportScene = new THREE.Scene();
  const exportMesh = mesh.clone();
  exportMesh.position.set(0, 0, 0);
  exportScene.add(exportMesh);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1);
  exportScene.add(light);
  exportScene.add(new THREE.AmbientLight(0xffffff, 0.5));

  exporter.parse(
    exportScene,
    (glb) => {
      const blob = new Blob([glb], { type: 'model/gltf-binary' });
      const url = URL.createObjectURL(blob);
      setupARViewer(url);
    },
    (error) => {
      console.error('GLB export error:', error);
      document.getElementById('ar-status').textContent = 'AR export failed - try a GLB file directly';
    },
    { binary: true }
  );
}

function setupARViewer(modelUrl) {
  const modelViewer = document.getElementById('ar-model-viewer');
  const arViewerContainer = document.getElementById('ar-viewer-container');

  modelViewer.src = modelUrl;
  arViewerContainer.style.display = 'block';

  const arButton = document.getElementById('ar-button');
  arButton.onclick = () => {
    arViewerContainer.scrollIntoView({ behavior: 'smooth' });
    modelViewer.activateAR();
  };

  if (modelViewer.canActivateAR) {
    document.getElementById('ar-status').innerHTML = '✅ AR supported on this device!';
    document.getElementById('ar-status').style.color = '#10b981';
  } else {
    document.getElementById('ar-status').innerHTML = '📱 Open on mobile for AR experience';
  }
}

function launchARForModel(mesh) {
  const arViewerContainer = document.getElementById('ar-viewer-container');
  const modelViewer = document.getElementById('ar-model-viewer');
  const iosFallback = document.getElementById('ios-ar-fallback');
  const iosDownloadLink = document.getElementById('ios-download-link');

  arViewerContainer.style.display = 'block';
  document.getElementById('ar-section').style.display = 'block';
  arViewerContainer.scrollIntoView({ behavior: 'smooth' });

  const exporter = new THREE.GLTFExporter();
  const exportScene = new THREE.Scene();
  const exportMesh = mesh.clone();
  exportMesh.position.set(0, 0, 0);
  exportScene.add(exportMesh);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1);
  exportScene.add(light);
  exportScene.add(new THREE.AmbientLight(0xffffff, 0.6));

  exporter.parse(
    exportScene,
    (glb) => {
      const blob = new Blob([glb], { type: 'model/gltf-binary' });
      const url = URL.createObjectURL(blob);
      modelViewer.src = url;
      iosDownloadLink.href = url;

      modelViewer.addEventListener('load', () => {
        if (isIOS()) {
          iosFallback.style.display = 'block';
          document.getElementById('ar-instructions').innerHTML =
            '📱 <strong>iPhone detected!</strong> Tap \"View in Your Space\" or download the file below.';
          document.getElementById('ar-instructions').style.color = '#f59e0b';
        }

        if (modelViewer.canActivateAR) {
          document.getElementById('ar-instructions').innerHTML =
            '✅ AR is supported! Tap the button above to view in your space.';
          document.getElementById('ar-instructions').style.color = '#10b981';
          iosFallback.style.display = 'none';
        } else if (!isIOS()) {
          document.getElementById('ar-instructions').innerHTML =
            '📱 Open this page on your phone to use AR. You can still rotate the 3D model here.';
        }
      }, { once: true });

      modelViewer.addEventListener('error', (e) => {
        console.error('Model viewer error:', e);
        document.getElementById('ar-instructions').innerHTML =
          '⚠️ Error loading model. Try refreshing the page.';
        document.getElementById('ar-instructions').style.color = '#ef4444';
      }, { once: true });
    },
    (error) => {
      console.error('GLB export error:', error);
      document.getElementById('ar-instructions').innerHTML =
        '⚠️ Export failed. Try uploading a GLB file directly for best AR support.';
      document.getElementById('ar-instructions').style.color = '#ef4444';
    },
    { binary: true }
  );
}

function wireButtons() {
  document.querySelectorAll('.btn-reset').forEach(btn => {
    const i = Number(btn.dataset.model);
    btn.addEventListener('click', () => resetCamera(cameras[i], controlsArr[i]));
  });

  document.querySelectorAll('.btn-wireframe').forEach(btn => {
    const i = Number(btn.dataset.model);
    btn.addEventListener('click', () => toggleWireframe(meshes[i]));
  });

  document.querySelectorAll('.btn-autorotate').forEach(btn => {
    const i = Number(btn.dataset.model);
    btn.addEventListener('click', () => toggleAutoRotate(controlsArr[i]));
  });

  document.querySelectorAll('.btn-ar').forEach(btn => {
    const glb = btn.dataset.glb;
    btn.addEventListener('click', () => launchARWithFile(glb));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const gear = createGearGeometry();
  const v1 = initViewer('viewer1', gear, metalMaterial);
  scene1 = v1.scene; camera1 = v1.camera; renderer1 = v1.renderer; controls1 = v1.controls; mesh1 = v1.mesh;
  scenes[1] = v1.scene; cameras[1] = v1.camera; controlsArr[1] = v1.controls; meshes[1] = v1.mesh;

  const bracket = createBracketGeometry();
  const v2 = initViewer('viewer2', bracket, metalMaterial);
  scene2 = v2.scene; camera2 = v2.camera; renderer2 = v2.renderer; controls2 = v2.controls; mesh2 = v2.mesh;
  scenes[2] = v2.scene; cameras[2] = v2.camera; controlsArr[2] = v2.controls; meshes[2] = v2.mesh;

  const connector = new THREE.TorusKnotGeometry(0.5, 0.15, 100, 16);
  const v3 = initViewer('viewer3', connector, blueMaterial);
  scene3 = v3.scene; camera3 = v3.camera; renderer3 = v3.renderer; controls3 = v3.controls; mesh3 = v3.mesh;
  scenes[3] = v3.scene; cameras[3] = v3.camera; controlsArr[3] = v3.controls; meshes[3] = v3.mesh;

  wireButtons();
});

// File upload handling
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const customViewer = document.getElementById('custom-viewer');
const modelStats = document.getElementById('model-stats');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) loadFile(file);
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) loadFile(file);
});

function loadFile(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  const reader = new FileReader();

  reader.onload = (e) => {
    customViewer.style.display = 'block';
    modelStats.style.display = 'flex';
    document.getElementById('ar-section').style.display = 'block';

    document.getElementById('file-size').textContent = (file.size / 1024).toFixed(1) + ' KB';

    let geometry;

    if (extension === 'stl') {
      const loader = new THREE.STLLoader();
      geometry = loader.parse(e.target.result);
    } else if (extension === 'obj') {
      const loader = new THREE.OBJLoader();
      const obj = loader.parse(e.target.result);
      geometry = obj.children[0]?.geometry || new THREE.BoxGeometry(1, 1, 1);
    } else if (extension === 'glb' || extension === 'gltf') {
      const blob = new Blob([e.target.result], { type: 'model/gltf-binary' });
      const url = URL.createObjectURL(blob);
      setupARViewer(url);
      return;
    }

    if (geometry) {
      const vertexCount = geometry.attributes.position.count;
      const faceCount = geometry.index ? geometry.index.count / 3 : vertexCount / 3;
      document.getElementById('vertex-count').textContent = vertexCount.toLocaleString();
      document.getElementById('face-count').textContent = Math.floor(faceCount).toLocaleString();

      if (customRenderer) {
        customRenderer.dispose();
      }

      const result = initViewer('custom-viewer', geometry, metalMaterial);
      customScene = result.scene;
      customCamera = result.camera;
      customRenderer = result.renderer;
      customControls = result.controls;
      customMesh = result.mesh;

      exportToGLBForAR(result.scene, result.mesh);
    }
  };

  if (extension === 'stl' || extension === 'glb' || extension === 'gltf') {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file);
  }
}

