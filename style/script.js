import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

document.addEventListener("contextmenu", (event) => event.preventDefault());
document.onkeydown = function (e) {
  if (
    e.keyCode == 123 ||
    (e.ctrlKey &&
      e.shiftKey &&
      (e.keyCode == "I".charCodeAt(0) ||
        e.keyCode == "J".charCodeAt(0) ||
        e.keyCode == "C".charCodeAt(0))) ||
    (e.ctrlKey &&
      (e.keyCode == "U".charCodeAt(0) || e.keyCode == "S".charCodeAt(0)))
  ) {
    return false;
  }
};

const CONFIG = {
  galaxy: { rotationSpeed: 0.12, centerExclusionRadius: 45 },
  elementExclusionRadius: 40,
  blackHole: {
    radius: 20,
    segments: 64,
    color1: "#F2B9BF",
    color2: "#D97F88",
  },

  accretionRing: {
    innerRadius: 26,
    outerRadius: 40,
    segments: 128,
    centerColor: "#F6D1D5",
    midColor: "#E8A2A8",
    edgeColor: "#D97F88",
    emissiveIntensity: 0.6, 
  },
  particles: {
    coreStars: {
      count: 20000,
      radius: 120,
      maxHeight: 60,
      size: 0.25,
    },

    sphericalHalo: {
      count: 18000,
      radiusXZ: 110,
      radiusY: 55,
      size: 0.18,
      minDistFromCenter: 28,
    },

    backgroundStars: { count: 5000, radius: 500, size: 0.2 },

    photos: {
      count: 60,
      width: 13,
      height: 16,
      cornerRadius: 24,
      minRadius: null,
      maxRadius: 120,
      images: Array.from(
        { length: 20 },
        (_, i) => `style/img/anh${i + 1}.jpeg`,
      ),
      messages: [
        "Dù có chuyện gì xảy ra, anh vẫn sẽ luôn ở bên em, cùng em đi qua mọi niềm vui và khó khăn của cuộc sống.",
        "Em là sự bình yên mà anh luôn tìm kiếm, chỉ cần ở cạnh em thôi là mọi mệt mỏi trong anh đều tan biến.",
        "Mỗi ngày được nhìn thấy em cười và được ở bên em chính là điều khiến anh cảm thấy hạnh phúc nhất.",
        "Nụ cười rạng rỡ của em giống như ánh nắng, luôn khiến trái tim anh ấm áp và tràn đầy năng lượng.",
        "Anh thật sự biết ơn vì cuộc đời đã cho anh cơ hội gặp được em, người con gái tuyệt vời nhất.",
        "Bất cứ nơi nào có em, nơi đó đều trở thành nơi anh muốn quay về và là nơi anh cảm thấy hạnh phúc nhất.",
        "Từ khi em xuất hiện, mọi thứ trong cuộc sống của anh đều trở nên ý nghĩa và tốt đẹp hơn rất nhiều.",
        "Sự dịu dàng và ánh sáng tích cực từ em luôn truyền cảm hứng để anh cố gắng trở thành phiên bản tốt hơn mỗi ngày.",
        "Trong mắt anh, em luôn là một người thật đặc biệt, thật tuyệt vời và không ai có thể thay thế được.",
        "Cảm ơn em vì đã đến bên anh, đã mang đến cho anh thật nhiều niềm vui và những kỷ niệm đẹp.",
        "Giữa hàng triệu người ngoài kia, trái tim anh vẫn luôn chọn em và sẽ mãi chỉ hướng về em.",
        "Anh cảm thấy mình là người may mắn nhất khi được yêu em và được em bước cùng trên chặng đường này.",
        "Mỗi khi ở bên em, anh đều cảm nhận được sự bình yên, ấm áp và an yên mà trước đây anh chưa từng có.",
        "Đối với anh, nhà không chỉ là một nơi để trở về, mà là bất cứ nơi nào có em ở đó.",
        "Có em trong cuộc đời là điều tuyệt vời nhất mà anh từng nhận được, và anh sẽ luôn trân trọng điều đó.",
        "Mỗi ngày thức dậy và biết rằng mình vẫn còn có em bên cạnh đều là một niềm vui lớn đối với anh.",
        "Em giống như ngôi sao sáng nhất trên bầu trời của anh, luôn âm thầm soi sáng và dẫn lối cho anh.",
        "Anh yêu em nhiều hơn những gì lời nói có thể diễn tả và sẽ luôn dành cho em tất cả sự chân thành của mình.",
        "Anh mong rằng chúng ta sẽ luôn nắm tay nhau, cùng nhau viết tiếp thật nhiều câu chuyện đẹp trong tương lai.",
        "Đối với anh, em không chỉ là người anh yêu mà còn là cả thế giới, là tất cả những gì anh muốn gìn giữ.",
      ],
    },
    emojis: {
      count: 20,
      size: 12,
      minRadius: null,
      maxRadius: 120,
      content: ["💖", "💘", "💞", "💕", "❤️", "🌸", "🌺"],
      colors: [
        { fill: "#F6D1D5", shadow: "#D97F88" },
        { fill: "#F2B9BF", shadow: "#E8A2A8" },
        { fill: "#E8A2A8", shadow: "#D97F88" },
      ],
    },
  },

  shootingStars: {
    enabled: true,
    spawnProbability: 0.01,
    speed: 1.2,
  },
  lighting: {
    ambientLight: { color: "#ffffff", intensity: 0.1 },
    pointLight: { color: "#E8A2A8", intensity: 2.5, distance: 350 },
  },
  bloomEffect: { threshold: 0.68, strength: 0.7, radius: 0.5 },
  cameraControls: { minDistance: 30, maxDistance: 250 },
};

