const video = document.querySelector(".webcam ");

const canvas = document.querySelector(".video");
const ctx = canvas.getContext("2d"); //The context is where u draw on the canvas

const faceCanvas = document.querySelector(".face");
const faceCtx = faceCanvas.getContext("2d");

const faceDetector = new FaceDetector();
const optionsInput = document.querySelectorAll(".controls input[type='range']");

const options = {
  SIZE: 10,
  SCALE: 1.35,
};

function handleOption(event) {
  const { value, name } = event.currentTarget;
  options[name] = parseFloat(value);
}

optionsInput.forEach((input) => input.addEventListener("input", handleOption));
//This function is declared as async so as to use the await keyword
async function populateVideo() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 720, height: 480 },
  }); //Creates a stream object by grabbing the usermedia(video/webcam)
  video.srcObject = stream;
  await video.play(); //playing the source object video
  //await is added to literally wait for the video to load
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  faceCanvas.width = video.videoWidth;
  faceCanvas.height = video.videoHeight;
}

async function detect() {
  const faces = await faceDetector.detect(video);
  faces.forEach(DrawFace);
  faces.forEach(censor);
  //Request from  the browser, when the next animation is and run detect function
  requestAnimationFrame(detect);
}

function DrawFace(face) {
  const { width, height, top, left } = face.boundingBox;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#ffc600";
  ctx.lineWidth = 2;
  ctx.strokeRect(left, top, width, height);
}

function censor({ boundingBox: face }) {
  faceCtx.imageSmoothingEnabled = false;
  faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
  //draw the small face
  faceCtx.drawImage(
    //5 source args
    video, //Where the source comes from
    face.x, //where do we start the pull from the source
    face.y,
    face.width,
    face.height,
    //4 draw args
    face.x, //where should we drawing the x and y to
    face.y,
    options.SIZE,
    options.SIZE
  );
  // draw the small face we drew using the 4 draw args, back to normal size to create pixelation
  const width = face.width * options.SCALE;
  const height = face.height * options.SCALE;
  faceCtx.drawImage(
    //source args -5
    faceCanvas,
    face.x,
    face.y,
    options.SIZE,
    options.SIZE,
    // draw args -4
    face.x - (width - face.width) / 2,
    face.y - (width - face.height) / 2,
    width,
    height
  );
}
populateVideo().then(detect);
