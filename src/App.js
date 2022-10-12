import React, { useRef, useEffect, useState } from "react";
import useWindowSize from "./hooks/useWindowSize";
import * as d3 from "d3";
import "./App.css";

function createDataSet(nColors, k = 4) {
  if (k > 6) k = 6;
  let generateRadius = d3.randomUniform(k, k * 3);
  let data = Array.from({ length: 350 }, (_, i) => ({
    r: generateRadius(),
    group: i && (i % nColors) + 1,
  }));
  return data;
}

function Balls() {
  const kRef = useRef(null);
  const canvasRef = useRef(null);
  const nodesRef = useRef(null);

  const colors = ["transparent", "#898687", "#C1C1C1", "#9F91C2", "#7F64A8", "#BCBABD"];
  const nColors = colors.length - 1;
  const colorScale = d3.scaleOrdinal(d3.range(nColors), colors);

  //adjust ratio for high DPI screens
  const ratio = window.devicePixelRatio || 1;
  const [width, height] = useWindowSize();
  const [data, setData] = useState(createDataSet(nColors, kRef.current));

  function handlePointerMove(e) {
    if (!nodesRef.current) return;
    const nodes = nodesRef.current;
    const { width, height } = canvasRef.current;
    const [w, h] = [width / ratio, height / ratio];
    const [x, y] = d3.pointer(e);
    nodes[0].fx = x - w / 2;
    nodes[0].fy = y - h / 2;
  }

  useEffect(() => {
    if (!data) {
      return;
    }

    //adjust ball size to screen width
    let k = width / 200;
    if (k !== kRef.current) {
      kRef.current = k;
      setData(createDataSet(nColors, kRef.current));
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const nodes = data.map(Object.create);
    nodesRef.current = nodes;

    //responsive
    canvas.height = height * ratio;
    canvas.width = width * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    //simulation
    const simulation = d3
      .forceSimulation(nodes)
      .alphaTarget(0.3) //stay hot
      .velocityDecay(0.04) //friction
      .force("x", d3.forceX().strength(0.004))
      .force("y", d3.forceY().strength(0.004))
      .force(
        "collide",
        d3
          .forceCollide()
          .radius((d) => d.r + 1)
          .iterations(2)
      )
      .force(
        "charge",
        d3.forceManyBody().strength((d, i) => (i ? 0 : (-width * 2) / 50))
        //adjust cursor size & strength
      )
      .on("tick", () => {
        //updates simulation every tick
        if (!context) {
          return;
        }
        const { width, height } = canvasRef.current;
        const [w, h] = [width / ratio, height / ratio];
        context.save();
        context.scale(ratio, ratio);
        context.clearRect(0, 0, w, h);
        context.translate(w / 2, h / 2);
        for (const d of nodes) {
          //draw balls
          context.beginPath();
          context.moveTo(d.x + d.r, d.y);
          context.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
          context.fillStyle = colorScale(d.group);
          context.fill();
        }
        context.restore();
      });

    return () => {
      simulation.stop();
    };
  }, [data, nColors, colorScale, width, height, ratio]);

  return (
    <div className='ballpit-wrapper'>
      <canvas
        ref={canvasRef}
        className='ballpit'
        onTouchMove={(e) => e.preventDefault}
        onPointerMove={(e) => handlePointerMove(e)}
      />
    </div>
  );
}

export default Balls;