let scene,
  camera,
  renderer,
  controls,
  galaxyGroup,
  clock,
  sphereMaterial,
  bloomComposer,
  finalComposer;
let lovePhotos = [],
  loveImages = [],
  shootingStars = [];
let occupiedPositions = [];
let raycaster, mouse;

const BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);
const darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });
const bloomMaterialsCache = {};

function darkenNonBloomed(obj) {
  if ((obj.isMesh || obj.isPoints) && bloomLayer.test(obj.layers) === false) {
    bloomMaterialsCache[obj.uuid] = obj.material;
    obj.material = darkMaterial;
  }
}

function restoreMaterial(obj) {
  if (bloomMaterialsCache[obj.uuid]) {
    obj.material = bloomMaterialsCache[obj.uuid];
    delete bloomMaterialsCache[obj.uuid];
  }
}

function init() {
  scene = new THREE.Scene();
  clock = new THREE.Clock();
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("galaxy-canvas"),
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = false;
  controls.minDistance = CONFIG.cameraControls.minDistance;
  controls.maxDistance = CONFIG.cameraControls.maxDistance;

  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85,
  );
  bloomPass.threshold = CONFIG.bloomEffect.threshold;
  bloomPass.strength = CONFIG.bloomEffect.strength;
  bloomPass.radius = CONFIG.bloomEffect.radius;

  bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);

  const mixPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
      },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform sampler2D baseTexture; uniform sampler2D bloomTexture; varying vec2 vUv; void main() { gl_FragColor = texture2D(baseTexture, vUv) + vec4(1.0) * texture2D(bloomTexture, vUv); }`,
    }),
    "baseTexture",
  );
  mixPass.needsSwap = true;

  finalComposer = new EffectComposer(renderer);
  finalComposer.addPass(renderScene);
  finalComposer.addPass(mixPass);

  const { ambientLight, pointLight } = CONFIG.lighting;
  scene.add(new THREE.AmbientLight(ambientLight.color, ambientLight.intensity));
  const mainLight = new THREE.PointLight(
    pointLight.color,
    pointLight.intensity,
    pointLight.distance,
  );
  mainLight.position.set(0, 0, 0);
  scene.add(mainLight);

  galaxyGroup = new THREE.Group();
  scene.add(galaxyGroup);

  createBlackHole();
  createCoreStars();
  createSphericalHalo();
  createBackgroundStars();
  createLoveElements();

  window.addEventListener("resize", onWindowResize);
  renderer.domElement.addEventListener("click", onCanvasClick);
  onWindowResize();
  animate();
}

function createBlackHole() {
  const bhConfig = CONFIG.blackHole;
  const ringConfig = CONFIG.accretionRing;
  sphereMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0.0 },
      uColor1: { value: new THREE.Color(bhConfig.color1) },
      uColor2: { value: new THREE.Color(bhConfig.color2) },
    },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float uTime; uniform vec3 uColor1; uniform vec3 uColor2; varying vec2 vUv; float noise(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123); } void main() { float n = noise(vUv * 4.0 + uTime * 0.1); vec3 mixedColor = mix(uColor1, uColor2, n); gl_FragColor = vec4(mixedColor, 1.0); }`,
  });
  const blackHoleMesh = new THREE.Mesh(
    new THREE.SphereGeometry(
      bhConfig.radius,
      bhConfig.segments,
      bhConfig.segments,
    ),
    sphereMaterial,
  );
  blackHoleMesh.layers.enable(BLOOM_SCENE);
  scene.add(blackHoleMesh);
  const ringGeometry = new THREE.RingGeometry(
    ringConfig.innerRadius,
    ringConfig.outerRadius,
    ringConfig.segments,
  );
  const ringMaterial = new THREE.ShaderMaterial({
    uniforms: {
      innerRadius: { value: ringConfig.innerRadius },
      outerRadius: { value: ringConfig.outerRadius },
      centerColor: { value: new THREE.Color(ringConfig.centerColor) },
      midColor: { value: new THREE.Color(ringConfig.midColor) },
      edgeColor: { value: new THREE.Color(ringConfig.edgeColor) },
      emissiveIntensity: { value: ringConfig.emissiveIntensity },
    },
    vertexShader: `varying vec3 vPosition; void main() { vPosition = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float innerRadius; uniform float outerRadius; uniform vec3 centerColor; uniform vec3 midColor; uniform vec3 edgeColor; uniform float emissiveIntensity; varying vec3 vPosition; void main() { float distance = length(vPosition.xy); float normalizedDistance = clamp((distance - innerRadius) / (outerRadius - innerRadius), 0.0, 1.0); vec3 finalColor; if (normalizedDistance < 0.5) { finalColor = mix(centerColor, midColor, normalizedDistance * 2.0); } else { finalColor = mix(midColor, edgeColor, (normalizedDistance - 0.5) * 2.0); } float glowFactor = 1.0 - smoothstep(0.0, 1.0, normalizedDistance); vec3 emissiveColor = finalColor * emissiveIntensity * glowFactor; gl_FragColor = vec4(finalColor + emissiveColor, 1.0); }`,
    side: THREE.DoubleSide,
  });
  const goldenRing = new THREE.Mesh(ringGeometry, ringMaterial);
  goldenRing.rotation.x = Math.PI / 2;
  goldenRing.layers.enable(BLOOM_SCENE);
  scene.add(goldenRing);
}

