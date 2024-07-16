import { useEffect, useRef } from "react";
import audio from "../../assets/audio/notify.mp3";

export const UseSound = () => {
  const soundRef = useRef();
  useEffect(() => {
    soundRef.current = new Audio(audio);
  }, []);
  const playSound = () => {
    soundRef.current.play();
  };
  return { playSound };
};
