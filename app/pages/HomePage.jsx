'use client'
import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const HomePage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false); // State for model loading status
  const [isPaused, setIsPaused] = useState(false)

  const togglePause = () => {
    if (!isPaused) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPaused(!isPaused); // Toggle the pause state
  };


  useEffect(() => {
    const loadModelAndWebcam = async () => {
      await tf.ready(); // Ensure TensorFlow.js is ready

      const model = await cocoSsd.load(); // Load the Coco SSD model
      setModelLoaded(true); // Update state to indicate the model is loaded

      // Access the user's webcam
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream; // Assign the stream to the video element
          videoRef.current.play(); // Start playing the video to ensure it's displayed
        })
        .catch((error) => {
          console.error('Error accessing webcam:', error);
        });

      const drawLoop = async () => {
        if (videoRef.current && modelLoaded && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          const context = canvasRef.current.getContext('2d');
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;

          context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); // Clear the canvas for new drawing

          const predictions = await model.detect(videoRef.current);
          

          predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox;
            context.strokeStyle = 'green';
            context.lineWidth = 2;
            context.strokeRect(x, y, width, height);
            context.font = '18px Arial';
            context.fillStyle = 'green';
            context.fillText(prediction.class, x, y); // Optionally draw the label
          });
        }
        requestAnimationFrame(drawLoop); // Schedule the next frame for drawing
      };

      drawLoop(); // Start the drawing loop
    };

    loadModelAndWebcam();

    // Cleanup function to stop the video stream when the component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [modelLoaded]);

  return (
    <div className='w-full flex justify-center flex-col'>
      <div className='bg-slate-700 py-4 text-slate-100 font-medium text-[18px] flex justify-around'>
        <h1>Group 8</h1>
        <h1>Objection Detection App</h1>
      </div>
      <div className='w-full flex justify-center'>
        <div style={{ position: 'relative' }} className='mt-24'>
          {modelLoaded ? (
            <>
              <video ref={videoRef} autoPlay muted playsInline width="640" height="480" style={{  top: 0, left: 0 }} />
              <canvas ref={canvasRef} width="640" height="480" style={{  position:'absolute', top: 0, left: 0 }} />
            </>
          ) : (
            <div className='w-[640px] h-[480px] flex justify-center place-items-center bg-slate-700 text-slate-50'>
              <p>Loading model...</p>
            </div>
          )}
          {/* <button onClick={} className='bg-red-500 py-2 px-4 rounded-md w-full text-slate-50 mt-2 hover:bg-red-600 transition-all 100'> {isPaused ? "Resume" :  "Pause & Analyse"}</button> */}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
