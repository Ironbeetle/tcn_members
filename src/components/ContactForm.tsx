import { useState } from "react";
import { useForm } from "react-hook-form";
import useWeb3Forms from "@web3forms/react";
import { buttonVariants } from "../components/ui/button"

export const ContactUs = () => {

  const {register, reset, handleSubmit} = useForm();

  const [isSuccess, setIsSuccess] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const accessKey = "e893cebe-681b-4211-ab05-14b88409ae9c";

  const { submit: onSubmit } = useWeb3Forms({
    access_key: accessKey,
    settings: {
      from_name: "Tataskweyak Cree Nation",
      subject: "New Contact Message from your Website",
      // ... other settings
    },
    onSuccess: (msg) => {
      setIsSuccess(true);
      setResult(msg);
      reset();
    },
    onError: (msg) => {
      setIsSuccess(false);
      setResult(msg);
    },
  });
  return (
  <div className="flex flex-col justify-center items-center w-full p-4" style={{backgroundColor:"rgba(250,250,250,0.5)"}}>
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full justify-center items-center">
      <label className="apptextminib mb-6" htmlFor="name">Name</label>
      <input className="apptextminib mb-6" type="text" {...register("name", { required: true })} id="name" style={{backgroundColor:"rgba(250,250,250,0.5)"}} />
      <label className="apptextminib mb-6" htmlFor="email">Email</label>
      <input className="apptextminib mb-6" type="email" {...register("email", { required: true })} style={{backgroundColor:"rgba(250,250,250,0.5)"}} />
      <label className="apptextminib mb-6" htmlFor="message">Message</label>
      <textarea {...register("message", { required: true })} 
          className="apptextminib mb-6"
          style={{backgroundColor:"rgba(250,250,250,0.5)"}} 
          id="message"></textarea>
      <button className={buttonVariants()} type="submit">Submit Form</button>
    </form>
    {isSuccess && <div className="apptextminib">Form submitted successfully!</div>}
    <div>{result}</div>
  </div>
 );
}