function createCoreStars() {
  const coreConfig = CONFIG.particles.coreStars;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(coreConfig.count * 3);
  const colors = new Float32Array(coreConfig.count * 3);
  const color = new THREE.Color();
  for (let i = 0; i < coreConfig.count; i++) {
    const distance =
      CONFIG.accretionRing.outerRadius +
      Math.random() * (coreConfig.radius - CONFIG.accretionRing.outerRadius);
    const angle = Math.random() * Math.PI * 2;
    const y =
      (Math.random() - 0.5) *
      coreConfig.maxHeight *
      Math.pow(1 - distance / coreConfig.radius, 1.5);
    positions.set(
      [Math.cos(angle) * distance, y, Math.sin(angle) * distance],
      i * 3,
    );

    // Màu đỏ nhạt
    const hue = 0.82 + Math.random() * 0.12;
    const saturation = 0.8 + Math.random() * 0.2;
    const lightness = 0.6 + Math.random() * 0.4;
    color.setHSL(hue % 1, saturation, lightness);
    colors.set([color.r, color.g, color.b], i * 3);
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: coreConfig.size,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
  });
  const coreStarPoints = new THREE.Points(geometry, material);
  coreStarPoints.layers.enable(BLOOM_SCENE);
  galaxyGroup.add(coreStarPoints);
}

