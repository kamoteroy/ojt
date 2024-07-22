import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Link,
  Image,
  Input,
  Button,
} from "@nextui-org/react";
import InnoLogo from "../../images/inno-logo.png";
import { MailIcon } from "../../icons/MailIcon";
import { LockIcon } from "../../icons/LockIcon";
import { BASE_URL } from "../../routes/BaseUrl";
import axios from "axios";
import { useForm } from "react-hook-form";
import AuthToken from "../../auth/AuthToken";
import { useSelector } from "react-redux";

/****************************************************************
 * STATUS               : Pending(no multi userlogin yet)
 * DATE CREATED/UPDATED : 02-22-2024
 * PURPOSE/DESCRIPTION  : Login component
 * PROGRAMMER           : Jay Mar P. Rebanda
 * FUNCTION NAME        : Login
 *****************************************************************/
const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loginError, setLoginError] = useState("");
  const user = useSelector((state) => state.value);
  console.log(user);

  const onSubmitLogin = async (data) => {
    try {
      const response = await axios.post(`${BASE_URL}/login/User`, data);

      const { accessToken, refreshToken } = response.data;

      await AuthToken.setTokens(accessToken, refreshToken);
      // Redirect to index
      window.location.href = "/";
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || "Failed to login";
        setLoginError(errorMessage);
        setTimeout(() => {
          setLoginError("");
        }, 3000);
      } else {
        setLoginError("Failed to connect to the server.");
        setTimeout(() => {
          setLoginError("");
        }, 3000);
      }
    }
  };

  const isInputInvalid = (inputName) => {
    return !!errors[inputName];
  };

  return (
    <div className="flex flex-row-reverse md:flex-row justify-center items-center py-16">
      <div className="w-full md:w-6/12">
        <Card className="w-full h-[35rem]">
          <CardHeader className="flex gap-3 justify-center items-center pt-16">
            <Image
              alt="nextui logo"
              radius="sm"
              src={InnoLogo}
              className="w-[150] h-[150] md:h-[130px] md:w-[130px]"
            />
          </CardHeader>
          <div className="flex items-center justify-center py-3">
            <h1 className="text-xl md:text-2xl font-bold">Member Login</h1>
          </div>

          <Divider />
          <form onSubmit={handleSubmit(onSubmitLogin)}>
            <CardBody className="gap-4">
              <div className="flex flex-col gap-3 px-10">
                <Input
                  autoComplete="off"
                  autoFocus
                  endContent={
                    <MailIcon
                      className={`text-2xl text-default-400 pointer-events-none flex-shrink-0 ${
                        isInputInvalid("Username") ? "text-red-500" : ""
                      }`}
                    />
                  }
                  label="Username"
                  {...register("Username", {
                    required: "Username is required",
                  })}
                  isInvalid={isInputInvalid("Username")}
                  errorMessage={errors.Username && errors.Username.message}
                />
                <Input
                  endContent={
                    <LockIcon
                      className={`text-2xl text-default-400 pointer-events-none flex-shrink-0 ${
                        isInputInvalid("Password") ? "text-red-500" : ""
                      }`}
                    />
                  }
                  autoComplete="off"
                  label="Password"
                  type="password"
                  {...register("Password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long",
                    },
                  })}
                  isInvalid={isInputInvalid("Password")}
                  errorMessage={errors.Password && errors.Password.message}
                />
              </div>
              <div className="flex flex-col gap-3 px-10 pt-5">
                {loginError && <div className="text-red-500">{loginError}</div>}
                <Button
                  color="primary"
                  variant="shadow"
                  type="submit"
                  className="w-full font-bold"
                >
                  LOGIN
                </Button>
              </div>
            </CardBody>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
