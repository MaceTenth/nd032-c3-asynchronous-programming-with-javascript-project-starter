import { getTracks, store } from "./index.js";
export async function renderCanvas(trackId, positions) {
  const track = (await getTracks()).find((t) => t.id === +trackId);

  const canvas = document.getElementById("race-canvas");
  const ctx = canvas?.getContext("2d");

  const trackWidth = canvas.width;
  const trackHeight = canvas.height;

  ctx.clearRect(0, 0, trackWidth, trackHeight);

  ctx.fillStyle = "#eee";
  ctx.fillRect(0, 0, trackWidth, trackHeight);

  const carWidth = 60;
  const carHeight = 60;

  const carColors = ["red", "blue", "green", "yellow", "orange"];

  const carImages = {};
  await Promise.all(
    carColors.map(async (color) => {
      const img = new Image();
      img.src = `../assets/cars/${color}car.png`;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      carImages[color] = img;
    })
  );

  positions.forEach((position) => {
    if (store[position.driver_name] === undefined) {
      const availableColors = carColors.filter((color) => {
        return !Object.values(store).includes(color);
      });
      store[position.driver_name] =
        availableColors[Math.floor(Math.random() * availableColors.length)];
    }
    position.color = store[position.driver_name];
  });

  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 5]); // Set dashed line pattern
  for (let i = 1; i < positions.length; i++) {
    const y = i * (carHeight + 10) - 5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(trackWidth, y);
    ctx.stroke();
  }
  ctx.setLineDash([]); // Reset line dash pattern

  positions.forEach((position, index) => {
    const segmentPercentage = position.segment / track.segments.length;
    const x = segmentPercentage * trackWidth;
    const y = (index * (carHeight + 10)) % trackHeight;

    const carImage = carImages[position.color];
    console.log("carImage: ", position.color);

    ctx.drawImage(carImage, x, y, carWidth, carHeight);

    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    ctx.fillText(position.driver_name, x + carWidth + 5, y + carHeight / 2);
  });
}