function createSphericalHalo() {
  const haloConfig = CONFIG.particles.sphericalHalo;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(haloConfig.count * 3);
  const colors = new Float32Array(haloConfig.count * 3);
  const color = new THREE.Color();

  let filled = 0;
  while (filled < haloConfig.count) {
    const rx = Math.random() * 2 - 1;
    const ry = Math.random() * 2 - 1;
    const rz = Math.random() * 2 - 1;

    if (rx * rx + ry * ry + rz * rz > 1.0) continue;

    const x = rx * haloConfig.radiusXZ;
    const y = ry * haloConfig.radiusY;
    const z = rz * haloConfig.radiusXZ;

    const distFromCenter = Math.sqrt(x * x + y * y + z * z);
    if (distFromCenter < haloConfig.minDistFromCenter) continue;

    const rNorm =
      distFromCenter / Math.max(haloConfig.radiusXZ, haloConfig.radiusY);
    if (Math.random() > Math.pow(1.0 - rNorm * 0.7, 1.2)) continue;

    positions.set([x, y, z], filled * 3);

    // Màu đỏ nhạt cho vòng hào quang
    const hue = 0.82 + Math.random() * 0.12;
    const saturation = 0.6 + Math.random() * 0.4;
    const lightness = 0.45 + Math.random() * 0.45;
    color.setHSL(hue % 1, saturation, lightness);
    colors.set([color.r, color.g, color.b], filled * 3);

    filled++;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: haloConfig.size,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
  });

  const haloPoints = new THREE.Points(geometry, material);
  haloPoints.layers.enable(BLOOM_SCENE);
  galaxyGroup.add(haloPoints);
}

function createLoveElements() {
  const photoConfig = CONFIG.particles.photos;
  const emojiConfig = CONFIG.particles.emojis;

  for (let i = 0; i < photoConfig.count; i++) {
    const image = photoConfig.images[i % photoConfig.images.length];
    const message = photoConfig.messages[i % photoConfig.messages.length];
    const texture = createRoundedPhotoTexture(image, photoConfig.cornerRadius);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    const photoMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(photoConfig.width, photoConfig.height),
      material,
    );
    photoMesh.userData.message = message;
    photoMesh.userData.image = image;
    setElementOrbitPosition(
      photoMesh,
      photoConfig.minRadius,
      photoConfig.maxRadius,
    );
    galaxyGroup.add(photoMesh);
    lovePhotos.push(photoMesh);
  }

  for (let i = 0; i < emojiConfig.count; i++) {
    const colorData = emojiConfig.colors[i % emojiConfig.colors.length];
    const emoji = emojiConfig.content[i % emojiConfig.content.length];
    const texture = createEmojiTexture(emoji, colorData);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.1,
    });

    const emojiMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(emojiConfig.size, emojiConfig.size),
      material,
    );
    emojiMesh.layers.enable(BLOOM_SCENE);
    setElementOrbitPosition(
      emojiMesh,
      emojiConfig.minRadius,
      emojiConfig.maxRadius,
    );
    galaxyGroup.add(emojiMesh);
    loveImages.push(emojiMesh);
  }
}

