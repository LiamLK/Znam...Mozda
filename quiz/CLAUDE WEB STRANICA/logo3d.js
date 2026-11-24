// 3D upitnik: slojevi slike složeni po dubini, a korisnik ga okreće povlačenjem
(function () {
    const stage = document.getElementById("mark-stage");
    const mark = document.getElementById("mark");
    if (!stage || !mark) return;

    const LAYERS = 36;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Gradnja slojeva
    const layers = [];
    for (let i = 0; i < LAYERS; i++) {
        const img = document.createElement("img");
        const isFront = i === LAYERS - 1;
        img.src = isFront ? "mark-front.png" : "mark-side.png";
        img.alt = "";
        img.draggable = false;
        img.className = "mark-layer";
        if (!isFront) {
            img.style.filter = "brightness(" + (0.8 + 0.28 * i / LAYERS).toFixed(3) + ")";
        }
        mark.appendChild(img);
        layers.push(img);
    }

    // Razmak slojeva ovisi o veličini upitnika
    function setDepth() {
        const depth = stage.offsetWidth * 0.32;
        layers.forEach(function (img, i) {
            const z = -depth / 2 + depth * i / (LAYERS - 1);
            img.style.transform = "translateZ(" + z.toFixed(2) + "px)";
        });
    }
    setDepth();
    window.addEventListener("resize", setDepth);

    // Rotacija
    let rotX = -8, rotY = 0;
    let velX = 0, velY = 0;
    let dragging = false, touched = false;
    let lastX = 0, lastY = 0;
    const start = performance.now();

    function render() {
        mark.style.transform = "rotateX(" + rotX.toFixed(2) + "deg) rotateY(" + rotY.toFixed(2) + "deg)";
    }

    stage.addEventListener("pointerdown", function (e) {
        dragging = true;
        touched = true;
        lastX = e.clientX;
        lastY = e.clientY;
        velX = velY = 0;
        stage.setPointerCapture(e.pointerId);
        stage.classList.add("grabbing");
    });

    stage.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        velY = dx * 0.6;
        velX = -dy * 0.6;
        rotY += velY;
        rotX = Math.max(-80, Math.min(80, rotX + velX));
    });

    function release() {
        dragging = false;
        stage.classList.remove("grabbing");
    }
    stage.addEventListener("pointerup", release);
    stage.addEventListener("pointercancel", release);

    function frame(now) {
        if (!dragging) {
            if (!touched) {
                // Lagano ljuljanje dok ga korisnik još nije dotaknuo
                if (!reduceMotion) {
                    rotY = 28 * Math.sin((now - start) / 900);
                }
            } else {
                // Inercija nakon puštanja
                rotY += velY;
                rotX = Math.max(-80, Math.min(80, rotX + velX));
                velY *= 0.95;
                velX *= 0.95;
            }
        }
        render();
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
})();
