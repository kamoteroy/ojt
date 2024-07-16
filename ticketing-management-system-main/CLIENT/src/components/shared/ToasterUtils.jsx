import React from "react";
import { toast } from "react-toastify";
import notifySrc from "../../assets/audio/notify.mp3";
import { Checkbox } from "@nextui-org/react";

const ToasterUtils = () => {
  const CustomToast = ({
    content,
    button1,
    button2,
    checkbox,
    onClickButton,
    onCheckboxChange,
    isChecked,
  }) => {
    return (
      <div className="flex flex-col mx-auto">
        <p className="text-center">{content}</p>
        <div className="flex justify-center">
          {checkbox && (
            <Checkbox
              checked={isChecked}
              onValueChange={(value) => onCheckboxChange(value)}
            />
          )}
          {button1 && (
            <button
              onClick={onClickButton}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
            >
              {button1}
            </button>
          )}
          {button2 && (
            <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              {button2}
            </button>
          )}
        </div>
      </div>
    );
  };

  const showToast = (
    content,
    button1,
    button2,
    onClickButton,
    type = "warn",
    additionalOptions = {}
  ) => {
    const options = {
      onOpen: () => {
        const audio = new Audio(notifySrc);
        audio.play().catch((error) => {
          console.log("Browser do not support autoplay");
        });
      },
      newestOnTop: true,
      position: "top-center",
      autoClose: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      closeButton: true,
      ...additionalOptions,
    };

    toast[type](
      <CustomToast
        content={content}
        button1={button1}
        button2={button2}
        onClickButton={onClickButton}
      />,
      options
    );
  };

  const showMessage = (content, type = "warn") => {
    const options = {
      toastId: "messages",
      newestOnTop: true,
      position: "top-center",
      autoClose: true,
      closeOnClick: true,
      draggable: true,
      progress: undefined,
      closeButton: true,
    };

    const existingToast = toast.isActive("messages");

    if (existingToast) {
      toast.update("messages", {
        render: content,
        type,
        ...options,
      });
    } else {
      toast[type](content, options);
    }
  };

  return { showToast, showMessage };
};

export default ToasterUtils;