function createBackgroundStars() {
  const bgConfig = CONFIG.particles.backgroundStars;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(bgConfig.count * 3);
  for (let i = 0; i < bgConfig.count; i++) {
    const r = bgConfig.radius;
    positions.set(
      [
        (Math.random() - 0.5) * 2 * r,
        (Math.random() - 0.5) * 2 * r,
        (Math.random() - 0.5) * 2 * r,
      ],
      i * 3,
    );
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    size: bgConfig.size,
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
  });
  scene.add(new THREE.Points(geometry, material));
}

function createShootingStar() {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3),
  );
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.8,
    blending: THREE.AdditiveBlending,
    transparent: true,
  });
  const star = new THREE.Points(geometry, material);
  star.layers.enable(BLOOM_SCENE);

  const [x, y, z] = [
    THREE.MathUtils.randFloatSpread(800),
    THREE.MathUtils.randFloat(100, 300),
    THREE.MathUtils.randFloatSpread(800),
  ];
  star.position.set(x, y, z);

  star.userData.velocity = new THREE.Vector3(
    (Math.random() < 0.5 ? -1 : 1) * CONFIG.shootingStars.speed,
    -CONFIG.shootingStars.speed * 0.5,
    (Math.random() - 0.5) * 2,
  );
  star.userData.life = 0;

  shootingStars.push(star);
  scene.add(star);
}

function program(delay = 200) {
  (function () {
    const _b = (s) => decodeURIComponent(escape(atob(s)));
    const _d = [
      "QuG6o24gcXV54buBbiB0aHXhu5ljIHbhu4IgRHIuR2lmdGVy",
      "VGlrdG9rOiBodHRwczovL3d3dy50aWt0b2suY29tL0Bkci5naWZ0ZXIzMDY=",
      "R2l0aHViOiBodHRwczovL2dpdGh1Yi5jb20vRHJHaWZ0ZXI=",
    ];

    setTimeout(() => {
      _d.forEach((x) => console.log(_b(x)));
    }, delay);
  })();
}

function setElementOrbitPosition(element, minRadius, maxRadius) {
  const safeMinRadius = minRadius || CONFIG.elementExclusionRadius;
  const safeMaxRadius = maxRadius || CONFIG.particles.coreStars.radius;
  const minSeparation = 18;
  const maxAttempts = 50;
  let validPosition = false;
  let attempts = 0;
  let finalPosition = { x: 0, y: 0, z: 0 };
  while (!validPosition && attempts < maxAttempts) {
    attempts++;
    const radius =
      safeMinRadius + Math.random() * (safeMaxRadius - safeMinRadius);
    const theta = Math.random() * Math.PI * 2;
    const maxVerticalOffset = 15;
    const y = (Math.random() - 0.5) * maxVerticalOffset;
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);
    validPosition = true;
    for (let pos of occupiedPositions) {
      const distance = Math.sqrt(
        Math.pow(x - pos.x, 2) +
          Math.pow(y - pos.y, 2) +
          Math.pow(z - pos.z, 2),
      );
      if (distance < minSeparation) {
        validPosition = false;
        break;
      }
    }
    if (validPosition) finalPosition = { x, y, z };
  }
  element.position.set(finalPosition.x, finalPosition.y, finalPosition.z);
  occupiedPositions.push(finalPosition);
}

function createRoundedPhotoTexture(src, cornerRadius = 24) {
  const canvas = document.createElement("canvas");
  canvas.width = 260;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const img = new Image();
  img.onload = () => {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cornerRadius, 0);
    ctx.arcTo(w, 0, w, h, cornerRadius);
    ctx.arcTo(w, h, 0, h, cornerRadius);
    ctx.arcTo(0, h, 0, 0, cornerRadius);
    ctx.arcTo(0, 0, w, 0, cornerRadius);
    ctx.closePath();
    ctx.clip();

    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;
    let drawWidth, drawHeight, offsetX, offsetY;
    if (imgRatio > canvasRatio) {
      drawHeight = h;
      drawWidth = h * imgRatio;
      offsetX = (w - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = w;
      drawHeight = w / imgRatio;
      offsetX = 0;
      offsetY = (h - drawHeight) / 2;
    }
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();
    texture.needsUpdate = true;
  };
  img.src = src;

  return texture;
}

