d3.csv("dense.csv").then(function(data) {
  const svg1 = d3.select("#brush1"), svg2 = d3.select("#brush2");

  const sc1 = d3.scaleLinear()
    .domain([0, 10, 50])
    .range(["lime", "yellow", "red"]);
  const sc2 = d3.scaleLinear()
    .domain([0, 10, 50])
    .range(["lime", "yellow", "blue"]);

  const cs1 = drawCircles(svg1, data, d => +d["A"], d => +d["B"], sc1);
  const cs2 = drawCircles(svg2, data, d => +d["A"], d => +d["B"], sc2);

  installHandlers(svg1, data, cs1, cs2, sc1, sc2);
});

function drawCircles(svg, data, accX, accY, sc) {
  const color = sc(Infinity);
  return svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", 5)
    .attr("cx", accX)
    .attr("cy", accY)
    .attr("fill", color)
    .attr("fill-opacity", 0.4);
}

function installHandlers(svg, data, cs1, cs2, sc1, sc2) {
  svg.attr("cursor", "crosshair")
    .on("mousemove", function() {
      const pt = d3.mouse(this);
      cs1.attr("fill", function(d, i) {
        const cx = +d3.select(this).attr("cx");
        const cy = +d3.select(this).attr("cy");
        const r = Math.hypot(pt[0] - cx, pt[1] - cy);
        data[i]["r"] = r;
        return sc1(r);
      });
      cs2.attr("fill", (d, i) => sc2(data[i]["r"]));
    })
    .on("mouseleave", function() {
      cs1.attr("fill", sc1(Infinity));
      cs2.attr("fill", sc2(Infinity));
    });
}


// =====================
// DRAG & DROP CIRCLES
// =====================
(function makeDragDrop() {
  let widget = undefined, color = undefined;

  const drag = d3.drag()
    .on("start", function() {
      color = d3.select(this).attr("fill");
      widget = d3.select(this).attr("fill", "lime");
    })
    .on("drag", function() {
      const pt = d3.mouse(d3.select("#dragdrop").node());
      widget.attr("cx", pt[0]).attr("cy", pt[1]);
    })
    .on("end", function() {
      widget.attr("fill", color);
      widget = undefined;
    });

  drag(d3.select("#dragdrop").selectAll("circle"));
})();
// =====================

// =====================
// STAGGER ANIMATION CHART
// =====================
(function makeStagger() {
  var ds1 = [2, 1, 3, 5, 7, 8, 9, 9, 9, 8, 7, 5, 3, 1, 2];
  var ds2 = [8, 9, 8, 7, 5, 3, 2, 1, 2, 3, 5, 7, 8, 9, 8];
  var n = ds1.length, mx = d3.max([...ds1, ...ds2]);
  var svg = d3.select("#stagger");

  var scX = d3.scaleLinear().domain([0, n]).range([50, 540]);
  var scY = d3.scaleLinear().domain([0, mx]).range([250, 50]);

  svg.selectAll("line").data(ds1).enter().append("line")
    .attr("stroke", "blue").attr("stroke-width", 20)
    .attr("x1", (d, i) => scX(i)).attr("y1", scY(0))
    .attr("x2", (d, i) => scX(i)).attr("y2", d => scY(d));

  svg.on("click", function () {
    [ds1, ds2] = [ds2, ds1];
    svg.selectAll("line").data(ds1)
      .transition().duration(1000).delay((d, i) => 200 * i)
      .attr("y2", d => scY(d));
  });
})();


// =====================
// LISSAJOUS CURVE
// =====================
(function makeLissajous() {
    var svg = d3.select("#lissajous");

    var a = 1.9, b = 3.2; // Frecuencias de Lissajous
    var phi, omega = 2 * Math.PI / 10000; // 10 segundos por ciclo

    var crrX = 150 + 100, crrY = 150 + 0;
    var prvX = crrX, prvY = crrY;

    var timer = d3.timer(function(t) {
        phi = omega * t;

        crrX = 150 + 100 * Math.cos(a * phi);
        crrY = 150 + 100 * Math.sin(b * phi);

        svg.selectAll("line")
            .each(function() { this.bogus_opacity *= 0.99; })
            .attr("stroke-opacity", function() { return this.bogus_opacity; })
            .filter(function() { return this.bogus_opacity < 0.05; })
            .remove();

        svg.append("line")
            .each(function() { this.bogus_opacity = 1.0; })
            .attr("x1", prvX).attr("y1", prvY)
            .attr("x2", crrX).attr("y2", crrY)
            .attr("stroke", "purple").attr("stroke-width", 2);

        prvX = crrX;
        prvY = crrY;

        if (t > 120000) timer.stop(); // Detener después de 2 minutos
    });
})();