function createEmojiTexture(emoji, colorData) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '320px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.shadowColor = colorData.shadow;
  ctx.shadowBlur = 24;
  ctx.fillStyle = colorData.fill;
  ctx.fillText(emoji, canvas.width / 2, canvas.height / 2 + 16);

  const newTexture = new THREE.CanvasTexture(canvas);
  newTexture.colorSpace = THREE.SRGBColorSpace;
  newTexture.generateMipmaps = false;
  newTexture.minFilter = THREE.LinearFilter;
  newTexture.magFilter = THREE.LinearFilter;
  return newTexture;
}

function onWindowResize() {
  const width = window.innerWidth,
    height = window.innerHeight;
  renderer.setSize(width, height);
  bloomComposer.setSize(width, height);
  finalComposer.setSize(width, height);
  camera.aspect = width / height;
  camera.position.set(0, 35, width < 768 ? 150 : 120);
  camera.updateProjectionMatrix();
}

function onCanvasClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(lovePhotos);
  if (intersects.length > 0) {
    const hit = intersects[0].object;
    showPhotoCard(hit.userData.message, hit.userData.image);
  }
}

const CARD_BORDER_COLORS = [
  "#E8A2A8",
  "#F2B9BF",
  "#D97F88",
  "#F6D1D5",
  "#FFB347",
  "#7FD8BE",
  "#7FB3E8",
  "#C792EA",
  "#FFD166",
  "#FF6B6B",
];

function showPhotoCard(message, image) {
  const overlay = document.getElementById("love-card-overlay");
  const card = document.getElementById("love-card");
  const cardImage = document.getElementById("love-card-image");
  const text = document.getElementById("love-card-text");
  const borderColor =
    CARD_BORDER_COLORS[Math.floor(Math.random() * CARD_BORDER_COLORS.length)];
  card.style.borderColor = borderColor;
  card.style.boxShadow = `0 0 35px ${borderColor}`;
  cardImage.style.backgroundImage = `url('${image}')`;
  text.textContent = message;
  overlay.style.display = "flex";
}

function hideLoveCard() {
  document.getElementById("love-card-overlay").style.display = "none";
}

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();
  galaxyGroup.rotation.y = elapsedTime * CONFIG.galaxy.rotationSpeed;
  if (sphereMaterial) sphereMaterial.uniforms.uTime.value = elapsedTime;

  lovePhotos.forEach((p) => p.lookAt(camera.position));
  loveImages.forEach((i) => i.lookAt(camera.position));

  if (
    CONFIG.shootingStars.enabled &&
    Math.random() < CONFIG.shootingStars.spawnProbability
  ) {
    createShootingStar();
  }

  shootingStars.forEach((star, index) => {
    star.position.add(star.userData.velocity);
    star.userData.life++;
    if (star.userData.life > 300) {
      scene.remove(star);
      shootingStars.splice(index, 1);
    }
  });

  controls.update();
  scene.traverse(darkenNonBloomed);
  bloomComposer.render();
  scene.traverse(restoreMaterial);
  finalComposer.render();
}
program();
init();

document.getElementById("entry-button").addEventListener("click", () => {
  const entryModal = document.getElementById("entry-modal");
  const entryButton = document.getElementById("entry-button");
  const entryLoading = document.getElementById("entry-loading");

  entryButton.style.display = "none";
  entryLoading.style.display = "flex";

  setTimeout(() => {
    entryModal.classList.add("fade-out");
    entryModal.addEventListener(
      "transitionend",
      () => {
        entryModal.style.display = "none";
      },
      { once: true },
    );

    const music = document.getElementById("background-music");
    music.currentTime = 77;
    music.play().catch((e) => {
      console.error("Lỗi khi phát nhạc:", e);
    });
  }, 3000);
});

document
  .getElementById("love-card-close")
  .addEventListener("click", hideLoveCard);
